const isWin = process.platform == 'win32';
console.log(isWin ? 'Hi Windows': 'Hi Linux');

const express = require('express');
const fs = require('fs');
const valid_url = require('valid-url');
const axios = require('axios');

var stations_path;
var vlc_control_path;
var now_playing_path;
var page_path;

var os;
var Gpio;
var relay;
var port;
if(isWin) {
    stations_path = 'C:/Users/Henning/Nextcloud/Projekte/RadioPrien/nodejs/data/stations.json';
    vlc_control_path = 'C:/Users/Henning/Nextcloud/Projekte/RadioPrien/nodejs/data/vlc_control.json';
    now_playing_path = "C:/Users/Henning/Nextcloud/Projekte/RadioPrien/nodejs/data/now_playing.txt";
    page_path = 'page';
    port = 300;
} else {
    os = require('os');
    Gpio = require('onoff').Gpio;

    relay = new Gpio(26, 'out');
    relay.writeSync(1);

    stations_path = '/home/pi/webradio/data/stations.json';
    vlc_control_path = '/home/pi/webradio/data/vlc_control.json';
    now_playing_path = "/home/pi/webradio/data/now_playing.txt";
    page_path = '/home/pi/webradio/page/';

    port = 80;
}

var load = null;

const server = express();

server.use(express.json());
server.use(express.static(page_path)); // webseite übergeben


server.get('/api/stations', function(req, res) { // get stations
    var stations = fs.readFileSync(stations_path, 'utf8');
    stations = JSON.parse(stations);

    var stations_to_send = [];
    for(var i = 0; i < stations.length; i++) {
        stations_to_send.push({
            name: stations[i].name,
            id: stations[i].id,
            position: stations[i].position,
            icon_url: stations[i].icon_url,
            stream_url: stations[i].stream_url,
        });
    }

    res.send(stations_to_send);
    console.log('Senderliste an client geschickt.');
});

/* POST
{    
    "name": "test Sender",
    "icon_url": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Hitradio_%C3%963.svg",
    "stream_url": "http://ors-sn09.ors-shoutcast.at/oe3-q1a"
}
*/
server.post('/api/stations', function(req, res) { // add new station
    var stations = fs.readFileSync(stations_path, 'utf8');
    stations = JSON.parse(stations);

    req.body.icon_url = encodeURI(req.body.icon_url);
    req.body.stream_url = encodeURI(req.body.stream_url);
    
    if(req.body.name == '') {
        console.log('name is empty');
        res.status(400).send('bad name'); // Bad Request (bad name)
        return;
    }
    if(!valid_url.isUri(req.body.icon_url)) {
        console.log('icon_url ist keine URL');
        res.status(400).send('bad icon_url'); // Bad Request (bad icon_url)
        return;
    }
    if(!valid_url.isUri(req.body.stream_url)) {
        console.log('stream_url ist keine URL');
        res.status(400).send('bad stream_url'); // Bad Request (bad stream_url)
        return;
    }

    const new_station = {
        name: req.body.name,
        id: new Date().getTime(),
        position: stations.length + 1,
        icon_url: req.body.icon_url,
        stream_url: req.body.stream_url
    };

    stations.push(new_station);
    fs.writeFileSync(stations_path, JSON.stringify(stations), 'utf8');

    res.sendStatus(200); // OK
    console.log('neuen Sender hinzugefügt und abgespeichert');
});

