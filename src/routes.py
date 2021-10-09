from django.urls import path, include
from rest_framework import permissions

from drf_yasg.views import get_schema_view
from drf_yasg import openapi


schema_view = get_schema_view(
   openapi.Info(
       title="emkk-backend api",
       default_version='v1',
       description="Service for coordinating sports trips",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,)
)

urlpatterns = [
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0)),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0)),
    path('', include('src.emkk_site.urls')),
]
