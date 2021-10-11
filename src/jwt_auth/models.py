from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.utils import timezone
from django.db import models

from datetime import timedelta
from config import settings
import jwt


class UserManager(BaseUserManager):

    def create_user(self, username, email, first_name, second_name, password):
        if not username:
            raise TypeError('Users must have a username')

        if not email:
            raise TypeError('Users must have an email address')

        user = self.model(username=username, email=self.normalize_email(email),
                          first_name=first_name, second_name=second_name)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, username, email, first_name, second_name, password):
        user = self.create_user(
            username, email, first_name, second_name, password)
        user.is_superuser = True
        user.is_staff = True
        user.save()
        return user


class AutoDateTimeField(models.DateTimeField):
    def pre_save(self, model_instance, add):
        return timezone.now()


class User(AbstractBaseUser, PermissionsMixin):

    username = models.CharField(max_length=255, unique=True)
    email = models.EmailField(max_length=255, unique=True)

    first_name = models.CharField(max_length=255)
    second_name = models.CharField(max_length=255)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(editable=False, default=timezone.now)
    updated_at = AutoDateTimeField(default=timezone.now)

    GENDER = (
        ('m', 'male'),
        ('f', 'female')
    )

    gender = models.CharField(
        max_length=6, choices=GENDER, default='m')

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'first_name', 'second_name']

    objects = UserManager()

    def get_full_name(self):
        return f'{self.first_name} {self.second_name}'

    @property
    def token(self):
        """На каждый вход генерируется новый токен с сроком годности сутки"""
        return self._generate_jwt_token()

    def _generate_jwt_token(self):
        dt = timezone.now() + timedelta(days=1)
        token = jwt.encode({
            'id': self.pk,
            'exp': int(dt.strftime('%s'))
        }, settings.SECRET_KEY, algorithm='HS256')

        return token

    def __str__(self):
        return self.username
