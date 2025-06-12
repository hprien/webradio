var source_state = 'radio'; // true = radio     false = external Buchse

var station_list;

// scroll
const scroll_up = document.getElementById("scroll-up-button");
const scroll_down = document.getElementById("scroll-down-button");
window.addEventListener('scroll', function(event) {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scroll_up.style.display = "flex";
    } else {
        scroll_up.style.display = "none";
    }
});

function scroll_to_top() {
    window.scrollTo( {top: 0, behavior: 'smooth'} );
}
function goto(element) {
    element.scrollIntoView( {block: "start", behavior: "smooth"} );
}
function goto_stop(element) {
    element.scrollIntoView( {block: "end", behavior: "smooth"} );
}

// stations
load_stations();
function load_stations() {
    // load playing station
    fetch("/api/player/", {
        method: "GET"
    })
    .then(response => response.json() )
    .then(data => {
        if(data.status == "play") {
            const playing_station_id = data.station_id;

            // load station list
            fetch("/api/stations/", {
                method: "GET"
            })
            .then(response => response.json() )
            .then(data => {
                station_list = data;

                var station_holder = document.getElementById("stationHolder");
                station_holder.innerHTML = "";
                for(var i = 0; i < station_list.length; i++) {
                    var station = station_list.find(function(station) {
                        return station.position == i+1;
                    });
                    
                    /*<div class="station">
                        <div class="station-icon-holder">
                            <div class="station-control-holder">
                                <svg class="station-control-menu" onclick="stationDialog(2, this);" viewBox="0 0 44 194"> <path d="M 19.00,0.47            C 13.91,1.67 9.91,3.23 6.19,7.10              -7.82,21.68 3.42,47.89 27.00,43.67              52.57,39.10 47.91,-2.94 19.00,0.47 Z            M 17.00,75.53            C 9.09,77.89 2.44,83.71 0.53,92.00              -3.10,107.69 11.31,122.10 27.00,118.47              47.15,113.82 49.73,87.06 32.00,77.41              27.11,74.76 22.34,74.66 17.00,75.53 Z            M 16.00,150.53            C 7.16,153.29 0.75,160.57 0.10,170.00              -0.86,183.80 12.09,196.45 26.00,193.32              44.65,189.13 50.69,165.35 34.96,153.80              29.25,149.61 22.73,149.42 16.00,150.53 Z" /> </svg>
                                <svg class="station-control-moveButton-up" onclick="moveStation('up', this);" viewBox="0 0 444 256"> <path d="M 221.00,1.34            C 215.54,4.31 207.72,13.28 203.00,18.00              203.00,18.00 170.00,51.00 170.00,51.00              170.00,51.00 62.00,159.00 62.00,159.00              62.00,159.00 20.00,201.00 20.00,201.00              17.05,203.95 2.90,217.59 1.74,220.00              -0.17,224.01 4.49,227.47 7.00,230.00              7.00,230.00 26.00,249.00 26.00,249.00              27.82,250.80 31.31,254.80 34.00,254.80              37.07,254.80 42.79,248.21 45.00,246.00              45.00,246.00 72.00,219.00 72.00,219.00              72.00,219.00 181.00,110.00 181.00,110.00              181.00,110.00 210.00,81.00 210.00,81.00              212.27,78.73 219.00,71.04 222.00,71.04              224.93,71.04 230.85,77.85 233.00,80.00              233.00,80.00 260.00,107.00 260.00,107.00              260.00,107.00 367.00,214.00 367.00,214.00              367.00,214.00 399.00,246.00 399.00,246.00              401.48,248.48 407.26,255.60 411.00,254.66              413.27,254.10 417.26,249.74 419.00,248.00              419.00,248.00 437.00,230.00 437.00,230.00              439.09,227.89 443.49,224.32 442.66,221.00              441.97,218.24 432.50,209.50 430.00,207.00              430.00,207.00 397.00,174.00 397.00,174.00              397.00,174.00 273.00,50.00 273.00,50.00              273.00,50.00 237.00,14.00 237.00,14.00              232.92,9.92 226.83,1.60 221.00,1.34 Z" /> </svg>
                                <svg class="station-control-moveButton-down" onclick="moveStation('down', this);" viewBox="0 0 444 256"> <path d="M 221.00,1.34            C 215.54,4.31 207.72,13.28 203.00,18.00              203.00,18.00 170.00,51.00 170.00,51.00              170.00,51.00 62.00,159.00 62.00,159.00              62.00,159.00 20.00,201.00 20.00,201.00              17.05,203.95 2.90,217.59 1.74,220.00              -0.17,224.01 4.49,227.47 7.00,230.00              7.00,230.00 26.00,249.00 26.00,249.00              27.82,250.80 31.31,254.80 34.00,254.80              37.07,254.80 42.79,248.21 45.00,246.00              45.00,246.00 72.00,219.00 72.00,219.00              72.00,219.00 181.00,110.00 181.00,110.00              181.00,110.00 210.00,81.00 210.00,81.00              212.27,78.73 219.00,71.04 222.00,71.04              224.93,71.04 230.85,77.85 233.00,80.00              233.00,80.00 260.00,107.00 260.00,107.00              260.00,107.00 367.00,214.00 367.00,214.00              367.00,214.00 399.00,246.00 399.00,246.00              401.48,248.48 407.26,255.60 411.00,254.66              413.27,254.10 417.26,249.74 419.00,248.00              419.00,248.00 437.00,230.00 437.00,230.00              439.09,227.89 443.49,224.32 442.66,221.00              441.97,218.24 432.50,209.50 430.00,207.00              430.00,207.00 397.00,174.00 397.00,174.00              397.00,174.00 273.00,50.00 273.00,50.00              273.00,50.00 237.00,14.00 237.00,14.00              232.92,9.92 226.83,1.60 221.00,1.34 Z" /> </svg>
                            </div>
                            <img class="station-icon" onclick="startStation(this);" src="https://d3kle7qwymxpcy.cloudfront.net/images/broadcasts/81/d7/9111/1/c175.png">
                        </div>
                        <p>Antenne Bayern</p>
                    </div>*/
                    var station_element = document.createElement("div");
                    station_element.setAttribute("class", "station");
                    if(i == station_list.length - 1)
                        station_element.classList.add('last-station');

                    // is this station the playing one?
                    if(station.id == playing_station_id) {
                        station_element.style.boxShadow = '0 0 15px var(--high1)';
                        station_element.setAttribute('id', 'playing_station_element');
                    }

                    var station_icon_holder = document.createElement("div");
                    station_icon_holder.setAttribute("class", "station-icon-holder");

                    var station_control_holder = document.createElement("div");
                    station_control_holder.setAttribute("class", "station-control-holder");
                    station_control_holder.innerHTML += `<svg class="station-control-menu" onclick="station_menu('existing_station', ${station.id});" viewBox="0 0 44 194"> <path d="M 19.00,0.47            C 13.91,1.67 9.91,3.23 6.19,7.10              -7.82,21.68 3.42,47.89 27.00,43.67              52.57,39.10 47.91,-2.94 19.00,0.47 Z            M 17.00,75.53            C 9.09,77.89 2.44,83.71 0.53,92.00              -3.10,107.69 11.31,122.10 27.00,118.47              47.15,113.82 49.73,87.06 32.00,77.41              27.11,74.76 22.34,74.66 17.00,75.53 Z            M 16.00,150.53            C 7.16,153.29 0.75,160.57 0.10,170.00              -0.86,183.80 12.09,196.45 26.00,193.32              44.65,189.13 50.69,165.35 34.96,153.80              29.25,149.61 22.73,149.42 16.00,150.53 Z" /> </svg>`;
                    station_control_holder.innerHTML += `<svg class="station-control-moveButton-up" ${(i==0 ? 'style="visibility: hidden"' : '')} onclick="move_station(\'up\', ${station.id});" viewBox="0 0 444 256"> <path d="M 221.00,1.34            C 215.54,4.31 207.72,13.28 203.00,18.00              203.00,18.00 170.00,51.00 170.00,51.00              170.00,51.00 62.00,159.00 62.00,159.00              62.00,159.00 20.00,201.00 20.00,201.00              17.05,203.95 2.90,217.59 1.74,220.00              -0.17,224.01 4.49,227.47 7.00,230.00              7.00,230.00 26.00,249.00 26.00,249.00              27.82,250.80 31.31,254.80 34.00,254.80              37.07,254.80 42.79,248.21 45.00,246.00              45.00,246.00 72.00,219.00 72.00,219.00              72.00,219.00 181.00,110.00 181.00,110.00              181.00,110.00 210.00,81.00 210.00,81.00              212.27,78.73 219.00,71.04 222.00,71.04              224.93,71.04 230.85,77.85 233.00,80.00              233.00,80.00 260.00,107.00 260.00,107.00              260.00,107.00 367.00,214.00 367.00,214.00              367.00,214.00 399.00,246.00 399.00,246.00              401.48,248.48 407.26,255.60 411.00,254.66              413.27,254.10 417.26,249.74 419.00,248.00              419.00,248.00 437.00,230.00 437.00,230.00              439.09,227.89 443.49,224.32 442.66,221.00              441.97,218.24 432.50,209.50 430.00,207.00              430.00,207.00 397.00,174.00 397.00,174.00              397.00,174.00 273.00,50.00 273.00,50.00              273.00,50.00 237.00,14.00 237.00,14.00              232.92,9.92 226.83,1.60 221.00,1.34 Z" /> </svg>`;
                    station_control_holder.innerHTML += `<svg class="station-control-moveButton-down" ${(i==station_list.length-1 ? 'style="visibility: hidden"' : '')} onclick="move_station(\'down\', ${station.id});" viewBox="0 0 444 256"> <path d="M 221.00,1.34            C 215.54,4.31 207.72,13.28 203.00,18.00              203.00,18.00 170.00,51.00 170.00,51.00              170.00,51.00 62.00,159.00 62.00,159.00              62.00,159.00 20.00,201.00 20.00,201.00              17.05,203.95 2.90,217.59 1.74,220.00              -0.17,224.01 4.49,227.47 7.00,230.00              7.00,230.00 26.00,249.00 26.00,249.00              27.82,250.80 31.31,254.80 34.00,254.80              37.07,254.80 42.79,248.21 45.00,246.00              45.00,246.00 72.00,219.00 72.00,219.00              72.00,219.00 181.00,110.00 181.00,110.00              181.00,110.00 210.00,81.00 210.00,81.00              212.27,78.73 219.00,71.04 222.00,71.04              224.93,71.04 230.85,77.85 233.00,80.00              233.00,80.00 260.00,107.00 260.00,107.00              260.00,107.00 367.00,214.00 367.00,214.00              367.00,214.00 399.00,246.00 399.00,246.00              401.48,248.48 407.26,255.60 411.00,254.66              413.27,254.10 417.26,249.74 419.00,248.00              419.00,248.00 437.00,230.00 437.00,230.00              439.09,227.89 443.49,224.32 442.66,221.00              441.97,218.24 432.50,209.50 430.00,207.00              430.00,207.00 397.00,174.00 397.00,174.00              397.00,174.00 273.00,50.00 273.00,50.00              273.00,50.00 237.00,14.00 237.00,14.00              232.92,9.92 226.83,1.60 221.00,1.34 Z" /> </svg>`;

                    var img = document.createElement("img");
                    img.setAttribute("class", "station-icon");
                    img.setAttribute("src", station.icon_url);
                    img.setAttribute('onclick', `start_station(${station.id});`);

                    station_icon_holder.appendChild(station_control_holder);
                    station_icon_holder.appendChild(img);

                    var p = document.createElement("p");
                    p.innerText = station.name;

                    station_element.appendChild(station_icon_holder);
                    station_element.appendChild(p);

                    station_holder.appendChild(station_element);
                }
            })
            .catch(error => {
                console.log("fetch error: " + error);
            });
        }
    })
    .catch(error => {
        console.log("fetch error: " + error);
    });
}

