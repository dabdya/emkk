from django.http import HttpResponse
import random


def index(request):
    ans = random.randint(0,1)
    ans = "ДА!" if ans else "Нет :("
    return HttpResponse(f"""
    <h1>МОЭНО ли пойти в поход? (пожалуйста)</h1>
    <h1>{ans}</h1>""")