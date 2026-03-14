import logging
from dataclasses import dataclass
from typing import Final, final
from uuid import UUID

from answer_service.application.common.ports.conversation_repository import ConversationRepository
from answer_service.application.common.ports.embedding_port import EmbeddingPort
from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.llm_port import LLMMessage, LLMPort
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.application.common.ports.vector_search_port import VectorSearchPort
from answer_service.application.common.views.conversation_views import AnswerView
from answer_service.application.errors import ConversationNotFoundError
from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.conversation.factories.conversation_factory import ConversationFactory
from answer_service.domain.conversation.services.context_window_service import ContextWindowService
from answer_service.domain.conversation.value_objects.answer import Answer
from answer_service.domain.conversation.value_objects.message_id import MessageId
from answer_service.domain.conversation.value_objects.model_name import ModelName
from answer_service.domain.conversation.value_objects.question import Question
from answer_service.domain.conversation.value_objects.token_usage import TokenUsage

logger: Final[logging.Logger] = logging.getLogger(__name__)

_SYSTEM_PROMPT = (
    "You are a helpful educational assistant. "
    "Answer the student's question using only the provided lesson context. "
    "Be concise, clear, and accurate."
)
_DEFAULT_MODEL = "gpt-4o"
_TOP_K_CHUNKS = 5
_TOKEN_BUDGET = 3000


@dataclass(frozen=True, slots=True, kw_only=True)
class AskQuestionCommand:
    conversation_id: UUID
    question: str


@final
class AskQuestionCommandHandler:
    def __init__(
        self,
        transaction_manager: TransactionManager,
        conversation_repository: ConversationRepository,
        conversation_factory: ConversationFactory,
        context_window_service: ContextWindowService,
        embedding_port: EmbeddingPort,
        vector_search_port: VectorSearchPort,
        llm_port: LLMPort,
        events_collection: EventsCollection,
        event_bus: EventBus,
    ) -> None:
        self._transaction_manager: Final[TransactionManager] = transaction_manager
        self._conversation_repository: Final[ConversationRepository] = conversation_repository
        self._conversation_factory: Final[ConversationFactory] = conversation_factory
        self._context_window_service: Final[ContextWindowService] = context_window_service
        self._embedding_port: Final[EmbeddingPort] = embedding_port
        self._vector_search_port: Final[VectorSearchPort] = vector_search_port
        self._llm_port: Final[LLMPort] = llm_port
        self._events_collection: Final[EventsCollection] = events_collection
        self._event_bus: Final[EventBus] = event_bus

    async def __call__(self, data: AskQuestionCommand) -> AnswerView:
        logger.info(
            "ask_question: started. conversation_id='%s'.",
            data.conversation_id,
        )

        question = Question(content=data.question)

        # 1. Load conversation — must already exist
        conversation = await self._conversation_repository.get_by_id(data.conversation_id)
        if conversation is None:
            msg = f"Conversation '{data.conversation_id}' not found."
            raise ConversationNotFoundError(msg)

        # 2. Add the question — creates Message with PENDING status
        message = self._conversation_factory.create_message(conversation, question)

        # 3. Retrieve relevant chunks from vector store
        query_vector = await self._embedding_port.embed(data.question)
        search_results = await self._vector_search_port.search(
            query_vector=query_vector,
            lesson_id=conversation.lesson_id,
            top_k=_TOP_K_CHUNKS,
        )
        context_chunks = [r.content for r in search_results]
        logger.debug("ask_question: retrieved chunks. chunks_count=%d.", len(context_chunks))

        # 4. Build conversation history for context window
        history_messages = self._context_window_service.select_within_token_budget(
            conversation=conversation,
            token_budget=_TOKEN_BUDGET,
        )
        history = [
            item
            for msg in history_messages
            if msg.answer is not None
            for item in (
                LLMMessage(role="user", content=str(msg.question)),
                LLMMessage(role="assistant", content=str(msg.answer)),
            )
        ]

        # 5. Generate answer via LLM
        try:
            llm_response = await self._llm_port.generate(
                system_prompt=_SYSTEM_PROMPT,
                history=history,
                context_chunks=context_chunks,
                question=data.question,
                model_name=_DEFAULT_MODEL,
            )
        except Exception as exc:
            conversation.mark_answer_failed(
                message_id=MessageId(message.id),
                reason=str(exc),
            )
            logger.error("ask_question: llm generation failed. error='%s'.", exc)
            await self._conversation_repository.save(conversation)
            await self._transaction_manager.flush()
            await self._event_bus.publish(self._events_collection.pull_events())
            await self._transaction_manager.commit()
            raise

        # 6. Set answer on the conversation aggregate
        answer = Answer(
            content=llm_response.content,
            token_usage=TokenUsage(
                input_tokens=llm_response.input_tokens,
                output_tokens=llm_response.output_tokens,
            ),
            model_name=ModelName(value=llm_response.model_name),
        )
        conversation.set_answer(message_id=MessageId(message.id), answer=answer)

        # 7. Persist and publish events
        await self._conversation_repository.save(conversation)
        await self._transaction_manager.flush()
        await self._event_bus.publish(self._events_collection.pull_events())
        await self._transaction_manager.commit()

        logger.info("ask_question: done. model='%s'.", llm_response.model_name)

        return AnswerView(
            conversation_id=conversation.id,
            message_id=message.id,
            answer_content=llm_response.content,
            model_name=llm_response.model_name,
            input_tokens=llm_response.input_tokens,
            output_tokens=llm_response.output_tokens,
        )
