from uuid import UUID

from pydantic import BaseModel


class UserRegisteredMessage(BaseModel):
    user_id: UUID


class UserDeletedMessage(BaseModel):
    user_id: UUID
