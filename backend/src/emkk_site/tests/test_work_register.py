from django.test import TestCase

from src.emkk_site.tests.base import TestEnvironment
from src.emkk_site.models import (
    Review, ReviewResult, WorkRegister, TripStatus, ReviewFromIssuer, Trip)
from src.emkk_site.services import get_reviewers_count_by_difficulty

import random


class WorkRegisterTest(TestCase):
    """Common cases for issuer and reviewers"""

    def setUp(self):
        self.env = TestEnvironment() \
            .with_user(reviewer=True, issuer=True) \
            .with_trips(1)

    def test_take_trip_in_work_should_work(self):
        trip = self.env.trips[0]
        self.env.client_post(f'/api/trips/work', data={'trip': trip.id})
        self.assertEqual(WorkRegister.objects.filter(user=self.env.user, trip=trip).count(), 1)

    def test_user_cant_take_same_trip_in_work_several_times(self):
        trip = self.env.trips[0]
        for _ in range(2):
            self.env.client_post(f'/api/trips/work', data={'trip': trip.id})
        self.assertEqual(WorkRegister.objects.filter(user=self.env.user, trip=trip).count(), 1)

    def test_user_cant_take_trip_in_work_if_his_review_for_this_trip_already_exist(self):
        trip = self.env.trips[0]
        review = Review(
            reviewer=self.env.user, trip=trip,
            result=ReviewResult.ACCEPTED, result_comment="GOOD")
        review.save()

        r = self.env.client_post(f'/api/trips/work', data={'trip': trip.id}, user=self.env.user)
        self.assertEqual(r.status_code, 422)

        in_work_count = WorkRegister.objects.filter(user=self.env.user, trip=trip).count()
        self.assertEqual(in_work_count, 0)

    def test_if_user_reviewer_and_issuer_when_available_works_can_be_partitioned_by_role_param(self):
        self.env.trips[0].status = TripStatus.ACCEPTED
        self.env.trips[0].save()

        at_issuer_count = 4
        on_review_count = 6

        for i in range(at_issuer_count):
            self.env.eg.generate_instance_by_model(Trip, status=TripStatus.AT_ISSUER).save()
        for i in range(on_review_count):
            self.env.eg.generate_instance_by_model(Trip, status=TripStatus.ON_REVIEW).save()

        r = self.env.client_get('/api/trips/work?available=issuer')
        self.assertEqual(at_issuer_count, len(r.data))

        r = self.env.client_get('/api/trips/work?available=reviewer')
        self.assertEqual(on_review_count, len(r.data))

        r = self.env.client_get('/api/trips/work?available=all')
        self.assertEqual(on_review_count + at_issuer_count, len(r.data))


class WorkRegisterTestForReviewer(TestCase):
    """Tests check available trips for reviewers"""

    def setUp(self):
        self.trips_count = 100
        self.env = TestEnvironment() \
            .with_user(reviewer=True) \
            .with_trips(self.trips_count)

    def test_trips_with_needed_reviews_count_should_filtered(self):

        for trip in self.env.trips:
            trip.status = TripStatus.ON_REVIEW
            trip.save()

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

        trips_for_review = len(self.env.client_get(f'/api/trips/work?available=reviewer').data)
        self.assertEqual(trips_for_review, self.trips_count - should_filtered)


class WorkRegisterTestForIssuer(TestCase):
    """Tests check available trips for issuers"""

    def setUp(self):
        self.trips_count = 20
        self.env = TestEnvironment() \
            .with_user(issuer=True) \
            .with_trips(self.trips_count, status='on_review')

    def test_all_trips_with_on_reviews_status_should_filtered(self):
        trips = self.env.trips

        """Set AT_ISSUER status to some trips"""
        available_trips_count_expect = len(trips) // 3
        for i in range(available_trips_count_expect):
            trips[i].status = TripStatus.AT_ISSUER
            trips[i].save()

        available_trips_count_real = len(self.env.client_get(f'/api/trips/work?available=issuer').data)
        self.assertEqual(available_trips_count_expect, available_trips_count_real)

    def test_issuer_can_create_issuer_review_without_taking_in_work(self):
        trip = self.env.trips[0]
        trip.status = TripStatus.AT_ISSUER
        trip.save()

        issuer_review = {"result": TripStatus.REJECTED,
                         "result_comment": "Все плохо"}

        response = self.env.client_post(f'/api/trips/{trip.id}/reviews-from-issuer', issuer_review)
        self.assertEqual(response.status_code, 201)
        review_count = ReviewFromIssuer.objects.filter(trip=trip).count()
        self.assertEqual(review_count, 1)
