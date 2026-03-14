from dishka import Provider, Scope
from typing import Final, Iterable

from sqlalchemy.ext.asyncio import AsyncSession

from answer_service.infrastructure.persistence.provider import get_engine, get_sessionmaker, get_session
from answer_service.setup.configs.asgi_config import ASGIConfig
from answer_service.setup.configs.database_config import PostgresConfig, SQLAlchemyConfig


def configs_provider() -> Provider:
    provider: Final[Provider] = Provider(scope=Scope.APP)
    provider.from_context(provides=ASGIConfig)
    provider.from_context(provides=PostgresConfig)
    provider.from_context(provides=SQLAlchemyConfig)
    return provider

def db_provider() -> Provider:
    provider: Final[Provider] = Provider(scope=Scope.REQUEST)
    provider.provide(get_engine, scope=Scope.APP)
    provider.provide(get_sessionmaker, scope=Scope.APP)
    provider.provide(get_session, provides=AsyncSession)
    return provider

def domain_ports_provider() -> Provider:
    provider: Final[Provider] = Provider(scope=Scope.REQUEST)
    return provider

def gateways_provider() -> Provider:
    provider: Final[Provider] = Provider(scope=Scope.REQUEST)
    return provider

def interactors_provider() -> Provider:
    provider: Final[Provider] = Provider(scope=Scope.REQUEST)
    return provider

def setup_providers() -> Iterable[Provider]:
    return (
        configs_provider(),
        db_provider(),
        domain_ports_provider(),
        gateways_provider(),
        interactors_provider(),
    )