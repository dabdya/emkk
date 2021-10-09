from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path('auth/', include('src.jwt_auth.urls')),
    path('admin/', admin.site.urls),
    path('api/', include('src.routes'))
]
