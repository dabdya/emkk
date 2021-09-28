from django.http import HttpResponse
import random
import json


def index(request):
    ans = random.randint(0,1)
    ans = "ДА!" if ans else "Нет :("
    return HttpResponse(json.dumps({"Можно ли пойти в поход?": f"{ans}"}))