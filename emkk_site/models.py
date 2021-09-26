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


class Document(models.Model):
    """Документы, прилагаемые к заявке"""
    trip = models.ForeignKey(Trip, on_delete=models.SET_NULL)
    physical_path = models.FilePathField(max_length=255)


class User(models.Model):
    """Все пользователи. Все те, кто зарегистрированы"""
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    role = models.ManyToManyField(Role)


class UserExperience(models.Model):
    """Опыт пользователя по каждому виду туризма ~ категории сложности[1..6]"""
    user = models.ForeignKey(User, on_delete=models.SET_NULL)
    tripType = models.ForeignKey(TripType, on_delete=models.SET_NULL)
    difficultyCategory = models.IntegerField()


class Review(models.Model):
    """Рецензия. Выдается работниоком МКК на конкретную заявку"""
    reviewer = models.ForeignKey(User, on_delete=models.SET_NULL)
    trip = models.ForeignKey(Trip, on_delete=models.SET_NULL)
    result = models.ForeignKey(TripStatus, on_delete=models.SET_NULL)
    result_comment = models.TextField()


class Role(models.Model):
    """Роли в МКК. Секретарь/Рецензент/Выпускающий/Руководитель группы"""
    name = models.CharField(max_length=255)
    priorityLevel = models.IntegerField()  # TODO узнать, выстроены ли их права линейно
