let gMap = {
    mymap:  {
        map: null,
        bounds: null
    },
    options:
    {
        googleKey: '',
        tagIg: 'map'
        
    },

    init: function (items, options) {
        if (gMap.runOnce)
        {
            return;
        }
        else
        {
            //alert('init');
            gMap.runOnce = true;
            gMap.options = $.extend(gMap.options, options);
            //console.log(items);
            //gMap.renderMap(items);
        }
    },

    renderMap: function (locations, )
    {
        //установка начала координат, если не определится местоположение 
        let mapCenter;
        if (!gMap._isPoint(mapCenter))
        {
            mapCenter = gMap._getCenter(locations);
        }
        gMap.mymap.bounds = new google.maps.LatLngBounds();
        //берем настройки из params 
        //проверка данных    
        //визуализация в контейнере
        $(function initMap()
        {
            gMap.mymap.map = new google.maps.Map(document.getElementById('map'));
            let newlocation = { lat: 43.6060604, lng: 39.7322588 }; // { lat: 43.6210114, lng: 39.7183147}; 
            // Установка  маркеров
            for (let i = 0; i < locations.length; i++)
            {
                if (gMap._isPoint(locations[i]))
                {
                    let location = new google.maps.LatLng(locations[i].lat, locations[i].lng);
                    let infowindow = new google.maps.InfoWindow({
                        content: locations[i].description,
                    });
                    let marker = new google.maps.Marker(
                        {
                            position: location,
                            map: gMap.mymap.map,
                            title: locations[i].description
                        });

                    marker.addListener('click', function () {
                        infowindow.open(gMap.mymap.map, marker);
                    });
                    gMap.mymap.bounds.extend(location);

                    if (gMap._isInDestination(locations[i], locations[i].radius, newlocation))
                    {
                        //gMap.mymap.bounds.extend(location);
                        let circle = new google.maps.Circle({ radius: locations[i].radius, center: location, map: gMap.mymap.map });
                        gMap._setUser(newlocation);
                    }
                }
                    else
                    {
                        //alert('error'); //записать в лог
                        continue;
                    }
            }
            gMap.mymap.map.fitBounds(gMap.mymap.bounds);
            //gMap.getLocation();
                //map.addListener('rightclick', function () {
                //    map.panTo(marker.getPosition());
                //});
        });
    },

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

    //function that gets the location and returns it
    getLocation: function ()
    {
        if (navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition(
                gMap.geolocationSuccess, gMap.geolocationFailure);
        } else
        {
            console.log("Геолокация не поддерживается вашим устройством");
        }
    },

    _geolocationSuccess: function (position) {
        // Преобразуем местоположение в объект LatLng
        let location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        // Отображаем эту точку на карте
        if (position.coords.accuracy < 5000) {
            //gMap.mymap.map.setCenter(location);
            gMap.setUser(location);
        }
        else
        { 
            console.log(position.coords.accuracy);
            //alert('Координаты определены с погрешностью.');
        }
    },

    _geolocationFailure: function (positionError)
    {
        //console.log(positionError);
        //goToDefaultLocation();
    },

    _getCenter: function (locations)
    {
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

    _isInDestination: function (center, radius, point)
    {
        let isInside = false;
        let _center = new google.maps.LatLng(center.lat, center.lng);
        let _point = new google.maps.LatLng(point.lat, point.lng);
        let distance = google.maps.geometry.spherical.computeDistanceBetween(_center, _point);
        if (distance < radius) isInside = true;
        return isInside;
    },

    _setUser: function (location)
    {
        console.log(location);
        let image = {
            url: '/LocLogo.png',
            size: new google.maps.Size(40, 40),
            scaledSize: new google.maps.Size(25, 25)
        };
        let _location = new google.maps.LatLng(location.lat, location.lng);
        console.log(_location);
        let marker = new google.maps.Marker(
            {
                position: _location,
                map: gMap.mymap.map,
                title: 'Вы здесь',
                icon: image,
            });
        gMap.mymap.bounds.extend(_location);
    }
};


