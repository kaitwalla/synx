from django.conf import settings

def reload_song_data():
    music_lib=settings.getattr('MUSIC_DIR', '/var/music')
    print(music_lib)