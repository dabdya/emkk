from django.test import TestCase, Client

from src.emkk_site.services import get_reviewers_count_by_difficulty
from src.emkk_site.models import Trip, Review, TripKind, TripStatus, ReviewResult, TripsOnReviewByUser
from src.jwt_auth.models import User

from collections import defaultdict
import random


class BaseTest:
    """Helpful functions for testing features"""

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
                result=ReviewResult.ACCEPTED, result_comment="GOOD")
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
        self.client = Client()
        self.leader = self.create_leader()

    def create_post_review(self, url, trip_id, status, reviewer_id=None, token=None):
        headers = {'HTTP_AUTHORIZATION': f'Token {self.leader.access_token if not token else token}', }
        return self.client.post(url, data={
            "reviewer": self.leader.id if not reviewer_id else reviewer_id,
            "trip": trip_id,
            "result": status,
            "result_comment": "GOOD"
        }, **headers)

    # noinspection PyMethodMayBeStatic
    def take_trip_in_work(self, user, trip):
        TripsOnReviewByUser(trip=trip, user=user).save()

    # noinspection PyMethodMayBeStatic
    def test_trip_status_established_to_at_issuer_if_reviews_count_equals_needed_count(self):
        self.leader.REVIEWER = True
        self.leader.save()

        self.generate_trips(self.leader, 1)
        trip = Trip.objects.first()

        needed_reviews_count = get_reviewers_count_by_difficulty(trip.difficulty_category)

        for _ in range(needed_reviews_count):
            self.take_trip_in_work(self.leader, trip)
            self.create_post_review(f'/api/trips/{trip.id}/reviews', trip.id, ReviewResult.ACCEPTED)

        headers = {'HTTP_AUTHORIZATION': f'Token {self.leader.access_token}', }
        trip = self.client.get(f'/api/trips/{trip.id}', **headers).data
        self.assertEqual(trip.get('status'), TripStatus.AT_ISSUER)

    def test_trip_status_established_to_issuer_result_if_review_come_from_issuer(self):

        self.generate_trips(self.leader, 1)
        trip = Trip.objects.first()
        self.leader.ISSUER = True
        self.leader.save()

        trip.status = TripStatus.AT_ISSUER
        trip.save()

        issuer_result = ReviewResult.ACCEPTED

        self.create_post_review(f'/api/trips/{trip.id}/reviews-from-issuer', trip.id, issuer_result)

        headers = {'HTTP_AUTHORIZATION': f'Token {self.leader.access_token}', }
        trip = self.client.get(f'/api/trips/{trip.id}', **headers).data
        self.assertEqual(trip.get('status'), issuer_result)

    def test_trip_status_no_change_to_issuer_result_if_trip_on_review(self):

        self.generate_trips(self.leader, 1)
        trip = Trip.objects.first()
        self.leader.ISSUER = True
        self.leader.save()

        self.create_post_review(f'/api/trips/{trip.id}/reviews-from-issuer', trip.id, ReviewResult.ACCEPTED)
        trip = self.client.get(f'/api/trips/{trip.id}').data
        self.assertNotEqual(trip.get('status'), ReviewResult.ACCEPTED)

    def test_reviewer_cant_create_review_if_trip_not_in_work(self):

        self.generate_trips(self.leader, 1)
        trip = Trip.objects.first()
        self.leader.REVIEWER = True
        self.leader.save()

        """Trip not in work"""
        self.assertEqual(TripsOnReviewByUser.objects.filter(trip=trip).count(), 0)

        """Try create review. Expected fail"""
        self.create_post_review(f'/api/trips/{trip.id}/reviews', trip.id, ReviewResult.ACCEPTED)
        self.assertEqual(Review.objects.filter(trip=trip).count(), 0)

    def test_take_trip_on_review_should_work(self):

        self.generate_trips(self.leader, 1)
        trip = Trip.objects.first()
        self.leader.REVIEWER = True
        self.leader.save()

        headers = {'HTTP_AUTHORIZATION': f'Token {self.leader.access_token}', }
        self.client.post(f'/api/trips/{trip.id}/take-on-review', **headers)
        self.assertEqual(TripsOnReviewByUser.objects.filter(user=self.leader, trip=trip).count(), 1)

    def test_reviewer_cant_create_review_if_trip_in_work_but_not_belong_him(self):

        self.generate_trips(self.leader, 1)
        trip = Trip.objects.first()
        self.leader.REVIEWER = True
        self.leader.save()

        reviewer_which_take_in_work = self.create_leader(username="other", email="other@gmail.com")
        reviewer_which_take_in_work.REVIEWER = True
        reviewer_which_take_in_work.save()

        """Other reviewer take review in work, but not create review"""
        self.create_post_review(
            f'/api/trips/{trip.id}/take-on-review', trip.id,
            ReviewResult.ACCEPTED, reviewer_id=reviewer_which_take_in_work.id,
            token=reviewer_which_take_in_work.access_token)

        self.assertEqual(TripsOnReviewByUser.objects.filter(user=reviewer_which_take_in_work, trip=trip).count(), 1)

        """Leader which dint take review in work try create review on trip. 
           But trip in table TripsOnReviewByUser. Expected fail."""
        self.create_post_review(f'/api/trips/{trip.id}/reviews', trip.id, ReviewResult.ACCEPTED)
        self.assertEqual(Review.objects.filter(trip=trip).count(), 0)


class TripCreateTest(TestCase, BaseTest):

    def setUp(self):
        self.client = Client()
        self.leader = self.create_leader()

        self.trip = {
            'kind': TripKind.CYCLING,
            'difficulty_category': 1,
            'group_name': 'TestGroup',
            'global_region': 'Russia',
            'local_region': 'City',
            'participants_count': 12,
            'start_date': '2021-10-08',
            'end_date': '2021-10-28',
            'coordinator_info': 'Info',
            'insurance_info': 'Info'
        }

    def test_trip_create_take_leader_from_authorization(self):
        """Send post without leaders, server should take leader from auth header"""
        headers = {'HTTP_AUTHORIZATION': f'Token {self.leader.access_token}', }

        response = self.client.post(f'/api/trips', self.trip, **headers)

        trip_id = response.data['id']
        trip = Trip.objects.get(pk=trip_id)
        self.assertEqual(trip.leader, self.leader)

    def test_trip_get_restricted_list_if_not_authorized(self):
        self.generate_trips(self.leader, 1)
        response = self.client.get('/api/trips')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data[0].get('insurance_info', False))

    def test_cant_create_trip_if_not_authorized(self):
        response = self.client.post(f'/api/trips', self.trip)
        self.assertEqual(response.status_code, 403)
