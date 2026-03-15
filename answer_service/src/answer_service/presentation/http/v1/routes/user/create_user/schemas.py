from uuid import UUID

from pydantic import BaseModel


class CreateUserRequest(BaseModel):
    user_id: UUID
