from django.db import models
from src.jwt_auth.models import User


class TripStatus(models.TextChoices):
    ROUTE_COMPLETED = 'route_completed'
    ON_ROUTE = 'on_route'
    CREATED = 'created'
    ON_REVIEW = 'on_review'
    AT_ISSUER = 'at_issuer'
    ON_REWORK = 'in_rework'
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
        choices=TripStatus.choices, default=TripStatus.CREATED, max_length=30)
    kind = models.CharField(choices=TripKind.choices, max_length=30)

    leader = models.ForeignKey(User, on_delete=models.CASCADE)
    group_name = models.CharField(max_length=100)
    difficulty_category = models.IntegerField()
    district = models.CharField(max_length=100)
    participants_count = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    coordinator_info = models.TextField()
    insurance_info = models.TextField()
    start_apply = models.TextField(null=True)
    end_apply = models.TextField(null=True)

    def __str__(self):
        return self.group_name


class Review(models.Model):
    """Рецензия. Выдается работниоком МКК на конкретную заявку"""
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    result = models.CharField(
        choices=TripStatus.choices, max_length=30, default=TripStatus.ON_REVIEW)
    result_comment = models.TextField()


class Document(models.Model):
    """Документ, прилагаемый к заявке"""
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    content = models.BinaryField()
    content_type = models.CharField(max_length=50, null=True)


# class UserExperience(models.Model):
#     """Опыт пользователя по каждому виду туризма ~ категории сложности[1..6]"""
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     kind = models.CharField(choices=TripKind.choices, max_length=30)
#     difficulty_category = models.IntegerField()
