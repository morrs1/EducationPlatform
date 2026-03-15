"""Tests for IoC providers setup."""

from collections import deque

from dishka import Provider, Scope

from answer_service.domain.common.events_collection import EventsCollection
from answer_service.setup.ioc import (
    configs_provider,
    db_provider,
    domain_ports_provider,
    gateways_provider,
    interactors_provider,
    mappers_provider,
    setup_providers,
    vector_store_provider,
)


class TestConfigsProvider:
    """Tests for configs_provider function."""

    def test_configs_provider_returns_provider(self) -> None:
        """Test that configs_provider returns a Provider instance."""
        # Act
        result = configs_provider()

        # Assert
        assert isinstance(result, Provider)
        assert result.scope == Scope.APP


class TestDbProvider:
    """Tests for db_provider function."""

    def test_db_provider_returns_provider(self) -> None:
        """Test that db_provider returns a Provider instance."""
        # Act
        result = db_provider()

        # Assert
        assert isinstance(result, Provider)
        assert result.scope == Scope.REQUEST


class TestVectorStoreProvider:
    """Tests for vector_store_provider function."""

    def test_vector_store_provider_returns_provider(self) -> None:
        """Test that vector_store_provider returns a Provider instance."""
        # Act
        result = vector_store_provider()

        # Assert
        assert isinstance(result, Provider)
        assert result.scope == Scope.APP


class TestDomainPortsProvider:
    """Tests for domain_ports_provider function."""

    def test_domain_ports_provider_returns_provider(self) -> None:
        """Test that domain_ports_provider returns a Provider instance."""
        # Act
        result = domain_ports_provider()

        # Assert
        assert isinstance(result, Provider)
        assert result.scope == Scope.REQUEST


class TestMappersProvider:
    """Tests for mappers_provider function."""

    def test_mappers_provider_returns_provider(self) -> None:
        """Test that mappers_provider returns a Provider instance."""
        # Act
        result = mappers_provider()

        # Assert
        assert isinstance(result, Provider)
        assert result.scope == Scope.APP


class TestGatewaysProvider:
    """Tests for gateways_provider function."""

    def test_gateways_provider_returns_provider(self) -> None:
        """Test that gateways_provider returns a Provider instance."""
        # Act
        result = gateways_provider()

        # Assert
        assert isinstance(result, Provider)
        assert result.scope == Scope.REQUEST


class TestInteractorsProvider:
    """Tests for interactors_provider function."""

    def test_interactors_provider_returns_provider(self) -> None:
        """Test that interactors_provider returns a Provider instance."""
        # Act
        result = interactors_provider()

        # Assert
        assert isinstance(result, Provider)
        assert result.scope == Scope.REQUEST


class TestSetupProviders:
    """Tests for setup_providers function."""

    def test_setup_providers_returns_iterable(self) -> None:
        """Test that setup_providers returns an iterable of providers."""
        # Act
        result = setup_providers()

        # Assert
        assert result is not None
        providers_list = list(result)
        assert (
            len(providers_list) == 8
        )  # configs, db, vector_store, bazario, mappers, domain_ports, gateways, interactors

    def test_setup_providers_order(self) -> None:
        """Test that setup_providers returns providers in correct order."""
        # Act
        result = setup_providers()

        # Assert
        providers_list = list(result)
        assert isinstance(providers_list[0], Provider)  # configs
        assert isinstance(providers_list[1], Provider)  # db
        assert isinstance(providers_list[2], Provider)  # vector_store
        assert isinstance(providers_list[3], Provider)  # mappers
        assert isinstance(providers_list[4], Provider)  # domain_ports
        assert isinstance(providers_list[5], Provider)  # gateways
        assert isinstance(providers_list[6], Provider)  # interactors


class TestMakeEventsCollection:
    """Tests for EventsCollection fixture."""

    def test_events_collection_fixture_creates_empty_collection(
        self,
        events_collection: EventsCollection,
    ) -> None:
        """Test that events_collection fixture creates an empty EventsCollection."""
        # Assert
        assert isinstance(events_collection, EventsCollection)
        assert len(list(events_collection.events)) == 0

    def test_events_collection_fixture_uses_deque(
        self,
        events_collection: EventsCollection,
    ) -> None:
        """Test that events_collection fixture uses deque internally."""
        # Assert
        assert isinstance(events_collection.events, deque)
