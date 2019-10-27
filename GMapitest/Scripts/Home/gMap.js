let gMap = {
    mymap: {
        map: null,
        bounds: null,
        userLocation: null
    },
    options:
    {
        googleKey: '',
        tagIg: 'map'
    },

    init: function (items, options) {
        if (gMap.runOnce) {
            return;
        }
        else
        {
            gMap.runOnce = true;
            gMap.options = $.extend(gMap.options, options);
            //gMap.mymap.map = new google.maps.Map(document.getElementById(gMap.options.tagIg));
            gMap.mymap.bounds = new google.maps.LatLngBounds(); //объявление границ карты
        }
    },

    initMap: function (container, tagId) {
        console.log('initMap');
        //парсим контейнер
        let _container = JSON.parse(container);
        //console.log(_container);
        let _locations = _container.locations;
        //создаем карту
        gMap.mymap.map = new google.maps.Map(document.getElementById(tagId));

        if (_container.options.userLocation)
        {
            let userLoc = gMap._getLocation(/*callback(gMap._showUser)*/);//.then(console.log(gMap.mymap.userLocation));
            console.log(userLoc);
            gMap._renderMap(_locations);
            if (_container.options.showLocationInRange)
            {
                //let center = gMap._getCenter(_locations);
                let center = gMap.mymap.userLocation;
                console.log(center);
                //gMap._showUser(center);
                gMap._showDestination(_locations, center, false);
            }
        }
        else
        {
            gMap._renderMap(_locations);
        }
        //отображаем все радиусы доступа
        if (_container.options.showAllRegions)
        {
            gMap._showDestination(_locations, null, true);
        }
    },

    _renderMap: function (_locations) {
        // Установка  маркеров
        for (let i = 0; i < _locations.length; i++) {
            //console.log(locations[i]);
            if (gMap._isPoint(_locations[i])) {
                let location = new google.maps.LatLng(_locations[i].lat, _locations[i].lng);
                let infowindow = new google.maps.InfoWindow(
                    {
                        content: _locations[i].description,
                    });
                let marker = new google.maps.Marker(
                    {
                        position: location,
                        map: gMap.mymap.map,
                        title: _locations[i].description
                    });
                marker.addListener('click', function () {
                    infowindow.open(gMap.mymap.map, marker);
                });
                gMap.mymap.bounds.extend(location);
            }
            else {
                //alert('error'); //записать в лог
                continue;
            }
            gMap.mymap.map.fitBounds(gMap.mymap.bounds);
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
        } else {
            console.log("Геолокация не поддерживается вашим устройством");
        }
    },

    //_getLocation: function () {
    //    return new Promise((resolve, reject) => {
    //        if (navigator.geolocation) {
    //            navigator.geolocation.getCurrentPosition(
    //                (position, resolve) => gMap._geolocationSuccess(position, resolve),
    //                (position, reject) => gMap._geolocationFailure(position, reject),
    //                { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }  //опции геолокации
    //            );
    //        } else {
    //            console.log("Геолокация не поддерживается вашим устройством");
    //            reject();
    //        }
    //    });
    //},

    _geolocationSuccess: function (position)
    {
        // Преобразуем местоположение в объект LatLng
        let location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        // Отображаем эту точку на карте
        if (position.coords.accuracy < 30000) {
            gMap._showUser(location);
            gMap.mymap.bounds.extend(location);
            //console.log(position.coords.accuracy);
            gMap.mymap.userLocation = location;
            return location;
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

    //_geolocationSuccess: function (position, resolve) {
    //    // Преобразуем местоположение в объект LatLng
    //    let location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    //    // Отображаем эту точку на карте
    //    if (position.coords.accuracy < 5000) {
    //        gMap._showUser(location);
    //        gMap.mymap.bounds.extend(location);
    //        console.log(position.coords.accuracy);
    //        gMap.mymap.userLocation = location;
    //    }
    //    else {
    //        console.log(position.coords.accuracy);
    //        alert('Координаты определены с погрешностью.');
    //    }
    //    //resolve();
    //},

    //_geolocationFailure: function (positionError, reject) {
    //    console.log(positionError);
    //    alert('Позиция не определена');
    //    reject();
    //},

    _showUser: function (location)
    {
        gMap.mymap.userLocation = location;
        let image = {
            url: '/LocLogo.png',
            size: new google.maps.Size(40, 40),
            scaledSize: new google.maps.Size(40, 40)
        };
        let marker = new google.maps.Marker(
            {
                position: location,
                map: gMap.mymap.map,
                title: 'Вы здесь',
                icon: image,
            });
        //alert('marker');
        gMap.mymap.bounds.extend(location);
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
        //console.log(userLocation);
        if (!userLocation) userLocation = gMap._getCenter(locations);
        for (let i = 0; i < locations.length; i++)
        {
            //let asd = gMap._isInDestination(locations[i], locations[i].radius, userLocation);
            //console.log(asd);
            if (gMap._isInDestination(locations[i], locations[i].radius, userLocation) || showAll)
            {
                let circle = new google.maps.Circle({ radius: locations[i].radius, center: locations[i], map: gMap.mymap.map });
            }
        }
    },

    _isInDestination: function (center, radius, point)
    {
        console.log('_isInDestination');
        console.log(center);
        console.log(radius);
        console.log(point);
        let isInside = false;
        //if (gMap._isPoint(center) || gMap._isPoint(point)) return isInside;
        let _center = new google.maps.LatLng(center.lat, center.lng);
        let _point = null;
        if (point instanceof google.maps.LatLng) {
            _point = point;
        }
        else {
            _point = new google.maps.LatLng(point.lat, point.lng);
        }
        let distance = google.maps.geometry.spherical.computeDistanceBetween(_center, _point);
        console.log(distance);
        if (distance < radius) isInside = true;
        console.log(isInside);
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

};