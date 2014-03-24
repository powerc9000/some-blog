var router = angular.module("router", ["ngRoute"]);

router.config(function($routeProvider, $locationProvider){
	$locationProvider.html5Mode(true);
	$routeProvider.when("/", {controller:mainCtrl, templateUrl:"/partials/home.html"})
	.when("/create", {controller:createCtrl, templateUrl:"/partials/create.html"})
	.when("/post/:slug", {controller:postSingleCtrl, templateUrl:"/partials/postSingle.html"});
});

router.factory("setTitle", function($rootScope){
	return function(title){
		$rootScope.page_title = title;
	};
});


function mainCtrl($scope, $http, setTitle){
	setTitle("Some Blog");
	$http.get("/api/posts").success(function(posts){
		$scope.posts = posts;
	});

}

function postSingleCtrl($scope, $http, $routeParams, $location, setTitle){
	$http.get("/api/post/"+$routeParams.slug).success(function(data){
		console.log(data);
		$scope.post = data;
		setTitle(data.title);
	}).error(function(){
		$location.replace();
		$location.path("/");
		
	});
}

function createCtrl($scope, $http, $location, setTitle){
	setTitle("Create Post");
	$scope.newPost = function(){
		$http.post("/api/newpost", {title:$scope.newPostTitle, body:$scope.newPostBody}).success(function(data){
			$location.path("/post/"+data.slug);
			//alert("Okay");
		}).error(function(){
			alert("Not okay");
		});
	};
}