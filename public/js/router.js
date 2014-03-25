var router = angular.module("router", ["ngRoute"]);

router.config(function($routeProvider, $locationProvider){
	$locationProvider.html5Mode(true);
	$routeProvider.when("/", {controller:mainCtrl, templateUrl:"/partials/home.html"})
	.when("/create", {controller:createCtrl, templateUrl:"/partials/create.html", resolve:{auth:auth}})
	.when("/edit/:slug", {controller:editPostCtrl, templateUrl:"/partials/create.html", resolve:{auth:auth}})
	.when("/post/:slug", {controller:postSingleCtrl, templateUrl:"/partials/postSingle.html"})
	.when("/login", {controller:loginCtrl, templateUrl:"/partials/login.html"})
	.otherwise({"redirectTo":"/"})
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

function auth($http, $q, $location){
	var q = $q.defer();
	if(!auth){
		$location.replace();
		$location.path("/")
	}
	q.resolve();
	return q.promise;
}

function loginCtrl(){

}

function editPostCtrl($scope, $http, $routeParams, $location, setTitle){
	$scope.action = "Edit";
	$http.get("/api/post/"+$routeParams.slug).success(function(data){
		$scope.newPostTitle = data.title;
		$scope.newPostBody = data.body;
		$scope.post = data;
		setTitle(data.title);
	});
	$scope.newPost = function(){
		$http.post("/api/editpost", {title:$scope.newPostTitle, body:$scope.newPostBody, slug:$scope.post.slug}).success(function(data){
			$location.path("/post/"+$scope.post.slug);
			//alert("Okay");
		}).error(function(){
			alert("Not okay");
		});
	}
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

	$scope.deletePost = function(){
		function doDelete(){
			$http.post("/api/deletepost/"+$routeParams.slug).success(function(){
				alertify.success("Post deleted successfully");
				$location.path("/");
			}).error(function(data){
				console.log(data);
			})
		}
		alertify.confirm("Are you sure you want to delete this post", function(e){
			if(e){
				doDelete();
			}
		})
	}
}

function createCtrl($scope, $http, $location, setTitle, auth){
	console.log(arguments);
	$scope.action = "Create"
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