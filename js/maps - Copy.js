
map = null;
markers = new Array();
current_postion = null;
directionsDisplay = null;
var infowindow = null;

// *** Map initialization
function initMap() {

// *** Create Map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -15.7725309, lng: 47.885160199999994},
        zoom: 18,
        streetViewControl: false,
        //mapTypeControl: false,
        //disableDefaultUI: true,
        mapTypeId: 'roadmap',
        styles: [
            {
                "featureType": "poi",
                "stylers": [
                    { "visibility": "off" }
                ]
            }
        ]
    });

    // *** Get user geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {

            console.log('- Trying to get Geolocation');

            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            current_postion = pos;
            marker = new google.maps.Marker({
                id: -1,
                map: map,
                draggable: false,
                optimized: false, // <-- required for animated gif
                //animation: google.maps.Animation.DROP,
                position: pos,
                icon: "images/pin.png",
                'you': __.message_you
            });
            // marker.setAnimation(google.maps.Animation.BOUNCE);
            // setTimeout(toggleBounce, 3600);

            var label_you = new Label({
                'map': map,
                'label_type': 'you',
            });
            label_you.bindTo('position', marker, 'position');
            label_you.bindTo('text', marker, 'you');

            var infowindowYou = new google.maps.InfoWindow({
                content: __.message_you_are_here
            });
            marker.addListener('click', function () {
                infowindowYou.open(map, marker);
            });
            map.setCenter(pos);
        }, function () {
            console.log('- User denied Geolocation');
            handleLocationError(true, infowindowYou, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        console.log('- Browser not support Geolocation');
        handleLocationError(false, infoWindow, map.getCenter());
    }

    // *** Create Labels
    function Label(opt_options) {

      //  app.dialog.alert(opt_options.label_type);



        this.setValues(opt_options);
        var span = this.span_ = document.createElement('div');

        if (opt_options.label_type == 'you') {
            span.style.cssText = 'position: relative; ' +
                'left: -50%; ' +
                'top: 0px;' +
                'white-space: nowrap;' +
                'border: 1px solid #008CFF;' +
                'background: #ffffff;' +
                'color: #008CFF;'+
                'border-radius: 2px;' +
                'text-align: center;' +
                'font-size: 10px;' +
                'padding: 1px 3px;';
        }
        else {
            span.style.cssText = 'position: relative; ' +
                'left: -50%; ' +
                'top: 0px;' +
                'white-space: nowrap;' +
                'border: 1px solid #36BB3B;' +
                'background: #ffffff;' +
                'color: #36BB3B;' +
                'border-radius: 2px;' +
                'text-align: center;' +
                'font-size: 10px;' +
                'padding: 1px 3px;';
        }
        var div = this.div_ = document.createElement('div');
        div.appendChild(span);
        div.style.cssText = 'position: absolute; display: none';
    };
    Label.prototype = new google.maps.OverlayView;
    Label.prototype.onAdd = function () {
        var pane = this.getPanes().overlayLayer;
        pane.appendChild(this.div_);
        var me = this;
        this.listeners_ = [
            google.maps.event.addListener(this, 'position_changed',
                function () {
                    me.draw();
                }),
            google.maps.event.addListener(this, 'text_changed',
                function () {
                    me.draw();
                })
        ];
    };
    Label.prototype.onRemove = function () {
        this.div_.parentNode.removeChild(this.div_);
        for (var i = 0, I = this.listeners_.length; i < I; ++i) {
            google.maps.event.removeListener(this.listeners_[i]);
        }
    };
    Label.prototype.draw = function () {
        var projection = this.getProjection();
        var position = projection.fromLatLngToDivPixel(this.get('position'));
        var div = this.div_;
        div.style.left = position.x + 'px';
        div.style.top = position.y + 'px';
        div.style.display = 'block';
        this.span_.innerHTML = this.get('text').toString();
    };

    // *** Get jSON data from server
   // var x = localStorage.getItem("user");
    //console.log('============SXXX> ' + user.token);

    if (user == null) return false;

    $.ajax({
        type: "GET",
        url: 'https://gasola.com.br/rest/postos/' + user.token,
        //url: 'markers.json',
        dataType: 'json',
        contentType: 'application/json',
        // data: 'token=' + user.token,
        success: function (response) {

            var items_view_list = '';


            var config_fuel = $('#frm-config').find('select[name="config_fuel"]').val();
            if (config_fuel !== null) {
                var config_fuel_g = config_fuel[0];
                var config_fuel_e = config_fuel[1];
                var config_fuel_d = config_fuel[2];
            }

            infowindow = new google.maps.InfoWindow();

            // *** Create gas station markers
            for (var i = 0; i < response.length; i++) {

                gas_station[response[i].id] = {name: response[i].name,
                    brand: response[i].brand,
                    address: response[i].address,
                    price_g: response[i].price_g,
                    price_e: response[i].price_e,
                    price_d: response[i].price_d
                };


                /* Map */
                var box_prices = '';
                var box_reliability = '';
                var prices_reliability = '';
                var box_prices_reliability  = '';

                if (config_fuel_g) {


                    if (response[i].price_g > 0) {
                        if (response[i].confiabilidade_g == 0) prices_reliability = __.label_not_rated
                        else prices_reliability = __.label_reliability + ': ' + response[i].confiabilidade_g + '%';
                        box_prices += '<span class="price_g"><strong>G</strong> ' + parseFloat(( (response[i].price_g).replace(',', '.') )).toFixed(3) + '</span><br />';
                        box_prices_reliability += '<span class="price_g"><span class="badge color-blue">G</span> R$ ' + parseFloat(( (response[i].price_g).replace(',', '.') )).toFixed(3) + '</span><span class="price-reliability"> (' + prices_reliability + ')</span><br />';
                    }
                }

                if (config_fuel_e) {
                    if (response[i].price_e > 0) {
                        if (response[i].confiabilidade_e == 0) prices_reliability = __.label_not_rated
                        else prices_reliability = __.label_reliability + ': ' + response[i].confiabilidade_e + '%';
                        box_prices += '<span class="price_e"><strong>E</strong> ' + parseFloat(( (response[i].price_e).replace(',', '.') )).toFixed(3) + '</span><br />';
                        box_prices_reliability += '<span class="price_e"><span class="badge color-orange">E</span> R$ ' + parseFloat(( (response[i].price_e).replace(',', '.') )).toFixed(3) + '</span><span class="price-reliability"> (' + prices_reliability + ')</span><br />';
                    }
                }

                if (config_fuel_d) {
                    if (response[i].price_d > 0) {
                        if (response[i].confiabilidade_d == 0) prices_reliability = __.label_not_rated
                        else prices_reliability = __.label_reliability + ': ' + response[i].confiabilidade_d + '%';
                        box_prices += '<span class="price_d"><strong>D</strong> ' + parseFloat(( (response[i].price_d).replace(',', '.') )).toFixed(3) + '</span><br />';
                        box_prices_reliability += '<span class="price_d"><span class="badge color-green">D</span> R$ ' + parseFloat(( (response[i].price_d).replace(',', '.') )).toFixed(3) + '</span><span class="price-reliability"> (' + prices_reliability + ')</span><br />';
                    }
                }



                markers[response[i].id] = new google.maps.Marker({
                    id: response[i].id,
                    position: new google.maps.LatLng(response[i].lat, response[i].lng),
                    map: map,
                    animation: google.maps.Animation.DROP,
                    title: response[i].name,
                    icon: 'images/gas32.png',
                    price: box_prices,
                });

                var label = new Label({
                    'map': map,
                    'label_type': 'fuel',
                });
                label.bindTo('position', markers[response[i].id], 'position');
                label.bindTo('text', markers[response[i].id], 'price');



                google.maps.event.addListener(markers[response[i].id], 'click', (function(marker, i) {
                    return function() {
                       // var contentMarker = '<button id="pop_'+response[i].id+'" data-id="'+response[i].id+'" class="col button button-fill color-blue button-small">' + __.message_price_update + '</button>';
                       var contentMarker = '';
                        contentMarker += '<a href="#" id="pop_'+response[i].id+'" data-id="'+response[i].id+'" data-popup=".popup-price-update" class="btn-marker-popup popup-open button button-small button-fill color-green">' + __.message_price_update + '</a>';
                       contentMarker += '<a href="#" id="report_'+response[i].id+'" data-id="'+response[i].id+'" data-popup=".popup-report" class="btn-marker-popup popup-open button button-small button-fill color-red">' + __.button_report + '</a>';
                        contentMarker += '<a href="#" id="trace_'+response[i].id+'" data-id="'+response[i].id+'" data-action=".trace-route" class="btn-marker-popup button button-small button-fill color-blue">' + __.button_trace_route + '</a>';
                       // contentMarker += '<br />[' + response[i].lat + ','+ response[i].lng + ']';



                     //   var contentMarker = '<button id="pop_'+response[i].id+'" data-id="'+response[i].id+'" class="col button button-fill color-blue button-small btn-price-update">' + __.message_price_update + '</button>';

                     //   var contentMarker = '<a class="link sheet-open" id="pop_'+response[i].id+'" data-id="'+response[i].id+'" href="#" data-sheet=".sheet-price-update">' + __.message_price_update + '</a>';

                        infowindow.setContent(contentMarker);
                        infowindow.open(map, markers[response[i].id]);
                    }
                })(markers[response[i].id], i));

                /* list */





                items_view_list +=   '<li>' +
                        // '<a href="javascript:markerZoomTo('+response[i].id+ ', '+ response[i].lat + ', '+ response[i].lng +')" class="item-content item-link">' +
                         '<a href="javascript:goToMarker('+ response[i].id +')" class="item-content item-link">' +
                            '<div class="item-inner" id="gs_info_' + response[i].id + '">' +
                                '<div class="item-title-row">' +
                                    '<div class="item-title"><strong>' + response[i].name + '</strong></div>' +
                                '</div>' +
                                '<div class="item-subtitle">' + box_prices_reliability + '</div>' +
                                '<div class="item-text">'+ response[i].brand + '<br />' + response[i].address + '</div>' +
                            '</div>' +
                        '</a>' +
                    '</li>';


                // items_view_list +=   '<li class="accordion-item">' +
                //     '<a href="#" class="item-content item-link">' +
                //     '<div class="item-inner">' +
                //     '<div class="item-title"><strong>' + response[i].name + '</strong><br />' + box_prices.replace('<br />', '   ') + '</div>' +
                //     '</div>' +
                //     '</a>' +
                //     '<div class="accordion-item-content">' +
                //     '<div class="block">' +
                //     '<p>'+ response[i].brand + '<br />' + response[i].address + '</p>' +
                //     '</div>' +
                //     '</div>' +
                //     '</li>';

            }

            $('#items-show-list').html(items_view_list);

            // google.maps.event.addDomListener(window, 'load', initMap, response);







        }
    });
    return map;
}