/* POST
one or more of the following body elements must be set
{
    "name": "new name",
    "position_action": "top", "bottom", "up", "down",
    "icon_url": "https://...",
    "stream_url": "https://..."
}
*/
server.put('/api/stations/:id', function(req, res) { // edit station
    var stations = fs.readFileSync(stations_path, 'utf8');
    stations = JSON.parse(stations);
    
    var station = stations.find(function(station) {
        return station.id == req.params.id;
    });
    if(station == undefined) {
        res.sendStatus(400); // Bad Request
        return;
    }

    if('name' in req.body) {
        if(req.body.name == '') {
            console.log('name is empty');
            res.status(400).send('bad name'); // Bad Request (bad name)
            return;
        }
        station.name = req.body.name;
    }
    if('position_action' in req.body) {
        const position_action = req.body.position_action; // top, bottom, up, down
        const old_position = station.position;
        if(position_action == 'up') {
            const new_position = old_position - 1;
            
            const station_on_target_position = stations.find(function(station) {
                return station.position == new_position;
            });
            if(station_on_target_position == undefined) {
                res.sendStatus(400); // Bad Request
                return;
            }

            station_on_target_position.position = old_position;
            station.position = new_position;
        }
        else if(position_action == 'down') {
            const new_position = old_position + 1;
            
            const station_on_target_position = stations.find(function(station) {
                return station.position == new_position;
            });
            if(station_on_target_position == undefined) {
                res.sendStatus(400); // Bad Request
                return;
            }

            station_on_target_position.position = old_position;
            station.position = new_position;
        }
        else if(position_action == 'top') {
            // move station to zero (not visable in page)
            station.position = 0;

            // each station thats position is above the moved one, needs to be pushed down by one
            for(var i = old_position - 1; i >= 1; i--) {
                const station = stations.find(function(station) {
                    return station.position == i;
                });
                station.position += 1;
            }

            // move station to final position
            station.position = 1;
        }
        else if(position_action == 'bottom') {
            // move station to zero (not visable in page)
            station.position = 0;

            // each station thats position is under the moved one, needs to be pushed up by one
            for(var i = old_position + 1; i <= stations.length; i++) {
                const station = stations.find(function(station) {
                    return station.position == i;
                });
                station.position -= 1;
            }

            // move station to final position
            station.position = stations.length;
        }
    }
    if('icon_url' in req.body) {
        req.body.icon_url = encodeURI(req.body.icon_url);

        if(!valid_url.isUri(req.body.icon_url)) {
            console.log('icon_url ist keine URL');
            res.status(400).send('bad icon_url'); // Bad Request (bad icon_url)
            return;
        }

        station.icon_url = req.body.icon_url;
    }
    if('stream_url' in req.body) {
        req.body.stream_url = encodeURI(req.body.stream_url);

        if(!valid_url.isUri(req.body.stream_url)) {
            console.log('stream_url ist keine URL');
            res.status(400).send('bad stream_url'); // Bad Request (bad stream_url)
            return;
        }
        
        station.stream_url = req.body.stream_url;
    }

    fs.writeFileSync(stations_path, JSON.stringify(stations), 'utf8');
    console.log('Sender geändert und abgespeichert');
    res.sendStatus(200);
});

server.delete('/api/stations/:id', function(req, res) { // delete station
    var stations = fs.readFileSync(stations_path, 'utf8');
    stations = JSON.parse(stations);

    var station = stations.find(function(station) {
        return station.id == req.params.id;
    });
    if(station == undefined) {
        res.sendStatus(400); // Bad Request
        return;
    }

    // andre Stationen nachrutschen lassen
    var position = station.position;
    for(var i = 0; i < stations.length; i++) {
        if(stations[i].position > position) {
            stations[i].position -= 1;
        }
    }
    
    // delete station
    for(var i = 0; i < stations.length; i++) {
        if(stations[i].id == req.params.id) {
            stations.splice(i, 1);
        }
    }
        
    fs.writeFileSync(stations_path, JSON.stringify(stations), 'utf8');
    res.sendStatus(200); // OK
    console.log('Sender gelöscht und abgespeichert');
});


server.get('/api/player/start/:id', function(req, res) { // play
    var stations = fs.readFileSync(stations_path, 'utf8');
    stations = JSON.parse(stations);

    var station = stations.find(function(station) {
        return station.id == req.params.id;
    });
    if(station == undefined) {
        res.sendStatus(400); // Bad Request
        return;
    }

    var vlc_control = {
        status: 'play',
        station_id: station.id,
        station_stream: station.stream_url
    };
    
    fs.writeFileSync(vlc_control_path, JSON.stringify(vlc_control), 'utf8');
    console.log('Sender gestarted');
    res.sendStatus(200); // OK
});

server.get('/api/player/stop/', function(req, res) { // stop
    var vlc_control = {
        status: 'stop',
        station_id: 0
    };

    fs.writeFileSync(vlc_control_path, JSON.stringify(vlc_control), 'utf8');
    console.log('Sender gestoppt');
    res.sendStatus(200); // OK
});

server.get('/api/player/', function(req, res) { // get player status
    var vlc_control = fs.readFileSync(vlc_control_path, 'utf8');
    vlc_control = JSON.parse(vlc_control);

    const now_playing = fs.readFileSync(now_playing_path, 'utf8');
    
    res.send({
        status: vlc_control.status,
        station_id: vlc_control.station_id,
        now_playing: now_playing
    });

    console.log('player status an client gesendet');
});