// now playing information
load_now_playing();
setInterval(load_now_playing, 1000);
function load_now_playing() {
    if(source_state == 'radio') {
        fetch("/api/player/", {
            method: "GET"
        })
        .then(response => response.json() )
        .then(data => {
            const now_playing = document.getElementById('now-playing');
            if(data.now_playing != '') { // if station offers now playing information
                now_playing.innerText = data.now_playing.trim();
            }
            else {
                // show station name instead
                const station_name = station_list.find((station) => {
                    return station.id == data.station_id;
                }).name;

                now_playing.innerText = station_name;
            }
            now_playing.style.display = 'block';
        })
        .catch(error => {
            console.log("fetch error: " + error);
        });
    }
}

function move_station(action, station_id) {
    fetch(`/api/stations/${station_id}`, {
        method: "PUT",
        headers: {
            "content-Type": "application/json"
        },
        body: `{ "position_action": "${action}" }`
    })
    .then(data => {
        load_stations();
    })
    .catch(error => {
        console.log("fetch error: " + error);
    });
}

function start_station(station_id) {
    fetch(`/api/player/start/${station_id}`, {
        method: "GET"
    })
    .then(data => {
        load_stations();
    })
    .catch(error => {
        console.log("fetch error: " + error);
    });
}

const sm_elem = document.querySelector('.station_menu');
const sm_title_elem = document.querySelector('.sm_title');

