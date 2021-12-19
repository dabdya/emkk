from django.core import mail
from django.test import TestCase

from src.emkk_site.tests.base import TestEnvironment
from src.emkk_site.models import Trip, TripKind, TripStatus


class TripTest(TestCase):

    def setUp(self):
        self.trip_data = {
            'kind': TripKind.CYCLING,
            'difficulty_category': 1,
            'group_name': 'TestGroup',
            'global_region': 'Russia',
            'local_region': 'City',
            'participants_count': 12,
            'start_date': '2021-10-08',
            'end_date': '2021-10-28',
            'coordinator_name': 'Info',
            'coordinator_phone_number': '89527373254',
            'insurance_company_name': 'Info',
            'insurance_policy_validity_duration': '2021-12-24',
            'insurance_number': '34234234',
        }

        self.trips_count = 1
        self.env = TestEnvironment() \
            .with_user(reviewer=True) \
            .with_trips(self.trips_count)

    def test_trip_create_take_leader_from_authorization(self):
        response = self.env.client_post(f'/api/trips', self.trip_data)
        trip_id = response.data['id']
        trip = Trip.objects.get(pk=trip_id)
        self.assertEqual(trip.leader, self.env.user)

    def test_cant_create_trip_if_user_not_authorized(self):
        response = self.env.client_post(f'/api/trips', self.trip_data, set_auth_header=False)
        self.assertEqual(response.status_code, 403)

    def test_trip_get_restricted_data_if_user_not_authorized(self):
        response = self.env.client_get(f'/api/trips', set_auth_header=False)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data[0].get('insurance_info', False))
        self.assertFalse(response.data[0].get('access_token', False))
        self.assertFalse(response.data[0].get('refresh_token', False))

    def test_user_cant_change_trip_if_is_not_owner(self):
        self.env.user.REVIEWER = False
        self.env.user.ISSUER = False
        self.env.user.SECRETARY = False
        self.env.user.save()

        trip = self.env.trips[0]
        r = self.env.client_patch(f'/api/trips/{trip.id}', {
            'participants_count': trip.participants_count + 1, 'info_for_reviewer': 'changed'})
        self.assertEqual(r.status_code, 403)

        r = self.env.client_delete(f'/api/trips/{trip.id}')
        self.assertEqual(r.status_code, 403)

    def test_user_can_change_trip_fields_if_is_owner(self):
        trip = self.env.trips[0]
        trip.leader.is_active = True
        trip.leader.save()

        r = self.env.client_patch(f'/api/trips/{trip.id}', {
            'participants_count': trip.participants_count + 1, 'info_for_reviewer': 'changed'}, user=trip.leader)

        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['participants_count'], trip.participants_count + 1)
        self.assertEqual(
            Trip.objects.get(id=trip.id).participants_count, trip.participants_count + 1)

        r = self.env.client_delete(f'/api/trips/{trip.id}', user=trip.leader)
        self.assertEqual(r.status_code, 204)
        self.assertEqual(Trip.objects.filter(id=trip.id).count(), 0)

    def test_trip_last_modified_is_greater_after_changing_the_trip(self):
        trip = self.env.trips[0]
        old_date = trip.last_modified_at
        import time
        time.sleep(1)

        trip.status = TripStatus.AT_ISSUER
        trip.save()
        new_date = trip.last_modified_at
        self.assertGreater(new_date, old_date)

    def test_trip_last_modified_is_greater_after_changing_the_trip_by_patch(self):
        response = self.env.client_post(f'/api/trips', self.trip_data)
        trip_id = response.data['id']
        old_trip = Trip.objects.get(pk=trip_id)
        old_date = old_trip.last_modified_at
        import time
        time.sleep(1)
        trip_data = dict(self.trip_data)
        trip_data['kind'] = TripKind.HORSE_SPORT
        trip_data['info_for_reviewer'] = 'changed'
        self.env.client_patch(f'/api/trips/{trip_id}', trip_data)
        trip = Trip.objects.get(pk=trip_id)
        self.assertGreater(trip.last_modified_at, old_date)

    def test_trip_cannot_be_changed_after_rejecting(self):
        trip = self.env.trips[0]
        trip.status = TripStatus.REJECTED
        trip.save()
        trip.leader.is_active = True
        trip.leader.save()
        old_kind = trip.kind
        r = self.env.client_patch(f'/api/trips/{trip.id}', {
            'kind': TripKind.CYCLING}, user=trip.leader)
        new_trip = Trip.objects.get(pk=trip.id)
        self.assertEqual(r.status_code, 400)
        self.assertEqual(new_trip.kind, old_kind)

    def test_trip_change_status_should_work(self):
        trip = self.env.eg.generate_instance_by_model(Trip, status=TripStatus.ACCEPTED)
        self.env.user.SECRETARY = True

        trip.save()
        self.env.user.save()

        email = trip.leader.email

        r = self.env.client_post(f'/api/trips/{trip.id}/change-status?new_status=TAKE_PAPERS', data={})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertTrue(email in mail.outbox[0].to)
        self.assertEqual(Trip.objects.get(id=trip.id).status, TripStatus.TAKE_PAPERS)

    def test_only_secretary_can_change_trip_status(self):
        trip = self.env.eg.generate_instance_by_model(Trip, status=TripStatus.ACCEPTED)
        self.env.user.SECRETARY = False

        trip.save()
        self.env.user.save()

        r = self.env.client_post(f'/api/trips/{trip.id}/change-status?new_status=TAKE_PAPERS', data={})
        self.assertEqual(r.status_code, 403)
