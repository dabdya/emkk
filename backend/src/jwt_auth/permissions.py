from rest_framework.permissions import BasePermission


SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']


class IsAuthenticatedOrReadOnly(BasePermission):
    """Либо авторизован, либо только по SAFE_METHODS"""
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or request.user.is_authenticated


class IsReviewer(BasePermission):
    """Доступ для авторизованного рецензента"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.REVIEWER

    def has_object_permission(self, request, view, obj):
        return obj.reviewer == request.user


class IsIssuer(BasePermission):
    """Доступ для авторизованного выпускающего"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.ISSUER

    def has_object_permission(self, request, view, obj):
        return obj.reviewer == request.user
