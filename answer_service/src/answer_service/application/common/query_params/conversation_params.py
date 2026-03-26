from dataclasses import dataclass
from enum import StrEnum

from answer_service.application.common.query_params.pagination import Pagination
from answer_service.application.common.query_params.sorting import SortingOrder


class ConversationSortField(StrEnum):
    id = "id"
    created_at = "created_at"
    status = "status"


@dataclass(frozen=True, slots=True, kw_only=True)
class ConversationListParams:
    pagination: Pagination
    sorting_field: ConversationSortField = ConversationSortField.created_at
    sorting_order: SortingOrder = SortingOrder.DESC
