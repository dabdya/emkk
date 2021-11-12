from django.db import models
from uuid import uuid4
from random import randint
from django.utils import timezone
from datetime import datetime


class EntityGenerator:
    def __init__(self, fk_threshold=1):
        """
            fk_threshold - порог для создания сущностей по внешнему ключу.
            Например, пусть fk_threshold=2 и нужно сгенерировать заявку.
            Чтобы создать заявку нужен пользователь, для заявки он внеший ключ.
            И предположим, что в базе есть всего один! пользователь,
            тогда при генерации заявки будет создан новый пользователь для нее.
            А вот при следующей генерации заявки пользователь будет выбираться рандомно
            из имеющихся, поскольку fk_threshold станет равным users.count
        """
        self.fk_threshold = fk_threshold

    def _generate_field_value(self, field):
        """Генерация значения для поля в зависимости от его типа"""

        field_class = field.__class__
        field_dict = field.__dict__
        field_model = field.__dict__.get('model')

        if field_class == models.BigAutoField:
            return field_model.objects.all().count() + 1

        if field_class in [models.CharField, models.TextField]:
            choices = field_dict.get('choices')
            if not choices:
                return str(uuid4())
            i = randint(0, len(choices) - 1)
            return choices[i]

        if field_class == models.EmailField:
            return str(uuid4()) + "@" + str(uuid4())

        if field_class == models.DateTimeField:
            return timezone.now()
        if field_class == models.DateField:
            return datetime.now().strftime("%Y-%m-%d")

        if field_class == models.BooleanField:
            return False if randint(0, 1) else True

        if field_class == models.IntegerField:
            validators = field_dict.get('_validators')
            if not validators:
                return randint(0, 10)
            min_val = validators[0].limit_value
            max_val = validators[1].limit_value
            return randint(min_val, max_val)

        if field_class == models.ForeignKey:
            foreign_model = field_dict.get('remote_field').model
            fk_instances_count = foreign_model.objects.all().count()
            if fk_instances_count >= self.fk_threshold:
                i = randint(0, fk_instances_count - 1)
                return foreign_model.objects.all()[i]
            new_instance = self.generate_instance_by_model(foreign_model)
            new_instance.save()
            return new_instance

    def generate_instance_by_model(self, model: models.Model):
        """Генерируется и возвращается сущность по указанной модели"""

        if not callable(model):
            raise ValueError("Given model not callable")
        if not issubclass(model, models.Model):
            raise ValueError("Given model is not django model")

        instance = model()
        for field in instance._meta.fields:
            attr_name = field.name
            attr_val = self._generate_field_value(field)
            setattr(instance, attr_name, attr_val)
        return instance
