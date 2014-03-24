var router = angular.module("router", ["ngRoute"]);

router.config(function($routeProvider, $locationProvider){
	$locationProvider.html5Mode(true);
	$routeProvider.when("/", {controller:mainCtrl, templateUrl:"partials/home.html"})
	.when("/create", {controller:createCtrl, templateUrl:"partials/create.html"});
});

router.factory("setTitle", function($rootScope){
	return function(title){
		$rootScope.page_title = title;
	};
});


function mainCtrl(){

}

function createCtrl($scope, setTitle){
	setTitle("Create Post");
}