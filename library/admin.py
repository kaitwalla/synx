from django.contrib import admin

from .models import Song, Album, Tag, Artist

admin.site.register(Song)
admin.site.register(Album)
admin.site.register(Tag)
admin.site.register(Artist)
