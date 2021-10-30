from django.test import TestCase

from src.emkk_site.tests.base import TestEnvironment
from src.emkk_site.services import get_reviewers_count_by_difficulty
from src.emkk_site.models import Trip, Review, TripKind, TripStatus, ReviewResult, WorkRegister


class ReviewTest(TestCase):

    def setUp(self):
        self.trips_count = 1
        self.env = TestEnvironment() \
            .with_user(reviewer=True) \
            .with_trips(self.trips_count)

    # noinspection PyMethodMayBeStatic
    def get_review_data(self, trip_id):
        return {
            "trip": trip_id,
            "result": ReviewResult.ACCEPTED,
            "result_comment": "GOOD"
        }

    # noinspection PyMethodMayBeStatic
    def test_trip_status_established_to_at_issuer_if_reviews_count_equals_needed_count(self):

        trip = self.env.trips[0]
        needed_reviews_count = get_reviewers_count_by_difficulty(trip.difficulty_category)

        reviewers = self.env.create_reviewers(needed_reviews_count)
        for i in range(needed_reviews_count):
            self.env.client_post(f'/api/trips/work', data={'trip': trip.id}, user=reviewers[i])
            self.env.client_post(
                f'/api/trips/{trip.id}/reviews',
                data=self.get_review_data(trip.id), user=reviewers[i])

        trip = self.env.client_get(f'/api/trips/{trip.id}').data
        self.assertEqual(trip.get('status'), TripStatus.AT_ISSUER)

    def test_trip_status_established_to_issuer_result_if_review_come_from_issuer(self):

        trip = self.env.trips[0]
        trip.status = TripStatus.AT_ISSUER
        trip.save()

        issuer = self.env.create_issuers(1)[0]
        issuer_result = ReviewResult.ACCEPTED
        review_data = self.get_review_data(trip.id)
        review_data['result'] = issuer_result

        self.env.client_post(f'/api/trips/work', data={'trip': trip.id}, user=issuer)
        self.env.client_post(
            f'/api/trips/{trip.id}/reviews', data=review_data, user=issuer)

        trip = self.env.client_get(f'/api/trips/{trip.id}').data
        self.assertEqual(trip.get('status'), issuer_result)

    def test_trip_status_no_change_to_issuer_result_if_trip_on_review(self):

        trip = self.env.trips[0]

        issuer = self.env.create_issuers(1)[0]
        issuer_result = ReviewResult.ACCEPTED
        review_data = self.get_review_data(trip.id)
        review_data['result'] = issuer_result

        self.env.client_post(
            f'/api/trips/{trip.id}/reviews-from-issuer',
            data=self.get_review_data(trip.id), user=issuer)

        trip = self.env.client_get(f'/api/trips/{trip.id}').data
        self.assertNotEqual(trip.get('status'), issuer_result)

    def test_reviewer_cant_create_review_if_trip_not_in_work(self):

        trip = self.env.trips[0]
        reviewer = self.env.create_reviewers(1)[0]

        """Trip not in work"""
        self.assertEqual(WorkRegister.objects.filter(trip=trip).count(), 0)

        """Try create review. Expected fail"""
        self.env.client_post(
            f'/api/trips/{trip.id}/reviews',
            data=self.get_review_data(trip.id), user=reviewer)
        self.assertEqual(Review.objects.filter(trip=trip).count(), 0)

    def test_reviewer_cant_create_review_if_trip_in_work_but_not_belong_him(self):

        trip = self.env.trips[0]
        reviewer_which_take_in_work = self.env.create_reviewers(1)[0]

        """Other reviewer take review in work, but not create review"""
        self.env.client_post(
            f'/api/trips/work',
            data=self.get_review_data(trip.id), user=reviewer_which_take_in_work)

        self.assertEqual(WorkRegister.objects.filter(user=reviewer_which_take_in_work, trip=trip).count(), 1)

        reviewer_which_not_take = self.env.create_reviewers(1)[0]
        """Leader which didnt take review in work try create review on trip.
           But trip in table TripsOnReviewByUser. Expected fail."""
        self.env.client_post(
            f'/api/trips/{trip.id}/reviews',
            data=self.get_review_data(trip.id), user=reviewer_which_not_take)
        self.assertEqual(Review.objects.filter(trip=trip).count(), 0)

    def test_reviewer_can_create_only_one_review_for_one_trip(self):

        trip = self.env.trips[0]

        """Reviewer try create several reviews for one trip. Expected fail"""
        for _ in range(2):

            """Reviewer take trip in work"""
            self.env.client_post(
                f'/api/trips/work',
                data=self.get_review_data(trip.id), user=self.env.user)

            """Create review"""
            self.env.client_post(
                f'/api/trips/{trip.id}/reviews',
                data=self.get_review_data(trip.id), user=self.env.user)

        reviews_count = Review.objects.filter(reviewer=self.env.user, trip=trip).count()
        self.assertEqual(reviews_count, 1)
