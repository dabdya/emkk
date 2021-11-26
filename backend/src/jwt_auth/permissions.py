from rest_framework.permissions import BasePermission


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


class IsReviewer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.REVIEWER

    def has_object_permission(self, request, view, obj):
        return obj.reviewer == request.user


class IsIssuer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.ISSUER

    def has_object_permission(self, request, view, obj):
        return obj.reviewer == request.user


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
