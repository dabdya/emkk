from django.contrib import admin
from src.emkk_site.models import User


class AuthorAdmin(admin.ModelAdmin):
    pass


admin.site.register(User, AuthorAdmin)