function goToMarker(pid) {
    searchbar.disable();
    console.log('- Go to marker ' + markers[pid].id);
    if (directionsDisplay != null) {
        directionsDisplay.setMap(null);
        directionsDisplay = null;
    }
    infowindow.close();
    markers.forEach(function(item, index)   {
        markers[item.id].setIcon('images/gas32.png');
    });

    markers[pid].setIcon('images/gas32red.png');
    markers[pid].setAnimation(google.maps.Animation.DROP);
    getViewMap();
    var latLng = markers[pid].getPosition(); // returns LatLng object
    map.panTo(latLng);
    map.setCenter(latLng);

}


// TRACE ROUTE
$(document).on('click', '[id^="trace_"]', function () {
    // console.log('TRACE');
    if (directionsDisplay != null) {
        directionsDisplay.setMap(null);
        directionsDisplay = null;
    }
    goToMarker(markers[$(this).data('id')].id);
    var directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(map);
    directionsDisplay.setOptions( { suppressMarkers: true } );
    var selectedMode = 'DRIVING';
    var marker_stat = markers[$(this).data('id')];
    directionsService.route({
        destination: current_postion,
        origin: markers[$(this).data('id')].position,
        travelMode: google.maps.TravelMode[selectedMode]
    }, function(response, status) {
        if (status == 'OK') {
            directionsDisplay.setDirections(response);
            computeTotals(response, marker_stat);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });




    //   calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB);

    // app.dialog.alert('id: ' + $(this).data('id'));
});

function computeTotals(result, marker_stat) {
    var totalDist = 0;
    var totalTime = 0;
    var myroute = result.routes[0];
    for (i = 0; i < myroute.legs.length; i++) {
        totalDist += myroute.legs[i].distance.value;
        totalTime += myroute.legs[i].duration.value;
    }
    totalDist = totalDist / 1000.
    var dist = totalDist.toFixed(2) + " " + __.label_km + " (" + (totalDist * 0.621371).toFixed(2) + " " +  __.label_miles + ")";
    var time = Math.round((totalTime / 60)) + " " + __.label_minutes;

     infowindow.setContent(  (__.message_gethere).format(time, dist) );
    infowindow.open(map, marker_stat);
}


String.prototype.format = function() {
    var newStr = this, i = 0;
    while (/%s/.test(newStr))
        newStr = newStr.replace("%s", arguments[i++])

    return newStr;
}


function initAutocomplete(map) {

    // *** Create the search box
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });
    var markers = [];
    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }
        markers.forEach(function (marker) {
            marker.setMap(null);
        });
        markers = [];
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };
            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}


function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    console.log('- User denied Geolocation');
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
}


