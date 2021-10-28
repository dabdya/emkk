from django.test import TestCase, Client

from src.emkk_site.tests.base import BaseTest
from src.emkk_site.services import get_reviewers_count_by_difficulty
from src.emkk_site.models import Trip, Review, ReviewResult, WorkRegister

import random


class WorkRegisterTest(TestCase, BaseTest):
    """Tests check available trips for work"""

    def setUp(self):
        self.trips_count = 100
        self.client = Client()
        self.leader = self.create_leader()
        self.generate_trips(self.leader, self.trips_count)

    def test_trips_with_needed_reviews_count_should_filtered(self):

        trips = Trip.objects.all()
        self.leader.REVIEWER = True
        self.leader.save()

        """Create reviews for random trips"""
        for i in range(self.trips_count):
            trip = random.choices(trips)[0]

            review = Review(
                reviewer=self.leader, trip=trip,
                result=ReviewResult.ACCEPTED, result_comment="GOOD")
            review.save()

        """Take random trips in work"""
        for i in range(self.trips_count):
            trip = random.choices(trips)[0]
            WorkRegister(user=self.leader, trip=trip).save()

        should_filtered = 0

        for trip in trips:
            needed_reviews_count = get_reviewers_count_by_difficulty(trip.difficulty_category)
            in_work_reviews = len(WorkRegister.objects.filter(trip=trip))
            actual_reviews = len(Review.objects.filter(trip=trip))

            if actual_reviews + in_work_reviews >= needed_reviews_count:
                should_filtered += 1

        headers = {'HTTP_AUTHORIZATION': f'Token {self.leader.access_token}', }
        trips_for_review = len(self.client.get('/api/trips/work', **headers).data)
        self.assertEqual(trips_for_review, self.trips_count - should_filtered)

    def test_take_trip_in_work_should_work(self):

        self.generate_trips(self.leader, 1)
        trip = Trip.objects.first()
        self.leader.REVIEWER = True
        self.leader.save()

        headers = {'HTTP_AUTHORIZATION': f'Token {self.leader.access_token}', }
        r = self.client.post(f'/api/trips/work', data={'trip': trip.id}, **headers)
        print()
        self.assertEqual(WorkRegister.objects.filter(user=self.leader, trip=trip).count(), 1)
