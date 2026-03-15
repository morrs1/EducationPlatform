from dataclasses import dataclass
from enum import StrEnum

from answer_service.application.common.query_params.pagination import Pagination
from answer_service.application.common.query_params.sorting import SortingOrder


class UserSortField(StrEnum):
    id = "id"
    created_at = "created_at"


@dataclass(frozen=True, slots=True, kw_only=True)
class UserListParams:
    pagination: Pagination
    sorting_field: UserSortField = UserSortField.created_at
    sorting_order: SortingOrder = SortingOrder.DESC
