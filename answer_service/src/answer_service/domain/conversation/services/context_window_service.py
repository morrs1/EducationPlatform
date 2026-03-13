from answer_service.domain.common.service import BaseDomainService
from answer_service.domain.conversation.entities.conversation import Conversation
from answer_service.domain.conversation.entities.message import Message
from answer_service.domain.conversation.value_objects.statuses import MessageStatus

# Rough chars-per-token estimate (GPT-family average).
# Used only for budget estimation — not for billing or strict limits.
_CHARS_PER_TOKEN: int = 4

DEFAULT_MAX_MESSAGES: int = 10


class ContextWindowService(BaseDomainService):
    """Selects messages from conversation history for the LLM context window.

    This is domain logic because deciding *which* history to include is a
    business decision: more context → better coherence, but also higher
    cost and latency.  The service encapsulates that trade-off in one place
    so that application handlers don't hard-code the selection policy.

    The service operates purely on domain objects — it has no dependency on
    any LLM or tokenizer infrastructure.  Token estimation is intentionally
    approximate (chars / 4) and documented as such.
    """

    def select_for_context(
        self,
        conversation: Conversation,
        max_messages: int = DEFAULT_MAX_MESSAGES,
    ) -> list[Message]:
        """Return the last *max_messages* completed Q&A pairs.

        Only COMPLETED messages are included — PENDING and FAILED ones carry
        no useful answer for the LLM and would add noise to the context.

        :param conversation: The conversation to read history from.
        :param max_messages: Maximum number of messages to include.
        :return: Ordered list (oldest first) of completed messages.
        """
        completed = [
            m for m in conversation.messages
            if m.status == MessageStatus.COMPLETED
        ]
        return completed[-max_messages:]

    def estimate_tokens(self, messages: list[Message]) -> int:
        """Rough token count estimate for the given message list.

        Uses a chars/4 heuristic — sufficient for deciding whether to trim
        the context window further before calling the LLM port.

        :param messages: Messages whose combined text to estimate.
        :return: Approximate token count.
        """
        total_chars = sum(
            len(str(m.question)) + (len(str(m.answer)) if m.answer is not None else 0)
            for m in messages
        )
        return total_chars // _CHARS_PER_TOKEN

    def select_within_token_budget(
        self,
        conversation: Conversation,
        token_budget: int,
        max_messages: int = DEFAULT_MAX_MESSAGES,
    ) -> list[Message]:
        """Return as many recent completed messages as fit within *token_budget*.

        Starts from the most recent message and works backwards, stopping
        when the next message would exceed the budget.

        :param conversation: The conversation to read history from.
        :param token_budget: Maximum allowed token estimate for the returned messages.
        :param max_messages: Hard cap on the number of messages regardless of budget.
        :return: Ordered list (oldest first) of messages within the budget.
        """
        candidates = self.select_for_context(conversation, max_messages)
        selected: list[Message] = []
        used_tokens = 0

        for message in reversed(candidates):
            msg_tokens = self.estimate_tokens([message])
            if used_tokens + msg_tokens > token_budget:
                break
            selected.append(message)
            used_tokens += msg_tokens

        selected.reverse()  # restore chronological order
        return selected