const sm_box_title = document.querySelector('.sm_box_title');
const sm_delete_elem = document.querySelector('.sm_delete');
const sm_move_elem = document.querySelector('.sm_move');
const sm_sopy_elem = document.querySelector('.sm_copy');

const sm_field_name_elem = document.querySelector('.sm_field_name');
const sm_field_icon_elem = document.querySelector('.sm_field_icon');
const sm_field_stream_elem = document.querySelector('.sm_field_stream');
const sm_field_copy_elem = document.querySelector('.sm_field_copy');
var station_in_edit;
function station_menu(mode, station_id) {
    if(mode == 'add_station') {
        sm_elem.style.display = 'flex'; // display menu
        sm_title_elem.innerText = 'Hinzufügen'; // menu title

        sm_box_title.style.display = 'none';
        sm_delete_elem.style.display = 'none'; // delete button
        sm_move_elem.style.display = 'none'; // move section
        sm_sopy_elem.style.display = 'none'; // copy section

        sm_field_name_elem.value = '';
        sm_field_icon_elem.value = '';
        sm_field_stream_elem.value = '';

        station_in_edit = undefined;
    }
    else if(mode == 'existing_station') {
        sm_elem.style.display = 'flex'; // display menu
        sm_title_elem.innerText = 'Sender'; // menu title

        sm_box_title.style.display = 'block';
        sm_delete_elem.style.display = 'inline-block'; // delete button
        sm_move_elem.style.display = 'block'; // move section
        sm_sopy_elem.style.display = 'block'; // copy section

        var station = station_list.find(function(station) {
            return station.id == station_id;
        });

        sm_field_name_elem.value = station.name;
        sm_field_icon_elem.value = station.icon_url;
        sm_field_stream_elem.value = station.stream_url;
        sm_field_copy_elem.value = '';

        station_in_edit = station.id;
    }
    else if(mode == 'close') {
        sm_elem.style.display = 'none'; // display menu
    }
}

