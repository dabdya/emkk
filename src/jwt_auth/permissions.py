from rest_framework import permissions
from rest_framework.permissions import BasePermission


class IsReviewMaker(BasePermission):
    """Пользователи которые могут отправлять ревью: рецензенты и выпускающие"""
    def has_object_permission(self, request, view, obj):
        pass
