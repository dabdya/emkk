from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from src.emkk_site.models import User

admin.site.register(User, UserAdmin)
