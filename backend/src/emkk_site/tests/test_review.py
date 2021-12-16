from django.test import TestCase
from django.db import IntegrityError
from django.core import mail

from src.emkk_site.tests.base import TestEnvironment
from src.emkk_site.models import (
    Review, TripStatus, ReviewResult, TripKind, UserExperience, Trip, ReviewFromIssuer)
from src.emkk_site.services import get_reviewers_count_by_difficulty
from src.jwt_auth.models import User


class ReviewTest(TestCase):

    def setUp(self):
        self.trips_count = 2
        self.env = TestEnvironment().with_user(reviewer=True) \
            .with_trips(self.trips_count, status=TripStatus.ON_REVIEW)

    # noinspection PyMethodMayBeStatic
    def get_review_data(self, trip_id):
        return {
            "trip": trip_id,
            "result": ReviewResult.ACCEPTED,
            "result_comment": "GOOD"
        }

    def test_trip_status_established_to_at_issuer_if_reviews_count_equals_needed_count(self):

        user = self.env.eg.generate_instance_by_model(
            User, is_active=True, REVIEWER=False, ISSUER=False, SECRETARY=False)
        trip = self.env.eg.generate_instance_by_model(Trip, leader=user, status=TripStatus.ON_REVIEW)
        user.save()
        trip.save()
        needed_reviews_count = get_reviewers_count_by_difficulty(trip.difficulty_category)

        reviewers = self.env.create_reviewers(needed_reviews_count)
        for i in range(needed_reviews_count):
            r = self.env.client_post(
                f'/api/trips/{trip.id}/reviews',
                data=self.get_review_data(trip.id), user=reviewers[i])
            self.assertEqual(r.status_code, 201)

        r = self.env.client_get(f'/api/trips/{trip.id}', user=user)
        self.assertEqual(r.data.get('status'), TripStatus.AT_ISSUER)

    def test_trip_status_established_to_issuer_result_if_review_come_from_issuer(self):

        trip = self.env.eg.generate_instance_by_model(Trip, status=TripStatus.AT_ISSUER)
        trip.save()

        issuer = self.env.create_issuers(1)[0]
        issuer_result = ReviewResult.ACCEPTED
        review_data = self.get_review_data(trip.id)
        review_data['result'] = issuer_result

        self.env.client_post(
            f'/api/trips/{trip.id}/reviews-from-issuer', data=review_data, user=issuer)

        r = self.env.client_get(f'/api/trips/{trip.id}', user=issuer)
        self.assertEqual(r.data.get('status'), issuer_result)

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

    def test_reviewer_can_take_trip_with_difficulty_less_than_reviewer_experience(self):
        trip = self._get_cycling_trip(difficulty=2)
        self.env.user.REVIEWER = True
        self.env.user.save()
        UserExperience(user=self.env.user, trip_kind=TripKind.CYCLING, difficulty_as_for_reviewer=3,
                       is_issuer=False).save()
        available_to_writing_review = self.env.client_get(f'/api/trips?filter=work').data
        self.assertIn(trip.id, [t.get("id") for t in available_to_writing_review])

    def test_reviewer_cant_take_trip_with_difficulty_greater_than_reviewer_experience(self):
        trip = self._get_cycling_trip(difficulty=6)
        self.env.user.REVIEWER = True
        self.env.user.save()
        UserExperience(user=self.env.user, trip_kind=TripKind.CYCLING, difficulty_as_for_reviewer=3,
                       is_issuer=False).save()
        available_to_writing_review = self.env.client_get(f'/api/trips?filter=work').data
        self.assertNotIn(trip.id, [t.get("id") for t in available_to_writing_review])

    def _get_cycling_trip(self, difficulty):
        trip = self.env.trips[1]
        trip.kind = TripKind.CYCLING
        trip.difficulty_category = difficulty
        trip.save()
        return trip

    def test_issuer_can_take_trips_if_he_is_issuer_for_trip_kind(self):
        trip = self._get_cycling_at_issuer_trip()
        self.env.user.ISSUER = True
        self.env.user.save()
        UserExperience(user=self.env.user, trip_kind=TripKind.CYCLING, difficulty_as_for_reviewer=3,
                       is_issuer=True).save()
        available_to_writing_issuer_review = self.env.client_get(f'/api/trips?filter=work').data
        self.assertIn(trip.id, [t.get("id") for t in available_to_writing_issuer_review])

    def test_issuer_cant_take_trips_if_he_is_not_issuer_for_trip_kind(self):
        trip = self._get_cycling_at_issuer_trip()
        self.env.user.ISSUER = True
        self.env.user.REVIEWER = False
        self.env.user.save()
        UserExperience(user=self.env.user, trip_kind=TripKind.CYCLING, difficulty_as_for_reviewer=3,
                       is_issuer=False).save()
        available_to_writing_issuer_review = self.env.client_get(f'/api/trips?filter=work').data
        self.assertNotIn(trip.id, [t.get("id") for t in available_to_writing_issuer_review])

    def _get_cycling_at_issuer_trip(self):
        trip = self.env.trips[1]
        trip.kind = TripKind.CYCLING
        trip.status = TripStatus.AT_ISSUER
        trip.save()
        return trip

    def test_experience_record_for_one_user_and_one_kind_is_uniq(self):
        first_record = UserExperience(user=self.env.user, trip_kind=TripKind.CYCLING, difficulty_as_for_reviewer=3,
                                      is_issuer=False)
        first_record.save()
        second_record = UserExperience(user=self.env.user, trip_kind=TripKind.CYCLING, difficulty_as_for_reviewer=4,
                                       is_issuer=False)
        raised = False
        try:
            second_record.save()
        except IntegrityError:
            raised = True
        self.assertTrue(raised)

    def test_after_create_review_email_notify_should_sent_to_trip_leader(self):
        trip = self.env.trips[0]
        self.env.client_post(
            f'/api/trips/{trip.id}/reviews',
            data=self.get_review_data(trip.id), user=self.env.user)
        email = trip.leader.email
        self.assertEqual(len(mail.outbox), 1)
        self.assertTrue(email in mail.outbox[0].to)

    def test_review_patch_should_work_if_owner_try_change(self):
        old_data = {
            "result": ReviewResult.ON_REWORK,
            "result_comment": "REWORK",
        }

        review = self.env.eg.generate_instance_by_model(Review, reviewer=self.env.user, **old_data)
        review.save()

        patch_data = {
            "result": ReviewResult.ACCEPTED,
            "result_comment": "CHANGED TO ACCEPTED",
        }

        r = self.env.client_patch(f'/api/reviews/{review.id}', data=patch_data)
        self.assertEqual(r.status_code, 204)
        self.assertDictEqual(patch_data, {
            "result": r.data["result"], "result_comment": r.data["result_comment"]})

    def test_review_patch_should_change_trip_status_if_review_from_issuer(self):
        issuer = self.env.eg.generate_instance_by_model(
            User, is_active=True, ISSUER=True, REVIEWER=False, SECRETARY=False)
        issuer.save()

        review = self.env.eg.generate_instance_by_model(ReviewFromIssuer, reviewer=issuer, **{
            "result": ReviewResult.ON_REWORK,
            "result_comment": "REWORK",
        })
        review.save()

        patch_data = {
            "result": ReviewResult.ACCEPTED,
            "result_comment": "CHANGED TO ACCEPTED",
        }

        r = self.env.client_patch(f'/api/reviews/{review.id}', data=patch_data, user=issuer)
        self.assertEqual(r.status_code, 204)
        self.assertEqual(Review.objects.get(id=review.id).trip.status, patch_data["result"])

    def test_review_patch_should_not_work_if_permission_denied(self):
        self.env.user.REVIEWER = False
        self.env.user.ISSUER = False
        self.env.user.SECRETARY = False
        self.env.user.save()

        old_data = {
            "result": ReviewResult.ON_REWORK,
            "result_comment": "REWORK",
        }

        review = self.env.eg.generate_instance_by_model(Review, **old_data)
        review.save()

        patch_data = {
            "result": ReviewResult.ACCEPTED,
            "result_comment": "CHANGED TO ACCEPTED",
        }

        r = self.env.client_patch(f'/api/reviews/{review.id}', data=patch_data)
        self.assertEqual(r.status_code, 403)