function save_station() {
    const name = sm_field_name_elem.value;
    const icon_url = sm_field_icon_elem.value;
    const stream_url = sm_field_stream_elem.value;

    var station = {
        name: name,
        icon_url: icon_url,
        stream_url: stream_url,
    };

    if(station_in_edit == undefined) { // new station will be added
        fetch('/api/stations/', {
            method: "POST",
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify(station)
        })
        .then(res => {
            if(res.ok) {
                station_menu('close');
                load_stations();
            }
            else
                res.text().then(text => {
                    switch(text) {
                        case "bad name":
                            alert("Du hast den Namen vergessen");
                            break;
                        case "bad icon_url":
                            alert("Der eingegebene Icon Link scheint keie URL zu sein.");
                            break;
                        case "bad stream_url":
                            alert("Der eingegebene Stream Link scheint keine URL zu sein.");
                            break;
                    }
                });
        });
    }
    else { // existing station will be modified
        fetch(`/api/stations/${station_in_edit}`, {
            method: "PUT",
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify(station)
        })
        .then(res => {
            if(res.ok) {
                station_menu('close');
                load_stations();
            }
            else
                res.text().then(text => {
                    switch(text) {
                        case "bad name":
                            alert("Du hast den Namen vergessen");
                            break;
                        case "bad icon_url":
                            alert("Der eingegebene Icon Link scheint keie URL zu sein.");
                            break;
                        case "bad stream_url":
                            alert("Der eingegebene Stream Link scheint keine URL zu sein.");
                            break;
                    }
                });
        });
    }
}

