from src.emkk_site.models import Trip, TripStatus
from src.jwt_auth.models import User

from django.test import Client
from src.emkk_site.utils import EntityGenerator


class TestEnvironment:
    """Base class with useful data functions with init as Fluent API"""

    def __init__(self):
        self.eg = EntityGenerator()
        self.client = Client()
        self.user = None
        self.trips = []

    def with_user(self, reviewer=False, issuer=False):
        user = self.eg.generate_instance_by_model(
            User, REVIEWER=reviewer, ISSUER=issuer, is_active=True)
        user.save()
        self.user = user
        return self

    def with_trips(self, count, **kwargs):
        for i in range(count):
            trip = self.eg.generate_instance_by_model(Trip, **kwargs)
            trip.save()
            self.trips.append(trip)
        self.trips[0].status = TripStatus.ON_REVIEW  # any status except rejected
        self.trips[0].save()
        return self

    def _generate_users(self, count, reviewer=False, issuer=False):
        users = []
        for _ in range(count):
            user = self.eg.generate_instance_by_model(
                User, REVIEWER=reviewer, ISSUER=issuer, is_active=True)
            user.save()
            users.append(user)
        return users

    def create_reviewers(self, count):
        return self._generate_users(count, reviewer=True)

    def create_issuers(self, count):
        return self._generate_users(count, issuer=True)

    # noinspection PyMethodMayBeStatic
    def _get_auth_header(self, user):
        return {'HTTP_AUTHORIZATION': f'Token {user.access_token}'}

    def client_post(self, url, data, set_auth_header=True, user=None, **headers):
        if not user:
            user = self.user
        if set_auth_header:
            headers.update(self._get_auth_header(user))

        return self.client.post(url, data, content_type='application/json', **headers)

    def client_patch(self, url, data, set_auth_header=True, user=None, **headers):
        if not user:
            user = self.user
        if set_auth_header:
            headers.update(self._get_auth_header(user))

        return self.client.patch(url, data, content_type='application/json', **headers)

    def client_delete(self, url, data=None, set_auth_header=True, user=None, **headers):
        if not user:
            user = self.user
        if set_auth_header:
            headers.update(self._get_auth_header(user))
        return self.client.delete(url, data, content_type='application/json', **headers)

    def client_get(self, url, set_auth_header=True, user=None, **headers):
        if not user:
            user = self.user
        if set_auth_header:
            headers.update(self._get_auth_header(user))

        return self.client.get(url, **headers)
