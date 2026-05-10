from typing import Annotated
from uuid import UUID

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class UserRegisteredMessage(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: Annotated[
        UUID,
        Field(
            description="User identifier.",
            validation_alias=AliasChoices("user_id", "userId", "userID"),
        ),
    ]


class UserDeletedMessage(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: Annotated[
        UUID,
        Field(
            description="User identifier.",
            validation_alias=AliasChoices("user_id", "userId", "userID"),
        ),
    ]
