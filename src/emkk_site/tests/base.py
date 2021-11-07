from src.emkk_site.models import Trip, TripKind
from src.jwt_auth.models import User

from django.test import Client

from uuid import uuid4
import random


class TestEnvironment:
    """Base class with useful data functions with init as Fluent API"""

    def __init__(self):
        self.client = Client()
        self.user = None
        self.trips = []

    def with_user(self, username='admin-test', email='admin-test@mail.com', reviewer=False, issuer=False):
        user = User(username=username, email=email, first_name="Admin", last_name="Admin")
        user.set_password('adminpassword')
        if reviewer:
            user.REVIEWER = True
        if issuer:
            user.ISSUER = True
        user.save()
        self.user = user
        return self

    def with_trips(self, count):
        for i in range(count):
            difficulty = random.randint(1, 6)
            trip = Trip(
                kind=TripKind.CYCLING, group_name="TestGroup",
                difficulty_category=difficulty, global_region="Russia",
                local_region="City", participants_count=12,
                start_date='2021-10-08', end_date='2021-10-28',
                coordinator_info="Info", insurance_info="Info", leader=self.user)
            trip.save()
            self.trips.append(trip)
        return self

    # noinspection PyMethodMayBeStatic
    def _generate_users(self, count):
        for _ in range(count):
            username = str(uuid4())
            email = username + "@mail.com"
            first_name = "User"
            last_name = "Cool"
            password = str(uuid4())
            user = User(
                username=username, email=email,
                first_name=first_name, last_name=last_name,
                password=password)
            yield user

    def create_reviewers(self, count):
        reviewers = []
        for user in self._generate_users(count):
            user.REVIEWER = True
            user.save()
            reviewers.append(user)
        return reviewers

    def create_issuers(self, count):
        issuers = []
        for user in self._generate_users(count):
            user.ISSUER = True
            user.save()
            issuers.append(user)
        return issuers

    # noinspection PyMethodMayBeStatic
    def _get_auth_header(self, user):
        return {'HTTP_AUTHORIZATION': f'Token {user.access_token}'}

    def client_post(self, url, data, set_auth_header=True, user=None):
        if not user:
            user = self.user
        headers = {}
        if set_auth_header:
            headers.update(self._get_auth_header(user))

        return self.client.post(url, data, **headers)

    def client_get(self, url, set_auth_header=True, user=None):
        if not user:
            user = self.user
        headers = {}
        if set_auth_header:
            headers.update(self._get_auth_header(user))

        return self.client.get(url, **headers)
