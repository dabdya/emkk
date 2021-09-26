from django.db import models


class TripStatus(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField()


class TripType(models.Model):
    name = models.CharField(max_length=50)


class Trip(models.Model):
    status = models.ForeignKey(TripStatus, on_delete=models.SET_NULL)
    type_ = models.ForeignKey(TripType, on_delete=models.SET_NULL)
    leader = models.ForeignKey(User, on_delete=models.SET_NULL)
    group_name = models.CharField(max_length=100, required=False)
    difficulty_category = models.IntegerField()
    district = models.CharField(max_length=100)
    participants_count = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    coordinator_info = models.TextField()
    insurance_info = models.TextField()
    start_apply = models.TextField(required=False)
    end_apply = models.TextField(required=False)


