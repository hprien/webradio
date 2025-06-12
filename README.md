# webradio
This software is hosted on a raspberrypi and lets you control a webradio from a webpage.
The webpage and api is delivered by a nodejs backend written with express.
This nodejs script communicated with a python script which controls the vlc player.

# autostart
add the following lines to the cronjobs 
@reboot		root	node /home/pi/webradio/server.js
@reboot		pi	    /home/pi/webradio/vlc_start.py
