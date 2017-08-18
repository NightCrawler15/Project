$(function() {

    var marker;
    var socket = io();
    var map;
    var centerMark;
    var latlng;
    var zoomer = false;
    var markers = new Array();
    var bankName = new Array();
    var posID = new Array();
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var directionSet = false;
    var firstdetail = false;
    var updateshowed = false;
    var currentATM;
    var firstStatus = false;


    $("#logoutBTN").click(function() {
        //console.log("logout");
        socket.emit('log out');
    });

    //setting the status segment
    function setStatus(data) {
      socket.emit("Get Status", {PosId: posID[data], BankName: bankName[data]});
    }

    //Set status segment
    function displayStatus(data) {
      var stat = "<p class=\"abc\">" + data + "</p>";
      if(firstStatus) {
        var status = document.getElementById('status');
        while (status.firstChild) status.removeChild(status.firstChild);
      }
      
      $("#status").append(stat);
      firstStatus = true;
    }

    // Event that search for locations coordinates and atm around it
    function searchAddress() {
      var elementsToTrigger = $([$('.cd-filter-trigger'), $('.cd-filter'), $('.cd-tab-filter'), $('.cd-gallery')]);
      elementsToTrigger.each(function(){
        $(this).toggleClass('filter-is-visible', false);
      });
      clearResults();
      centerMark.setMap(null);
      map.setZoom(16);
      var address = document.getElementById('searchLOC');
      if (directionSet) {
        directionsDisplay.setMap(null);
      }
      // Geocode API to search address coordinate
      var geocode = new google.maps.Geocoder(); 
      geocode.geocode({address: address.value}, function(results, status) {
        if(status == google.maps.GeocoderStatus.OK) {
          var latlong = new google.maps.LatLng(results[0].geometry.location.lat(),  results[0].geometry.location.lng());
          //console.log(latlong.lat() + " " + latlong.lng());
                
          centerMark = new google.maps.Marker({
            position: latlong,
            map: map, 
            animation: google.maps.Animation.BOUNCE,
            title: results[0].formatted_address
          });
          map.setCenter(centerMark.position);

          searchatms(centerMark.position);
        }         
      });
    }

    //update button click function
    function updateshow() {
      if(!updateshowed) {
        document.getElementById("stat").style.display = "block";
        document.getElementById("curr").style.display = "block";
        document.getElementById("que").style.display = "block";
        document.getElementById("sub").style.display = "block";
        updateshowed = true;
      } else {
        document.getElementById("stat").style.display = "none";
        document.getElementById("curr").style.display = "none";
        document.getElementById("que").style.display = "none";
        document.getElementById("sub").style.display = "none";
        updateshowed = false;
      }

      $('#submit').click(function() {
        var atmStatus, queue;
        var currency;

        $("input:radio[name='radioButton1']:checked").each(function(){
          atmStatus = $(this).parent().find('label').text();
        });

        $("input:radio[name='radioButton']:checked").each(function(){
          queue = $(this).parent().find('label').text();
        });

        $("input:checkbox[name='checkBox']:checked").each(function(){
          currency = $(this).parent().find('label').text();
        });

        socket.emit("Status Update", {PosId: posID[currentATM], BankName: bankName[currentATM], AStat: atmStatus, Queue: queue, Curr: currency});

      });
    }


    //Opening sidebar
    function triggerFilter($bool, position, i) {
      var elementsToTrigger = $([$('.cd-filter-trigger'), $('.cd-filter'), $('.cd-tab-filter'), $('.cd-gallery')]);
      elementsToTrigger.each(function(){
        $(this).toggleClass('filter-is-visible', $bool);
      });
      
      var name, address, dist, dur, summary;
      var directionsService = new google.maps.DirectionsService;
      directionsDisplay.setMap(map);
      directionsDisplay.setOptions( { suppressMarkers: true } );

      // making directions API request for finding the routes
      directionsService.route({
        origin: latlng,
        destination: position,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
      }, function (response, status) {
        if (status == 'OK') {
          name = "<p class=\"abc\"><b>Name: </b>" + bankName[i] + "</p>";
          address = "<p class=\"abc\"><b>Address: </b>" + response.routes[0].legs[0].end_address + "</p>";
          dist = "<p class=\"abc\"><b>Distance: </b>" + response.routes[0].legs[0].distance.text + " (" + response.routes[0].legs[0].distance.value + " meters)" + "</p>";
          dur = "<p class=\"abc\"><b>Duration: </b>" + response.routes[0].legs[0].duration.text + " (" + response.routes[0].legs[0].duration.value + " sec)" + "</p>";
          summary = "<p class=\"abc\">" + response.routes[0].summary + "</p>";
          directionsDisplay.setDirections(response);
          directionSet = true;
          //console.log("i am here");
          //console.log(i);
          //displayyng details
          if(firstdetail) {
            var detail = document.getElementById('details');
            while (detail.firstChild) detail.removeChild(detail.firstChild);
          }
          $("#details").append(name, address, dist, dur, summary);
          firstdetail = true;      
                          
          map.setCenter(markers[i].position);
          } else {
            window.alert('Directions request failed due to ' + status);
        }
      }); 
      
      $('#update').click(updateshow);
      /**/
        
    }

    //callback function to plot all atm location after google place api search
    function processResults(results, status) {
        //console.log("processresults");
        var firstinfo = false;
        var previous = -1;
        var infoSetMarker = new Array();
        var infowindow = new Array();
         // Verifying the status
        if(status == google.maps.places.PlacesServiceStatus.OK) {
            for (i = 0; i < results.length; i++) {
              infoSetMarker[i] = false;
            }

          for (i = 0; i < results.length; i++) {
              // Placing each results marker
              markers[i] = new google.maps.Marker({
                position: results[i].geometry.location,
                map: map, 
                animation: google.maps.Animation.DROP
              });
              bankName[i] = results[i].name;
              posID[i] = results[i].place_id;
              //openHours[i] = results[i].opening_hours.open_now;

              (function (i) {

                // markers onclick events show infowindow and more details on the distance matrix
                google.maps.event.addListener(markers[i], 'click', function(event) {
                  currentATM = i;
                  //console.log("click "+ i);
                  if (!infoSetMarker[i]) {
                    if (previous != i && firstinfo) {
                      infowindow[previous].close();
                      triggerFilter(false, markers[i].position, i);
                      //updateshow();
                    }
                    previous = i;
                    firstinfo = true;
                    
                    infowindow[i] = new google.maps.InfoWindow({
                      content: bankName[i]
                    });

                    infowindow[i].open(map, markers[i]);
                    infoSetMarker[i] = true;
                    triggerFilter(true,  markers[i].position, i);
                    setStatus(i);
                  } else {
                    infowindow[i].close();
                    infoSetMarker[i] = false;
                    triggerFilter(false,  markers[i].position, i);
                  } 
                });
              })(i);
          }
        }
    }

    //google place api search request
    function searchatms(position) {
          var request = {
            location: position,
            radius: 2000,
            types: ['atm']
          }

          var service_places = new google.maps.places.PlacesService(map);
          service_places.nearbySearch(request, processResults);
    }

    //clearing all results for new results
    function clearResults() {
      for (var m in markers) {
        markers[m].setMap(null);
      }
      markers = [];
      bankName = [];
      posID = [];
    }

    //initializing the markers for atms near the center location
    function mapinitialize() {
          var markclicked = false;
          var infowindow;
          var initialMark;

          // options required for initializing the map
          var myOptions = {
            zoom: 16,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            streetViewControl: false,
            mapTypeControl: false,
            clickableIcons: false,
          };

          // intialzing the map with center as browser location
          map = new google.maps.Map(document.getElementById("map-canvas"),myOptions);
          var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
          
          centerMark = new google.maps.Marker({
           position: latlng,
           map: map,
           title: "you are here", 
           animation: google.maps.Animation.BOUNCE,
          });

          //console.log("before search");
          //console.log(map.getCenter());

          searchatms(latlng);

          infowindow = new google.maps.InfoWindow({
            content: 'You are currently here'
          });
          //infowindow.open(map, marker);

          google.maps.event.addListener(centerMark, 'click', function(event) {
            if (!markclicked) {
                infowindow.open(map, centerMark);
                markclicked = true;
            } else {
                infowindow.close();
                markclicked = false;
            }
          });

          google.maps.event.addListener(map, 'click', function(event) {
            if(!zoomer) {
              map.setZoom(17);
              zoomer = true;
            } else {
              map.setZoom(16);
              zoomer = false;
            }             
          });

          //searching atm at anywhere right click on the map
          google.maps.event.addListener(map, 'dragend', function(event) {
              //map.setCenter(this.position);
              //console.log(this.position);
              clearResults();             

              searchatms(map.getCenter());
          });

          autoComplete = new google.maps.places.Autocomplete(document.getElementById('searchLOC'), {
            componentRestrictions: {country: 'in'}
          });
          autoComplete.bindTo('bounds', map);

          google.maps.event.addListener(autoComplete, 'place_changed', searchAddress);
    }

    //initializing the map and setting 
    //its center with browserlocation
    function initialize() {
      // Use of geolocation API
      if (navigator.geolocation) {
        // Gives the current locatio
        // Of the device or browser
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          latlng = new google.maps.LatLng(pos.lat, pos.lng);

          mapinitialize(); // positioning the map center with users device location
          //maploadatm(); //  loading the querried ATM requests
        } , function() {
          handleLocationError(true);
        });
      } else {
        handleLocationError(false);
      }

      //error if geolocation is not available
      function handleLocationError(browserHasgeolocation) {
        if (!browserHasgeolocation) {
          alert("NO Geolocation Provided");
        }
      } 

    }

  socket.on("Status Found", function(data) {
    displayStatus(data);
  });

  socket.on('Update Error', function(data) {
    alert(data);
    updateshow();
  });

  socket.on('Update Done', function() {
    //alert("Status Was Updated! Thank You, for your support to provide the information!!");
    setStatus(currentATM);
    updateshow();
  });

  socket.on('user logout', function() {
      window.location.href = '/loginpage'
  });

  $(window).load(function(){
    setTimeout(function(){initialize();}, 500);
  });

});

// Use 'jQuery(function($) {' for inside WordPress blogs (without quotes)
$(function() {
  var open = false;
  $('#footerSlideButton').click(function() {
    if(open === false) {
      $('#footerSlideContent').animate({ height: '300px' });
      $(this).css('backgroundPosition', 'bottom left');
      open = true;
    } else {
      $('#footerSlideContent').animate({ height: '0px' });
      $(this).css('backgroundPosition', 'top left');
      open = false;
    }
  });   
});