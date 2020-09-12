from django.conf import settings
from django.http import HttpResponse, request
from django.shortcuts import render, redirect
from library import models
from library.models import Song

# Create your views here.
def index(request):
    if request.user.is_authenticated:
        songs = Song.objects.all()
        return render(request, 'index.html', {'songs': songs})
    else:
        return redirect('login')

def manage(request):
    if request.user.is_authenticated:
        return render(request, 'admin/manage.html', {'music_lib': models.options.music_directory})
    else:
        return redirect('login')