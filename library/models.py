import dbsettings
from django.db import models
from django.utils import timezone

class Tag(models.Model):
    def __str__(self):
        return self.name
    name = models.CharField(max_length=50)
    objects = models.Manager()

class Artist(models.Model):
    def __str__(self):
        return self.name
    name = models.CharField(max_length=200)
    objects = models.Manager()

class Album(models.Model):
    def __str__(self):
        return self.title
    title = models.CharField(max_length=100)
    artistDisplay = models.CharField(max_length=100)
    artist = models.ManyToManyField(Artist)
    tag = models.ManyToManyField(Tag)
    objects = models.Manager()

class Song(models.Model):
    def __str__(self):
        return self.title
    title = models.CharField(max_length=100)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    genre = models.CharField(max_length=100)
    fullPath = models.CharField(max_length=400)
    filename = models.CharField(max_length=200)
    tag = models.ManyToManyField(Tag)
    objects = models.Manager()
    modified_date = models.DateTimeField(default=timezone.now)
    updated_date = models.DateTimeField(default=timezone.now)

class Settings(dbsettings.Group):
    music_directory=dbsettings.StringValue(default='/var/music', description='Where your music is located on the system')
    library_modified_date=dbsettings.DateTimeValue(default=timezone.now)

options = Settings()