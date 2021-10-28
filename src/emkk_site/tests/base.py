from src.emkk_site.models import Trip, TripKind
from src.jwt_auth.models import User

import random


class BaseTest:
    """Base class with useful data functions"""

    # noinspection PyMethodMayBeStatic
    def create_leader(self, username="admin_test", email="admin-test@gmail.com"):
        leader = User(
            username=username, email=email,
            first_name="Admin", last_name="Admin")
        leader.set_password("adminpassword")
        leader.save()
        return leader

    # noinspection PyMethodMayBeStatic
    def generate_trips(self, leader, count):
        """Generate and save {count} trips with difference difficulty"""
        for i in range(count):
            difficulty = random.randint(1, 6)
            trip = Trip(
                kind=TripKind.CYCLING, group_name="TestGroup",
                difficulty_category=difficulty,
                global_region="Russia", local_region="City",
                participants_count=12, start_date='2021-10-08',
                end_date='2021-10-28', coordinator_info="Info",
                insurance_info="Info", leader=leader)
            trip.save()
