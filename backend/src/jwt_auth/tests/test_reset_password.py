from django.test import TestCase

from src.emkk_site.tests.base import TestEnvironment
from src.jwt_auth.models import User

from django.contrib.auth.hashers import check_password


class ResetPasswordTest(TestCase):

    def setUp(self):
        self.env = TestEnvironment().with_user()

    def test_should_work_when_request_data_is_correct(self):
        data = {
            "email": self.env.user.email,
            "reset_url": '/auth/user',
        }

        r = self.env.client_post('/auth/users/reset-password',
                                 data=data, set_auth_header=False)

        self.assertEqual(r.status_code, 200)
        self.assertTrue("reset_token" in r.data)
        self.assertTrue("access_token" in r.data)

        new_password = "new_password"
        patch_data = {
            "user": {
                "password": new_password,
            }
        }

        old_password = self.env.user.password
        r = self.env.client_patch('/auth/user', data=patch_data)
        self.assertEqual(r.status_code, 200)

        self.env.user = User.objects.get(email=self.env.user.email)
        self.assertTrue(check_password(new_password, self.env.user.password))
        self.assertFalse(check_password(old_password, self.env.user.password))

    def test_should_not_work_when_email_not_exist_or_not_found(self):
        data = {
            "email": "notfound@gmail.com",
            "reset_url": '/auth/user',
        }

        r = self.env.client_post('/auth/users/reset-password',
                                 data=data, set_auth_header=False)

        self.assertEqual(r.status_code, 422)
        self.assertFalse("reset_token" in r.data)
        self.assertFalse("access_token" in r.data)
