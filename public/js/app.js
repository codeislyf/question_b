// Declares the initial angular module "meanMapApp". Module grabs other controllers and services.
var app = angular
	.module('meanMapApp', [
		'checkAll',
		'queryCtrl',
		'geolocation',
		'gservice',
		'ngRoute',
	])
	.config(function($routeProvider) {
		// Join Team Control Panel
		$routeProvider
			.when('/all', {
				controller: 'checkAll',
				templateUrl: 'partials/checkAll.html',
			})
			.when('/find', {
				controller: 'queryCtrl',
				templateUrl: 'partials/searchForm.html',
			})
			.otherwise({ redirectTo: '/all' });
	});
