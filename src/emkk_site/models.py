from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone

from src.jwt_auth.models import User


class TripStatus(models.TextChoices):
    ROUTE_COMPLETED = 'route_completed'
    ON_ROUTE = 'on_route'
    TAKE_PAPERS = 'take_papers'
    ON_REVIEW = 'on_review'
    AT_ISSUER = 'at_issuer'
    ON_REWORK = 'on_rework'
    ACCEPTED = 'accepted'
    REJECTED = 'rejected'
    ALARM = 'alarm'


class ReviewResult(models.TextChoices):
    ON_REWORK = 'on_rework'
    ACCEPTED = 'accepted'
    REJECTED = 'rejected'


class TripKind(models.TextChoices):
    PEDESTRIAN = 'pedestrian'
    CYCLING = 'cycling'
    MOUNTAIN = 'mountain'
    WATER = 'water'
    SKI = 'ski'


class Trip(models.Model):
    """Заявка. Подается руководителем группы"""
    status = models.CharField(
        choices=TripStatus.choices, default=TripStatus.ON_REVIEW, max_length=30)
    kind = models.CharField(choices=TripKind.choices, max_length=30)

    leader = models.ForeignKey(User, on_delete=models.CASCADE)
    group_name = models.CharField(max_length=100)
    difficulty_category = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(6)])

    global_region = models.CharField(max_length=100)
    local_region = models.CharField(max_length=100)
    participants_count = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    coordinator_info = models.TextField()
    insurance_info = models.TextField()
    actual_start_date = models.TextField(null=True)
    actual_end_date = models.TextField(null=True)

    created_at = models.DateTimeField(editable=False, default=timezone.now)

    def __str__(self):
        return self.group_name


class Review(models.Model):
    """Рецензия. Выдается работниоком МКК на конкретную заявку"""
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    result = models.CharField(choices=ReviewResult.choices, max_length=30)
    result_comment = models.TextField()


class ReviewFromIssuer(Review):
    """Рецензия от выпускающего"""


class Document(models.Model):
    """Документ, прилагаемый к заявке"""
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    file = models.FileField(upload_to='%Y/%m/%d/')


class UserExperience(models.Model):
    """Опыт пользователя по каждому виду туризма ~ категории сложности[1..6]"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    kind = models.CharField(choices=TripKind.choices, max_length=30)
    difficulty_category = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(6)])


# class TripsOnReviewByUser(models.Model):
#     trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
#     user = models.ForeignKey(User, on_delete=models.CASCADE)

class WorkRegister(models.Model):
    class Meta:
        unique_together = (('trip', 'user'),)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
