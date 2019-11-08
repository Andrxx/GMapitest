let gMap = {
    mymap: {
        //map: null,
        //bounds: null,
        //userLocation: false,
        //locations: null
    },

    initMap: function (cont, elements) {
        console.log('initMap');
        console.log(cont.guid);
        //инициализация guid
        if (gMap.mymap[cont.guid] === undefined) {
            gMap.mymap[cont.guid] = {
                map: null,
                bounds: null,
                userLocation: false,
                locations: null,
            };
            gMap.guid = cont.guid;
            console.log(gMap.guid + 'set in status');
        }
        else
        {
            if (gMap.guid !== cont.guid) gMap.guid = cont.guid;
            console.log(gMap.guid + 'reset in status');
        }
        //gMap.mymap.userLocation = false; 
        gMap.mymap[cont.guid].bounds = new google.maps.LatLngBounds(); //объявление границ карты
        //console.log(elements);
        let _locations = elements.locations;
        //TODO - поднимаем флаг для проверки радиуса доступа 
        if (elements.options.showLocationInRange)
        {
            gMap.mymap[cont.guid].userLocation = true;
            gMap.mymap[cont.guid].locations = _locations;
        }
        //создаем карту
        gMap.mymap[cont.guid].map = new google.maps.Map(document.getElementById(cont.tagID));

        if (elements.options.userLocation)
        {
            gMap._getLocation();
            gMap._renderMap(_locations);
        }
        else
        {
            gMap._renderMap(_locations);
        }
        //отображаем все радиусы доступа
        if (elements.options.showAllRegions)
        {
            gMap._showDestination(_locations, null, true);
        }
    },

    _renderMap: function (locations) {
        console.log('rendertMap');
        let guid = gMap._getGuid();
        console.log(guid);
        // Установка  маркеров
        for (let i = 0; i < locations.length; i++) {
            //console.log(locations[i]);
            if (gMap._isPoint(locations[i])) {
                let location = new google.maps.LatLng(locations[i].lat, locations[i].lng);
                let infowindow = new google.maps.InfoWindow(
                    {
                        content: locations[i].description,
                    });
                let marker = new google.maps.Marker(
                    {
                        position: location,
                        map: gMap.mymap[guid].map,
                        title: locations[i].description
                    });
                marker.addListener('click', function () {
                    infowindow.open(gMap.mymap[guid].map, marker);
                });
                gMap.mymap[guid].bounds.extend(location);
            }
            else {
                //alert('error'); //записать в лог
                continue;
            }
            gMap.mymap[guid].map.fitBounds(gMap.mymap[guid].bounds);
        }
    },

    //получает местонахождение пользователя, вызов коллбэка при успехе/неудаче
    _getLocation: function ()
    {
        if (navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition( 
                gMap._geolocationSuccess,
                gMap._geolocationFailure,
                { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 }  //опции геолокации
            );
        }
        else {
            console.log("Геолокация не поддерживается вашим устройством");
        }
    },


    _geolocationSuccess: function (position)
    {
        // Преобразуем местоположение в объект LatLng
        let location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        // Отображаем эту точку на карте
        if (position.coords.accuracy < 30000)
        {
            //console.log('_geolocationSuccess');
            //console.log(gMap.mymap.locations);
            let guid = gMap._getGuid();
            console.log(guid);
            gMap._showUser(location);
            gMap.mymap[guid].bounds.extend(location);
            //TODO - обработка флага для отображения зоны доступа
            if (gMap.mymap[guid].userLocation)
            {
                gMap._showDestination(gMap.mymap[guid].locations, location, false);
            }
        }
        else {
            console.log(position.coords.accuracy);
            alert('Координаты определены с погрешностью.');
        }
    },

    _geolocationFailure: function (positionError) {
        console.log(positionError);
        alert('Позиция не определена');
    },

    _showUser: function (location)
    {
        let guid = gMap._getGuid();
        gMap.mymap[guid].userLocation = location;
        let image = {
            url: '/LocLogo.png',
            size: new google.maps.Size(40, 40),
            scaledSize: new google.maps.Size(40, 40)
        };
        let marker = new google.maps.Marker(
            {
                position: location,
                map: gMap.mymap[guid].map,
                title: 'Вы здесь',
                icon: image,
            });
        gMap.mymap[guid].bounds.extend(location);
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

    _showDestination: function (locations, userLocation, showAll = false)
    {
        console.log('_showDestination');
        //console.log(locations);
        let guid = gMap._getGuid();
        console.log(guid);
        //console.log(userLocation);
        if (!userLocation) userLocation = gMap._getCenter(locations);
        for (let i = 0; i < locations.length; i++)
        {
            if (gMap._isInDestination(locations[i], locations[i].radius, userLocation) || showAll)
            {
                try {
                    let circle = new google.maps.Circle({
                        radius: locations[i].radius,
                        center: locations[i],
                        map: gMap.mymap[guid].map,
                        fillColor: locations[i].cssStyle.circleOptions.fillColor,
                        fillOpacity: locations[i].cssStyle.circleOptions.fillOpacity,
                        strokeColor: locations[i].cssStyle.circleOptions.strokeColor,
                        strokeOpacity: locations[i].cssStyle.circleOptions.strokeOpacity,
                        strokeWeight: locations[i].cssStyle.circleOptions.strokeWeight,
                    });
                }
                catch(error){
                    console.log(error);
                }
                //let circle = new google.maps.Circle({ radius: locations[i].radius, center: locations[i], map: gMap.mymap.map });
            }
        }
    },

    _isInDestination: function (center, radius, point)
    {
        //console.log('_isInDestination');
        //console.log(center);
        //console.log(radius);
        //console.log(point);
        let isInside = false;
        let _center = new google.maps.LatLng(center.lat, center.lng);
        let _point = null;
        if (point instanceof google.maps.LatLng) {
            _point = point;
        }
        else {
            _point = new google.maps.LatLng(point.lat, point.lng);
        }
        let distance = google.maps.geometry.spherical.computeDistanceBetween(_center, _point);
        //console.log(distance);
        if (distance < radius) isInside = true;
        return isInside;
    },

    _getCenter: function (locations) {
        let lat = 0;
        let lng = 0;
        let i;
        for (i = 0; i < locations.length; i++) {
            lat += locations[i].lat;
            lng += locations[i].lng;
        }
        lat /= i;
        lng /= i;
        let centerLocation = { lat: lat, lng: lng };
        return centerLocation;
    },

    _getGuid: function ()
    {
        console.log('_getGuid');
        console.log(gMap.guid);
        if (gMap.guid !== undefined) return gMap.guid;
    },
};