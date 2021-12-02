from django.test import TestCase

from src.emkk_site.tests.base import TestEnvironment
from src.emkk_site.models import Review, TripStatus, ReviewResult
from src.emkk_site.services import get_reviewers_count_by_difficulty


class ReviewTest(TestCase):

    def setUp(self):
        self.trips_count = 1
        self.env = TestEnvironment().with_user(reviewer=True) \
            .with_trips(self.trips_count, status=TripStatus.ON_REVIEW)

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
            f'/api/trips/{trip.id}/reviews-from-issuer', data=review_data, user=issuer)

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

    def test_issuer_cant_create_review_twice_for_one_trip(self):
        trip = self.env.trips[0]
        trip.status = TripStatus.AT_ISSUER
        trip.save()

        self.env.user.ISSUER = True
        self.env.user.save()

        r = self.env.client_post(
            f'/api/trips/{trip.id}/reviews-from-issuer',
            data=self.get_review_data(trip.id), user=self.env.user)

        self.assertEqual(r.status_code, 201)

        r = self.env.client_post(
            f'/api/trips/{trip.id}/reviews-from-issuer',
            data=self.get_review_data(trip.id), user=self.env.user)

        self.assertEqual(r.status_code, 422)
