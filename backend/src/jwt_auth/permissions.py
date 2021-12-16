from rest_framework.permissions import BasePermission
from django.conf import settings

from src.emkk_site.models import Trip
from src.emkk_site.services import user_can_be_reviewer, user_can_be_issuer

import jwt


SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']


class IsAuthenticated(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return request.method in SAFE_METHODS


class ReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class ResetPassword(BasePermission):
    def has_permission(self, request, view):
        reset_token = request.data.get('reset_token', None)
        if not reset_token:
            return False

        prefix, token = reset_token.split()
        if prefix != 'Token':
            return False

        try:
            jwt.decode(token, settings.RESET_KEY, algorithms=["HS256"])
            return True
        except (jwt.InvalidSignatureError, jwt.InvalidSignatureError) as err:
            return False


class IsReviewer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.REVIEWER

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Trip) and not user_can_be_reviewer(request.user, obj):
            return False
        return request.user.REVIEWER


class IsIssuer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.ISSUER

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Trip) and not user_can_be_issuer(request.user, obj):
            return False
        return request.user.ISSUER


class IsSecretary(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.SECRETARY

    def has_object_permission(self, request, view, obj):
        return request.user.SECRETARY


class IsTripOwner(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return obj.leader == request.user


class IsDocumentOwner(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return obj.trip.leader == request.user
