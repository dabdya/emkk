from django.test import TestCase
from src.emkk_site.tests.base import TestEnvironment

from src.jwt_auth.models import User
from django.contrib.auth.hashers import check_password


class UserTest(TestCase):
    def setUp(self):
        self.env = TestEnvironment().with_user()

    def test_user_update_should_correct_work(self):
        patch_data = {
            "user": {
                "username": "new_username",
            }
        }

        r = self.env.client_patch(f'/auth/user', data=patch_data)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["username"], patch_data["user"]["username"])
        self.assertEqual(User.objects.get(pk=self.env.user.id).username, patch_data["user"]["username"])

        self.assertTrue("access_token" in r.data)
        self.assertTrue("refresh_token" in r.data)

    def test_user_password_update_should_correct_work(self):
        patch_data = {
            "user": {
                "password": "new_password",
            },
            "old_password": self.env.user.password,
        }

        r = self.env.client_patch(f'/auth/user', data=patch_data, user=self.env.user)
        self.assertEqual(r.status_code, 200)

        self.env.user = User.objects.get(email=self.env.user.email)
        self.assertTrue(check_password(patch_data["user"]["password"], self.env.user.password))

        data_without_old_password = {
            "user": {
                "password": "new_password",
            },
        }

        r = self.env.client_patch(f'/auth/user', data=data_without_old_password)
        self.assertEqual(r.status_code, 400)
