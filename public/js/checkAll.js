// Creates the checkAll Module and Controller.
// Note that it depends on the 'geolocation' module and service.
var checkAll = angular.module('checkAll', ['geolocation', 'gservice']);
checkAll.controller('checkAll', function(
    $scope,
    $http,
    $rootScope,
    geolocation,
    gservice
) {
    // Initializes Variables
    // ----------------------------------------------------------------------------
    $scope.formData = {};
    var coords = {};
    var lat = 0;
    var long = 0;

    // Set initial coordinates to the center of the India
    $scope.formData.latitude = 21;
    $scope.formData.longitude = 29;

    // Get Current User's actual coordinates based on HTML5 at window load
    geolocation.getLocation().then(function(data) {
        // Set the latitude and longitude equal to the HTML5 coordinates
        coords = { lat: data.coords.latitude, long: data.coords.longitude };

        // Display coordinates in location textboxes rounded to three decimal points
        $scope.formData.longitude = parseFloat(coords.long).toFixed(3);
        $scope.formData.latitude = parseFloat(coords.lat).toFixed(3);
        document.getElementById('map').style.width = '1100px';
        gservice.refresh($scope.formData.latitude, $scope.formData.longitude);
    });

    // Functions
    // ----------------------------------------------------------------------------

    // Get coordinates based on mouse click. When a click event is detected....
    $rootScope.$on('clicked', function() {
        // Run the gservice functions associated with identifying coordinates
        $scope.$apply(function() {
            $scope.formData.latitude = parseFloat(gservice.clickLat).toFixed(3);
            $scope.formData.longitude = parseFloat(gservice.clickLong).toFixed(
                3
            );
        });
    });
});