function delete_station() {
    fetch(`/api/stations/${station_in_edit}`, {
        method: "DELETE"
    })
    .then(res => {
        if(res.ok) {
            station_menu('close');
            load_stations();
        }
    });
}

function copy_station() {
    const icon_url = sm_field_icon_elem.value;
    const stream_url = sm_field_stream_elem.value;
    const copy_name = sm_field_copy_elem.value;

    var station = {
        name: copy_name,
        icon_url: icon_url,
        stream_url: stream_url,
    };

    fetch('/api/stations/', {
        method: "POST",
        headers: {
            "content-Type": "application/json"
        },
        body: JSON.stringify(station)
    })
    .then(res => {
        if(res.ok) {
            station_menu('close');
            load_stations();
        }
        else
            res.text().then(text => {
                switch(text) {
                    case "bad name":
                        alert("Du hast den Namen vergessen");
                        break;
                    case "bad icon_url":
                        alert("Der eingegebene Icon Link scheint keie URL zu sein.");
                        break;
                    case "bad stream_url":
                        alert("Der eingegebene Stream Link scheint keine URL zu sein.");
                        break;
                }
            });
    });
}

const lm_elem = document.querySelector('.load_m3u');
const lm_m3u_url_elem = document.querySelector('.lm_m3u_url');
function m3u_dialog(mode) {
    if(mode == 'open') {
        lm_elem.style.display = 'flex'; // load m3u dialog
        lm_m3u_url_elem.value = ''; // m3u url tet input
    }
    else if(mode == 'close') {
        lm_elem.style.display = 'none'; // load m3u dialog
    }
}

function load_m3u() {
    fetch('/api/open_m3u/', {
        method: "POST",
        headers: {
            "content-Type": "application/json"
        },
        body: JSON.stringify({
            m3u_url: lm_m3u_url_elem.value
        })
    })
    .then(res => {
        if(res.ok) {
            res.text().then(text => {
                text = JSON.parse(text);
                sm_field_stream_elem.value = text[0];
                m3u_dialog('close');
            });
        }
        else
            res.text().then(text => {
                switch(text) {
                    case "bad m3u_url":
                        alert("Der eingegebene m3u Link scheint keie URL zu sein oder nicht mit .m3u zu enden.");
                        break;
                }
            });
    });
}

// audio source
get_running_source();
function get_running_source() {
    fetch("/api/source/", {
        method: "GET"
    })
    .then( response => response.json() )
    .then(data => {
        if(data.source == "extern") {
            document.getElementById("external-source").style.display = "block";
            document.getElementById("radio-source").style.display = "none";
            document.getElementById("menu").style.display = "none";
            document.getElementById("stationHolder").style.display = "none";
            document.getElementById("scroll-down-button").style.display = "none";
            document.getElementById("add-station-button").style.display = "none";
            source_state = 'extern';
        }
        else {
            document.getElementById("external-source").style.display = "none";
            document.getElementById("radio-source").style.display = "block";
            document.getElementById("menu").style.display = "flex";
            document.getElementById("stationHolder").style.display = "flex";
            document.getElementById("scroll-down-button").style.display = "flex";
            document.getElementById("add-station-button").style.display = "flex";
            source_state = 'radio';
        }
    })
    .catch(error => {
        console.log("fetch error: " + error);
    });
}

