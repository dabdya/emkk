from django.test import TestCase

from src.emkk_site.tests.base import TestEnvironment
from src.emkk_site.services import get_reviewers_count_by_difficulty
from src.emkk_site.models import Review, ReviewResult, WorkRegister

import random


class WorkRegisterTest(TestCase):
    """Tests check available trips for work"""

    def setUp(self):
        self.trips_count = 100
        self.env = TestEnvironment()\
            .with_user(reviewer=True)\
            .with_trips(self.trips_count)

    def test_trips_with_needed_reviews_count_should_filtered(self):

        reviewers = self.env.create_reviewers(self.trips_count)
        """Create reviews for random trips"""
        for i in range(self.trips_count):
            trip = random.choices(self.env.trips)[0]

            review = Review(
                reviewer=reviewers[i], trip=trip,
                result=ReviewResult.ACCEPTED, result_comment="GOOD")
            review.save()

        """Take random trips in work"""
        for i in range(self.trips_count):
            trip = random.choices(self.env.trips)[0]
            if not WorkRegister.objects.filter(user=reviewers[i], trip=trip):
                WorkRegister(user=reviewers[i], trip=trip).save()

        should_filtered = 0

        for trip in self.env.trips:
            needed_reviews_count = get_reviewers_count_by_difficulty(trip.difficulty_category)
            in_work_reviews = WorkRegister.objects.filter(trip=trip).count()
            actual_reviews = Review.objects.filter(trip=trip).count()
            if actual_reviews + in_work_reviews >= needed_reviews_count:
                should_filtered += 1

        trips_for_review = len(self.env.client_get(f'/api/trips/work').data)
        self.assertEqual(trips_for_review, self.trips_count - should_filtered)

    def test_reviewer_cant_take_trip_in_work_if_his_review_for_this_trip_already_exist(self):

        trip = self.env.trips[0]
        review = Review(
            reviewer=self.env.user, trip=trip,
            result=ReviewResult.ACCEPTED, result_comment="GOOD")
        review.save()

        r = self.env.client_post(f'/api/trips/work', data={'trip': trip.id}, user=self.env.user)
        self.assertEqual(r.status_code, 422)

        in_work_count = WorkRegister.objects.filter(user=self.env.user, trip=trip).count()
        self.assertEqual(in_work_count, 0)

    def test_take_trip_in_work_should_work(self):
        trip = self.env.trips[0]
        self.env.client_post(f'/api/trips/work', data={'trip': trip.id})
        self.assertEqual(WorkRegister.objects.filter(user=self.env.user, trip=trip).count(), 1)

    def test_one_user_cant_take_same_trip_in_work_several_times(self):
        trip = self.env.trips[0]
        for _ in range(2):
            self.env.client_post(f'/api/trips/work', data={'trip': trip.id})
        self.assertEqual(WorkRegister.objects.filter(user=self.env.user, trip=trip).count(), 1)
