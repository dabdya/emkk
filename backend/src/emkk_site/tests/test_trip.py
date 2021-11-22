from django.test import TestCase

from src.emkk_site.tests.base import TestEnvironment
from src.emkk_site.models import Trip, TripKind


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
            'insurance_policy_validity_duration': '2021-12-24'
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

    def test_trip_change_fields_correct_work(self):
        trip = self.env.trips[0]
        r = self.env.client_patch(f'/api/trips/{trip.id}', {
            'participants_count': trip.participants_count + 1})

        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.data['participants_count'], trip.participants_count + 1)
        self.assertEqual(
            Trip.objects.get(id=trip.id).participants_count, trip.participants_count + 1)
