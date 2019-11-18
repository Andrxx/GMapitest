var as = as || {};

as.map = {
    mymap: {
       
    },

    init: function (options) {
        if (as.map.runInit) return;
        else as.map.runInit = true;
        as.map.initCallbacks();
    },

    initCallbacks: function () {

    },

    initMap: function (cont, options) {
        var mapOptions = as.map._getMapOptions(cont, options);
        //console.log('initMap');
        //console.log(mapOptions);
        mapOptions.bounds = new google.maps.LatLngBounds(); //объявление границ карты
        //создаем карту
        mapOptions.map = new google.maps.Map(document.getElementById(mapOptions.g));

        if (mapOptions.options.showUserLocation) {
            as.map._getLocation(mapOptions);
        }
        as.map._renderMap(mapOptions);
        //отображаем все радиусы доступа
        if (mapOptions.options.showAllRegions) {
            as.map._showDestination(mapOptions, null, true);
        }
    },

    _getMapOptions: function (cont, options) {
        //console.log('_getMapOptions');
        //console.log(mapOptions);
        var g = cont.attr("id");
        //console.log(g);
        if (!g) {
            g = as.map.guidGenerator();
            cont.attr('id', g);
        }
        var res = as.map.mymap[g] || {
            map: null,
            bounds: null,
            showUserLocation: false,
            locations: null
        };
        console.log(res);
        res.locations = options.locations;
        res.options = options.options;
        res.cont = cont;
        res.g = g;
        return res;
    },

    _renderMap: function (mapOptions) {
        // Установка  маркеров
        var info = new google.maps.InfoWindow(  //обязательно let - иначе не будет работать замыкание при клике
            {
                content: ""
            });
        for (var i = 0; i < mapOptions.locations.length; i++) {
            //console.log(locations[i]);
            var loc = mapOptions.locations[i];
            if (as.map._isPoint(loc)) {
                var location = new google.maps.LatLng(loc.lat, loc.lng);
                let marker = new google.maps.Marker(   //обязательно let - иначе не будет работать замыкание при клике
                    {
                        position: location,
                        map: mapOptions.map,
                        title: loc.tooltip || "",
                        animation: google.maps.Animation.DROP,
                        data: loc.description
                    });

                marker.addListener('click', function (e) {
                    info.close(); // Close previously opened infowindow
                    info.setContent(marker.data);
                    info.open(mapOptions.map, marker);
                });
                mapOptions.bounds.extend(location);
            }
            else {
                //alert('error'); //записать в лог
                continue;
            }
            mapOptions.map.fitBounds(mapOptions.bounds);
        }
    },

    //получает местонахождение пользователя, вызов коллбэка при успехе/неудаче
    _getLocation: function (mapOptions) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                // success
                function (position) {
                    // Преобразуем местоположение в объект LatLng
                    var location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    // Отображаем эту точку на карте
                    if (position.coords.accuracy < 30000) {
                        //console.log('_geolocationSuccess');
                        as.map._showUser(mapOptions, location);
                        mapOptions.bounds.extend(location);
                        if (mapOptions.options.showUserLocation) {
                            as.map._showDestination(mapOptions, location, false);
                        }
                    }
                    else {
                        console.log(position.coords.accuracy);
                        alert('Координаты определены с погрешностью.');
                    }
                },
                // failure
                function (positionError) {
                    console.log(positionError);
                    alert('Позиция не определена');
                },
                { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 }  //опции геолокации
            );
        }
        else {
            console.log("Геолокация не поддерживается вашим устройством");
        }
    },

    _showUser: function (mapOptions, location) {
        mapOptions.userLocation = location;
        var image = {
            url: mapOptions.options.userImageUrl || '',
            size: new google.maps.Size(40, 40),
            scaledSize: new google.maps.Size(40, 40)
        };
        var marker = new google.maps.Marker(
            {
                position: location,
                map: mapOptions.map,
                title: 'Вы здесь',
                icon: image
            });
        mapOptions.bounds.extend(location);
    },

    //проверка корректности позиции
    _isPoint: function (location) {
        if (location === undefined
            || location === null
            || isNaN(location.lat)
            || isNaN(location.lng)
            || location.lat < -90
            || location.lat > 90
            || location.lng < -180
            || location.lng > 180)
            return false;
        else return true;
    },

    _showDestination: function (mapOptions, userLocation, showAll) {
        //console.log("eee", mapOptions.options, userLocation);
        if (!userLocation) {
            userLocation = as.map._getCenter(mapOptions.locations);
        }
        for (var i = 0; i < mapOptions.locations.length; i++) {
            var loc = mapOptions.locations[i];
            if (as.map._isInDestination(loc, loc.radius, userLocation) || showAll) {
                try {
                    var circle = new google.maps.Circle({
                        radius: loc.radius,
                        center: loc,
                        map: mapOptions.map,
                        fillColor: loc.cssStyle.circleOptions.fillColor,
                        fillOpacity: loc.cssStyle.circleOptions.fillOpacity,
                        strokeColor: loc.cssStyle.circleOptions.strokeColor,
                        strokeOpacity: loc.cssStyle.circleOptions.strokeOpacity,
                        strokeWeight: loc.cssStyle.circleOptions.strokeWeight
                    });
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
    },

    _isInDestination: function (center, radius, point) {
        //console.log('_isInDestination');
        //console.log(center);
        //console.log(radius);
        //console.log(point);
        var isInside = false;
        var _center = new google.maps.LatLng(center.lat, center.lng);
        var _point = null;
        if (point instanceof google.maps.LatLng) {
            _point = point;
        }
        else {
            _point = new google.maps.LatLng(point.lat, point.lng);
        }
        var distance = google.maps.geometry.spherical.computeDistanceBetween(_center, _point);
        //console.log(distance);
        if (distance < radius) isInside = true;
        return isInside;
    },

    _getCenter: function (locations) {
        var lat = 0;
        var lng = 0;
        var i;
        for (i = 0; i < locations.length; i++) {
            lat += locations[i].lat;
            lng += locations[i].lng;
        }
        lat /= i;
        lng /= i;
        var centerLocation = { lat: lat, lng: lng };
        //console.log("s", centerLocation);
        return centerLocation;
    },

    guidGenerator: function () {
        var res = "";
        if (as.tools) {
            res = as.tools.guidGenerator();
        } else {
            var S4 = function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            };
            res = (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
        }
        return res;
    },

    getPlace: function (cont)
    {
        var request;
        if (!cont.reverseGeocoding) {
            request = "https://maps.googleapis.com/maps/api/geocode/json?address=" + cont.adress;
            request += "&key=" + cont.googleKey;
            var token = as.map.guidGenerator();
            request += "&sessiontoken=" + token;
            console.log(request);
            $.ajax({
                url: request,
                type: 'GET',
                success: function (data) {
                    if (data.status === "OK") {
                        var location = new google.maps.LatLng(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng);
                        //тестовое отбражение для найденого положения
                            $('#places').append(
                                '<option >' + data.results[0].formatted_address + '</option>'
                            );
                        return location;
                    }
                    //TODO - разобрать обработку ошибок запроса
                    else {
                        switch (data.status) {
                            case 'ZERO_RESULTS':
                                return null;
                            case 'OVER_DAILY_LIMIT ':
                                return null;
                            case 'OVER_QUERY_LIMIT ':
                                return null;
                            case 'REQUEST_DENIED':
                                return null;
                            case 'INVALID_REQUEST':
                                return null;
                            case 'UNKNOWN_ERROR':
                                return null;
                        }
                    }
                }
            });
        }
        //обратное геокодирование
        else {
            request = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + cont.lat + "," + cont.lng + "&key=" + cont.googleKey;
            console.log(request);
            $.ajax({
                url: request,
                type: 'GET',
                success: function (data) {
                    if (data.status === "OK") {
                        var locations = data;
                        //console.log(data);
                        $('#places').append(
                            '<option >' + data.results[0].formatted_address + '</option>'
                        );
                        return locations;
                    }
                    //TODO - разобрать обработку ошибок запроса
                    else {
                        switch (data.status) {
                            case 'ZERO_RESULTS':
                                return null;
                            case 'OVER_DAILY_LIMIT ':
                                return null;
                            case 'OVER_QUERY_LIMIT ':
                                return null;
                            case 'REQUEST_DENIED':
                                return null;
                            case 'INVALID_REQUEST':
                                return null;
                            case 'UNKNOWN_ERROR':
                                return null;
                        }
                    }
                }
            });
        }
    },

    autoSearchPlace: function(cont)
    {
        console.log(cont);
        var autocomplete = new google.maps.places.Autocomplete(document.getElementById(cont.inputField), cont.options);
        autocomplete.addListener('place_changed', function()
        {
            var place = autocomplete.getPlace();
            alert(place.formatted_address);
            console.log(place);
        });
    },


    getStaticMapUrl: function (pos, options) {
        var defOptions = {
            zoom: 14,
            width: 400,
            height: 300,
            key: ""
        };
        options = $.extend(defOptions, options);
        var latlon = pos.coords.latitude + "," + pos.coords.longitude;
        var res = "https://maps.googleapis.com/maps/api/staticmap?center=" + latlon + "&zoom=" + options.zoom + "&size=" + options.width + "x" + options.height + "&sensor=false&key=" + options.key + "";
        console.log(res);
        return res;
    }
};


$(function () {
    as.map.init({});
});