// Creates the gservice factory. This will be the primary means by which we interact with  Maps
angular.module('gservice', []).factory('gservice', function($rootScope, $http) {
    // Initialize Variables
    // -------------------------------------------------------------
    // Service our factory will return
    var apiKey = 'AohnNCdQ0-fBEPtKQpHaFhbe5DJtDF8rNX9sJ1L8Y_mv0JcaRJ34lWWKQ2ta-N_h';
    var pinInfoBox;  //the pop up info box
    var infoboxLayer = new Microsoft.Maps.EntityCollection();
    var pinLayer = new Microsoft.Maps.EntityCollection();
    // Create the info box for the pushpin
        pinInfobox = new Microsoft.Maps.Infobox({ visible: false });
        infoboxLayer.push(pinInfobox);

    var bingMapService = {};

    // Handling Clicks and location selection
    bingMapService.clickLat = 0;
    bingMapService.clickLong = 0;

    // Array of locations obtained from API calls
    var locations = [];

    // Selected Location (initialize to center of India)
    var selectedLat = 1.3521;
    var selectedLong = 103.8198;

    // Functions
    // --------------------------------------------------------------
    // Refresh the Map with new data. Function will take new latitude and longitude coordinates.
    bingMapService.refresh = function(latitude, longitude, filteredResults) {
        // Clears the holding array of locations
        locations = [];

        // Set the selected lat and long equal to the ones provided on the refresh() call
        selectedLat = latitude;
        selectedLong = longitude;

        // If filtered results are provided in the refresh() call...
        if (filteredResults) {
            // Then convert the filtered results into map points.
            locations = convertToMapPoints(filteredResults);

            // Then, initialize the map -- noting that a filter was used (to mark icons yellow)
            initialize(latitude, longitude, true);
        } else {
            // If no filter is provided in the refresh() call...
            // Perform an AJAX call to get all of the records in the db.
            $http
                .get('/datacentres')
                .success(function(response) {
                    // Convert the results into  Map Format
                    locations = convertToMapPoints(response);

                    // Then initialize the map.
                    initialize(latitude, longitude);
                })
                .error(function() {});
        }
    };

    // Private Inner Functions
    // --------------------------------------------------------------
    // Convert a JSON of datacentres into map points
    var convertToMapPoints = function(response) {
        // Clear the locations holder
        var locations = [];

        // Loop through all of the JSON entries provided in the response
        for (var i = 0; i < response.length; i++) {
            var datacentre = response[i];

            // Create popup windows for each record
            var contentString =
                '<p><b>Name</b>: ' +
                datacentre.centre_name +
                '<br><b>Load Rating</b>: ' +
                datacentre.load_rating +
                '<br><b>Rating</b>: ' +
                datacentre.rating +
                '</p>';

           locations.push({
               latlon: new Microsoft.Maps.Location(
                   datacentre.location[1],
                   datacentre.location[0]
               ),
               message: new Microsoft.Maps.Infobox({
                   description: contentString//,
                   //maxWidth: 320,
               }),
               centre_name: datacentre.centre_name,
               load_rating: datacentre.load_rating,
               rating: datacentre.rating,
               isMostSuitable: datacentre.isMostSuitable,
           });
      }
       // location is now an array populated with records in Maps format
       return locations;
    };

    // Initializes the map
    var initialize = function(latitude, longitude, filter) {
       // Uses the selected lat, long as starting point
       var myLatLng = { lat: selectedLat, lng: selectedLong };
       // If map has not been created already...
       if (!map) {
            var map = new Microsoft.Maps.Map(document.getElementById("map"), {
            credentials: apiKey,
            center: myLatLng,
            mapTypeId: Microsoft.Maps.MapTypeId.road,
            zoom: 4
        });
       }

       // If a filter was used set the icons yellow, otherwise blue
       if (filter) {
           icon = 'images/yellow-dot.png';
       } else {
           icon = 'images/blue-dot.png';
       }

       greenIcon = 'images/green-dot.png';

       // Loop through each location in the array and place a marker
       locations.forEach(function(n, i) {
           var marker = new Microsoft.Maps.Pushpin(n.latlon, {icon: n.isMostSuitable ? greenIcon : icon});
            marker.Title = n.centre_name;
            marker.Description = 'Load Rating : ' + n.load_rating +' \nRating : ' + n.rating;

            pinLayer.push(marker);
            
           // For each marker created, add a listener that checks for clicks
            Microsoft.Maps.Events.addHandler(marker, 'click', function(e) {
             pinInfobox.setOptions({title: e.target.Title, description: e.target.Description, visible:true, offset: new Microsoft.Maps.Point(0,25)});
             pinInfobox.setLocation(e.target.getLocation());
            });
        });

        //Push all entities
        map.entities.push(pinLayer);
        map.entities.push(infoboxLayer);

        // Set initial location as a bouncing red marker
       var initialLocation = new Microsoft.Maps.Location(latitude, longitude);
       var locMarker = new Microsoft.Maps.Pushpin(initialLocation, {
           color: 'red',
           draggable: true
       });
       lastLocMarker = locMarker;
       map.entities.push(lastLocMarker);
       
        map.setView({
          center: new Microsoft.Maps.Location(latitude, longitude),
          zoom: 4
        });

// Clicking on the Map moves the bouncing red marker
       Microsoft.Maps.Events.addHandler(map, 'click', function(e) {
           var point = new Microsoft.Maps.Point(e.getX(), e.getY());
           var loc = e.target.tryPixelToLocation(point);
           var clickLocation = new Microsoft.Maps.Location(loc.latitude, loc.longitude);
           lastLocMarker.setLocation(clickLocation);
    
           map.setView({
           center: clickLocation,
           zoom: 4
           });

           // Update Broadcasted Variable (lets the panels know to change their lat, long values)
           bingMapService.clickLat = locMarker.getLocation().latitude;
           bingMapService.clickLong = locMarker.getLocation().longitude;
           $rootScope.$broadcast('clicked');
       });
    };
    return bingMapService;
});
