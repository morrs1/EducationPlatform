from typing import Final

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from answer_service.application.errors import (
    ApplicationError,
    ConversationNotFoundError,
    LessonAlreadyIndexedError,
    LessonIndexNotFoundError,
    PaginationError,
    UserNotFoundError,
)
from answer_service.domain.common.errors import DomainError


class ExceptionSchema(BaseModel):
    detail: str


def setup_exception_handlers(app: FastAPI) -> None:
    _HTTP_STATUS: Final[dict[type[Exception], int]] = {
        ConversationNotFoundError: status.HTTP_404_NOT_FOUND,
        LessonIndexNotFoundError: status.HTTP_404_NOT_FOUND,
        UserNotFoundError: status.HTTP_404_NOT_FOUND,
        LessonAlreadyIndexedError: status.HTTP_409_CONFLICT,
        PaginationError: status.HTTP_400_BAD_REQUEST,
    }

    @app.exception_handler(ApplicationError)
    async def application_error_handler(_: Request, exc: ApplicationError) -> JSONResponse:
        http_status = _HTTP_STATUS.get(type(exc), status.HTTP_400_BAD_REQUEST)
        return JSONResponse(status_code=http_status, content={"detail": str(exc)})

    @app.exception_handler(DomainError)
    async def domain_error_handler(_: Request, exc: DomainError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content={"detail": str(exc)},
        )
