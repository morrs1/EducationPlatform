from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class UserResponse(BaseModel):
    user_id: UUID
    created_at: datetime
    updated_at: datetime
