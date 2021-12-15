from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone
from src.jwt_auth.models import User

import uuid


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
    PEDESTRIAN_WATER = 'pedestrian_water'
    SPELEO = 'speleo'
    YACHTING = 'yachting'
    HORSE_SPORT = 'horse_sport'
    AUTO_MOTO = 'auto_moto'


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
    coordinator_name = models.CharField(max_length=100)
    coordinator_phone_number = models.CharField(max_length=20)
    insurance_company_name = models.CharField(max_length=100)
    insurance_policy_validity_duration = models.DateField()
    insurance_number = models.CharField(max_length=100)

    control_start_date = models.DateField(null=True)
    control_end_date = models.DateField(null=True)
    control_start_region = models.CharField(max_length=100, null=True)
    control_end_region = models.CharField(max_length=100, null=True)

    created_at = models.DateTimeField(editable=False, default=timezone.now)
    last_modified_at = models.DateTimeField(auto_now=True)

    info_for_reviewer = models.TextField()

    def __str__(self):
        return self.group_name


class Review(models.Model):
    """Рецензия. Выдается работниоком МКК на конкретную заявку"""
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    result = models.CharField(choices=ReviewResult.choices, max_length=30)
    result_comment = models.TextField()

    def __str__(self):
        return f"trip: {self.trip}, result: {self.result}"


class ReviewFromReviewer(Review):
    """Рецензия от рецензента"""


class ReviewFromIssuer(Review):
    """Рецензия от выпускающего"""


class Document(models.Model):
    file = models.FileField(upload_to='%Y/%m/%d/')
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    filename = models.CharField(max_length=250)
    content_type = models.CharField(max_length=100)

    def to_str_restricted(self):
        return {
            'uuid': self.uuid,
            'filename': self.filename
        }


class TripDocument(Document):
    """Документ, прилагаемый к заявке"""
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)

    @classmethod
    def create(cls, trip):
        return cls(trip=trip)

    @classmethod
    def get_by_related_obj_id(cls, trip_id):
        return cls.objects.filter(trip_id=trip_id)


class ReviewDocument(Document):
    """Документ, прилагаемый к рецензии"""
    review = models.ForeignKey(Review, on_delete=models.CASCADE)

    @classmethod
    def create(cls, review):
        return cls(review=review)

    @classmethod
    def get_by_related_obj_id(cls, review_id):
        return cls.objects.filter(review_id=review_id)


class ReviewFromIssuerDocument(Document):
    """Документ, прилагаемый к рецензии"""
    review_from_issuer = models.ForeignKey(ReviewFromIssuer, on_delete=models.CASCADE)

    @classmethod
    def create(cls, review):
        return cls(review_from_issuer=review)

    @classmethod
    def get_by_related_obj_id(cls, review_id):
        return cls.objects.filter(review_from_issuer_id=review_id)


class UserExperience(models.Model):
    """Пользователь может рецензировать заявки сложности `difficulty_as_for_reviewer` и меньшей.
     категории сложности ~ [1..6]"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    trip_kind = models.CharField(choices=TripKind.choices, max_length=30)
    difficulty_as_for_reviewer = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(6)])
    is_issuer = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'trip_kind',)
