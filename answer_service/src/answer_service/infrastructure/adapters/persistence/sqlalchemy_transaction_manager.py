import logging
from typing import Final, override

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.infrastructure.errors import EntityAddError, RepoError, RollbackError

logger: Final[logging.Logger] = logging.getLogger(__name__)


class SqlAlchemyTransactionManager(TransactionManager):
    def __init__(self, session: AsyncSession) -> None:
        self._session: Final[AsyncSession] = session

    @override
    async def commit(self) -> None:
        try:
            await self._session.commit()
            logger.debug("Transaction committed.")
        except IntegrityError as e:
            logger.exception("Constraint violation on commit.")
            await self.rollback()
            msg = "Constraint violation."
            raise EntityAddError(msg) from e
        except SQLAlchemyError as e:
            logger.exception("SQLAlchemy error on commit.")
            await self.rollback()
            msg = "Database error on commit."
            raise RepoError(msg) from e

    @override
    async def rollback(self) -> None:
        try:
            await self._session.rollback()
            logger.debug("Transaction rolled back.")
        except SQLAlchemyError as e:
            logger.exception("Rollback failed.")
            msg = "Rollback failed."
            raise RollbackError(msg) from e

    @override
    async def flush(self) -> None:
        try:
            await self._session.flush()
            logger.debug("Session flushed.")
        except IntegrityError as e:
            logger.exception("Constraint violation on flush.")
            msg = "Constraint violation on flush."
            raise EntityAddError(msg) from e
        except SQLAlchemyError as e:
            msg = "Database error on flush."
            raise RepoError(msg) from e