function switch_source() {
    if(source_state == 'radio') {
        fetch("/api/source/extern", {
            method: "GET"
        })
        .then(data => {
            document.getElementById("external-source").style.display = "block";
            document.getElementById("radio-source").style.display = "none";
            document.getElementById("menu").style.display = "none";
            document.getElementById("now-playing").style.display = "none";
            document.getElementById("stationHolder").style.display = "none";
            document.getElementById("scroll-down-button").style.display = "none";
            document.getElementById("add-station-button").style.display = "none";
            source_state = 'extern';
        })
        .catch(error => {
            console.log("fetch error: " + error);
        });
    }
    else {
        fetch("/api/source/radio", {
            method: "GET"
        })
        .then(data => {
            document.getElementById("external-source").style.display = "none";
            document.getElementById("radio-source").style.display = "block";
            document.getElementById("menu").style.display = "flex";
            document.getElementById("now-playing").style.display = "block";
            document.getElementById("stationHolder").style.display = "flex";
            document.getElementById("scroll-down-button").style.display = "flex";
            document.getElementById("add-station-button").style.display = "flex";
            source_state = 'radio';
        })
        .catch(error => {
            console.log("fetch error: " + error);
        });
    }
}

// hardware
get_hardware();
const hardware_holder_element = document.getElementById("hardwareHolder");
function get_hardware() {
    fetch("/api/hardware/", {
        method: "GET"
    })
    .then( response => response.json() )
    .then(data => {
        hardware_holder_element.innerHTML = "";
        for(var i = 0; i < data.length; i++)
        {
            var meter = document.createElement("div");
            meter.setAttribute("class", "meter");

            var meter_title = document.createElement("div");
            meter_title.setAttribute("class", "meter-title");
            meter_title.innerText = data[i].name;

            var meter_body = document.createElement("div");
            meter_body.setAttribute("class", "meter-body");

            var meter_fill = document.createElement("div");
            meter_fill.setAttribute("class", "meter-fill");
            meter_fill.style.transform = "rotate(" + (0.5 * (data[i].value * 100 / (data[i].max - data[i].min)) / 100) + "turn)";

            var meter_value = document.createElement("div");
            meter_value.setAttribute("class", "meter-value");
            meter_value.innerText = data[i].value + data[i].unit;

            meter_body.appendChild(meter_fill);
            meter_body.appendChild(meter_value);

            meter.appendChild(meter_title);
            meter.appendChild(meter_body);

            hardware_holder_element.appendChild(meter);
        }
    })
    .catch(error => {
        console.log("fetch error: " + error);
    });
}

// Audio Animation
setInterval(renderCanvas, 50);
var canvas = document.getElementById("audio-trafic");
var c = canvas.getContext('2d');
var boxPositions = [ 0, 25, 50, 75, 100];
function renderCanvas() {
    var w = c.canvas.width;
    var h = c.canvas.height;

    var size = canvas.clientHeight / 3;

    // background
    c.beginPath();
    c.rect(0, 0, w, h);
    c.fillStyle = "rgb(27, 27, 27)";
    c.fill();

    for(var i = 0; i < boxPositions.length; i++) {
        var absolutePosition = w * boxPositions[i] / 100;
        
        c.beginPath();
        c.rect(absolutePosition, h / 2 - size / 2, size, size);
        c.fillStyle = "rgb(13, 202, 130)";
        c.fill();

        boxPositions[i] += 2;
        if(absolutePosition >= w)
            boxPositions[i] = Math.min(...boxPositions) - 25;
    }
}