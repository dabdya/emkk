from django.db import models

from src.emkk_site.utils.reviewers_count_by_difficulty import get_reviewers_count_by_difficulty
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
    difficulty_category = models.IntegerField(min_value=1, max_value=6)
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

    def try_change_status_from_review_to_at_issuer(self):
        existing_reviews_count = len(Review.objects.filter(trip=self))
        needed_reviews_count = get_reviewers_count_by_difficulty(self.difficulty_category)
        if self.status == TripStatus.ON_REVIEW and existing_reviews_count >= needed_reviews_count:
            self.status = TripStatus.AT_ISSUER


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
    file = models.FileField(upload_to='%Y/%m/%d/')


class UserExperience(models.Model):
    """Опыт пользователя по каждому виду туризма ~ категории сложности[1..6]"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    kind = models.CharField(choices=TripKind.choices, max_length=30)
    difficulty_category = models.IntegerField(min_value=1, max_value=6)


class TripsOnReviewByUser(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
