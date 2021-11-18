from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static
from config import settings

urlpatterns = [
    path('auth/', include('src.jwt_auth.urls')),
    path('admin/', admin.site.urls),
    path('api/', include('src.routes'))
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
