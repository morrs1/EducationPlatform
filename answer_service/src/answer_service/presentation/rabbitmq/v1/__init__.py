from answer_service.presentation.rabbitmq.v1.routes.lesson_index.handlers import (
    lesson_index_rabbit_router,
)
from answer_service.presentation.rabbitmq.v1.routes.user.handlers import (
    user_rabbit_router,
)

__all__ = ["lesson_index_rabbit_router", "user_rabbit_router"]
