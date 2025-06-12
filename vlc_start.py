#! /usr/bin/python3

import vlc
import time
import json
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

path = '/home/pi/webradio/data/'
#media = 0
vlc_instance = vlc.Instance()
vlc_player = vlc_instance.media_player_new()
vlc_media = None

time.sleep(5)

def start_player():
	file = open(path + 'vlc_control.json', "r")
	content = file.read()
	file.close()

	global vlc_instance
	global vlc_player
	global vlc_media
	if vlc_media != None: # if player is playing
		vlc_player.stop()
		print("vlc player gestoppt.")
	
	jsonObj = json.loads(content)
	if jsonObj["status"] == "play":
		vlc_media = vlc_instance.media_new(jsonObj["station_stream"])
		vlc_media.get_mrl()

		vlc_player.set_media(vlc_media)
		vlc_player.play()
		print("vlc player gestartet.")

		# clear now playing text. Some stations do not serve thies information so we clean the old ones at station start
		print("Now playing: ")
		fifo_write = open(path + 'now_playing.txt', 'w')
		fifo_write.write('')
		fifo_write.close()

# watchdog event listener
class Control_File_Change(FileSystemEventHandler):
	def on_modified(self, event):
		global vlc_media
		if(event.event_type == "modified"):
			time.sleep(0.5)
			start_player()

# watchdog setup
event_handler = Control_File_Change()
observer = Observer()
observer.schedule(event_handler, path + 'vlc_control.json', recursive=True)
observer.start()

# start player at system start
start_player()

prev_playing = ''
while True:
	time.sleep(1)

	# get meta data from stream
	if vlc_media != None: # if player is playing
		now_playing = vlc_media.get_meta(12) # vlc.Meta 12: 'NowPlaying'
		if now_playing == None:
				now_playing = ''

		if now_playing != prev_playing:
			print("Now playing: ", now_playing)
			fifo_write = open(path + 'now_playing.txt', 'w')
			fifo_write.write(now_playing)
			fifo_write.close()
				
			prev_playing = now_playing