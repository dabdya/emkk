from django.urls import path

from src.jwt_auth.views import (
    RegistrationAPIView, LoginAPIView, UserRetrieveUpdateAPIView,
    RefreshTokenView, ResetPasswordView
)


urlpatterns = [
    path('user', UserRetrieveUpdateAPIView.as_view()),
    path('users', RegistrationAPIView.as_view()),
    path('users/login', LoginAPIView.as_view()),
    path('users/refresh', RefreshTokenView.as_view()),
    path('users/reset-password', ResetPasswordView.as_view()),
]


"""
    Зачем нужен отдельный эндпоинт для RefreshToken? Есть две объективные причины:
    
    1. Ясно, что когда AccessToken истечет, то придется обновить его. Если на любой эндпоинт всегда
       высылать оба токена, и не запариваться на фронте с обработкой, то повышается вероятность перехвата ОБОИХ.
       Поскольку они всегда будут пересылаться парой. А когда оба токена перехвачены это хуже, потому что
       время хакера не будет ограничено лишь только одним короткоживущим токеном.
       
    2. В таком случае на фронте никто не узнат что AccessToken обновился, т.е. высылаться то новые токены в ответ будут,
       но вот отловить что там что-то поменялось никак не получится. Гораздо лучше выкидывать сообщение с ошибкой 
       AccessTokenExpired - обрабатывать его на фронте и делать запрос на его обновление в другую точку.
       
       В ином случае у пользователя однажды окажется expired AccessToken, а в силу его короткой жизни это вопрос
       нескольких минут, и тогда на каждый последущий запрос будет генерироваться новый AccessToken, а это
       как минимум криптографическая функция.
"""
