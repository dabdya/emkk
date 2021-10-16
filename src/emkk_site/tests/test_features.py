from django.test import TestCase, Client

from src.emkk_site.utils.reviewers_count_by_difficulty import get_reviewers_count_by_difficulty
from src.emkk_site.models import Trip, Review, TripKind, TripStatus, TripsOnReviewByUser
from src.jwt_auth.models import User

from collections import defaultdict
import random


class BaseTest:
    """Helpful functions for testing features"""

    # noinspection PyMethodMayBeStatic
    def create_leader(self):
        leader = User(
            username="admin_test", email="admin-test@gmail.com",
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
                difficulty_category=difficulty, district="Russia",
                participants_count=12, start_date='2021-10-08',
                end_date='2021-10-28', coordinator_info="Info",
                insurance_info="Info", leader=leader)
            trip.save()


class TripsForReviewTest(TestCase, BaseTest):
    """Tests check available trips for reviewers.
    Create temporary database, after remove"""

    def setUp(self):
        self.iters = 100
        self.client = Client()
        self.leader = self.create_leader()
        self.generate_trips(self.leader, self.iters)

    def test_trips_with_needed_reviews_count_should_filtered(self):

        trips = Trip.objects.all()
        actual_reviews = defaultdict(int)

        should_filtered = 0

        """Filter trips with needed_reviews <= actual_reviews"""
        for i in range(self.iters):
            trip = random.choices(trips)[0]

            review = Review(
                reviewer=self.leader, trip=trip,
                result=TripStatus.ON_REVIEW, result_comment="GOOD")
            review.save()

            actual_reviews[trip.id] += 1
            needed_reviewers_count = get_reviewers_count_by_difficulty(trip.difficulty_category)
            if actual_reviews[trip.id] == needed_reviewers_count:
                should_filtered += 1

        """Filter trips with needed_reviews <= actual_reviews + reviews_in_work"""
        for i in range(self.iters):
            trip = random.choices(trips)[0]

            TripsOnReviewByUser(user=self.leader, trip=trip).save()
            needed_reviews_count = get_reviewers_count_by_difficulty(trip.difficulty_category)
            actual_reviews[trip.id] += 1
            if actual_reviews[trip.id] == needed_reviews_count:
                should_filtered += 1

        trips = self.client.get('/api/trips/for-review').data
        self.assertEqual(len(trips), self.iters - should_filtered)


class ReviewCreateTest(TestCase, BaseTest):

    def setUp(self):
        trips_count = 1
        self.client = Client()
        self.leader = self.create_leader()
        self.generate_trips(self.leader, trips_count)

    # noinspection PyMethodMayBeStatic
    def test_trip_status_established_to_at_issuer_if_reviews_count_equals_needed_count(self):

        trip = Trip.objects.first()

        needed_reviews_count = get_reviewers_count_by_difficulty(trip.difficulty_category)

        for _ in range(needed_reviews_count):
            self.client.post(f'/api/trips/{trip.id}/reviews', {
                "reviewer": self.leader.id,
                "trip": trip.id,
                "result": TripStatus.ON_REVIEW,
                "result_comment": "GOOD"
            })

        trip = self.client.get(f'/api/trips/{trip.id}').data
        self.assertEqual(trip.get('status'), TripStatus.AT_ISSUER)