/* POST
{
    "m3u_url": "https://url/to/file.m3u"
}
return:
[
    "https://stream/link/1",
    "https://stream/link/2"
]
*/
server.post('/api/open_m3u/', function(req, res) { // get stream links out of an m3u file
    const m3u_url = req.body.m3u_url;
    if(m3u_url == undefined) {
        res.sendStatus(400); // Bad Request
        return;
    }

    if(!valid_url.isUri(m3u_url) || !m3u_url.endsWith('.m3u')) {
        console.log('bad m3u_url');
        res.status(400).send('bad m3u_url'); // Bad Request (bad stream_url)
        return;
    }

    axios.get(m3u_url)
    .then(function (response) {
        var lines = response.data.split(/\r?\n/);
        for(var i = 0; i < lines.length; i++) {
            if(lines[i] == '') {
                lines = lines.splice(i-1, 1);
            }
        }
        res.send(lines);
    })
    .catch(function (error) {
        res.sendStatus(500); // Internal Server Error
    });

    
});

if(isWin)
    var source_state = 'radio';

server.get('/api/source/', function(req, res) { // get Audiosource status
    if(!isWin) {
        var source_relay_state = relay.readSync();
        res.send( { source: (source_relay_state == 1 ? 'radio' : 'extern') } );
    } else {
        res.send( { source: source_state } );
    }
    console.log('aktuelle Audioquelle an den client gesendet');
});

server.get('/api/source/:state', function(req, res) { // Audiosource umschalten   state == radio oder state == extern
    var source = req.params.state;
    if(source != 'radio' && source != 'extern') {
        res.sendStatus(400); // Bad Request
        return;
    }

    console.log('Audio quelle: ' + source);
    if(!isWin) {
        relay.writeSync( source == 'radio' ? 1 : 0 );
        res.sendStatus(200); // OK
    } else {
        source_state = source;
        res.sendStatus(200); // OK
    }
});

if(!isWin) {
    setInterval(function() {
        load = getLoad();
    }, 10 * 1000);
}
server.get('/api/hardware/', function(req, res) { // Hardware Informationen holen
    if(!isWin) {
        if(load == null)
            load = getLoad();

        var housing_temp = fs.readFileSync('/sys/bus/w1/devices/28-01187ae8b3ff/w1_slave', 'utf8', 'r');
        housing_temp = housing_temp.split('t=')[1];
        housing_temp = housing_temp / 1000;
        housing_temp = Math.round(housing_temp * 10) / 10;

        var cpu_temp = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf8', 'r');
        cpu_temp = cpu_temp / 1000;
        cpu_temp = Math.round(cpu_temp * 10) / 10;

        const hardware_data = [ {
                name: 'Gehäuse Temperatur',
                min: 0,
                max: 50,
                value: housing_temp,
                unit: '°C'
            },
            {
                name: 'CPU Temperatur',
                min: 0,
                max: 110,
                value: cpu_temp,
                unit: '°C'
            },
            {
                name: 'CPU Auslastung',
                min: 0,
                max: 100,
                value: load.CPU, // wird jede Minute aktuallisiert
                unit: '%'
            },
            {
                name: 'RAM Auslastung',
                min: 0,
                max: 100,
                value: load.mem, // wird jede Minute aktuallisiert
                unit: '%'
            }
        ];

        res.send(hardware_data);
        console.log('Hardwareliste an client gesendet');
    }
    else {
        const hardware_data = [ {
                name: 'CPU Temperatur',
                min: 0,
                max: 110,
                value: 50,
                unit: '°C'
            },
            {
                name: 'CPU Auslastung',
                min: 0,
                max: 100,
                value: 5,
                unit: '%'
            },
            {
                name: 'Gehäuse Temperatur',
                min: 0,
                max: 70,
                value: 20,
                unit: '°C'
            }
        ];

        res.send(hardware_data);
        console.log('Hardwareliste an client gesendet');
    }
});

var oldCPUTime = 0
var oldCPUIdle = 0
function getLoad() {
    var cpus = os.cpus();
    var totalTime = -oldCPUTime;
    var totalIdle = -oldCPUIdle;
    for(var i = 0; i < cpus.length; i++) {
        var cpu = cpus[i]
        for(var type in cpu.times) {
            totalTime += cpu.times[type];
            if(type == 'idle') {
                totalIdle += cpu.times[type];
            }
        }
    }

    var CPUload = 100 - Math.round(totalIdle / totalTime * 100);
    oldCPUTime = totalTime;
    oldCPUIdle = totalIdle;

    return {
        CPU: CPUload,
        mem: Math.round(os.freemem() / os.totalmem() * 100)
    };
}

const listener = server.listen(port, function() {
    console.log('server wurde auf Port ' + listener.address().port + ' gestartet');
});