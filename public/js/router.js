var router = angular.module("router", ["ngRoute"]);

router.config(function($routeProvider, $locationProvider){
	$locationProvider.html5Mode(true);
	$routeProvider.when("/", {controller:mainCtrl, templateUrl:"/partials/home.html"})
	.when("/create", {controller:createCtrl, templateUrl:"/partials/create.html", resolve:auth})
	.when("/edit/:slug", {controller:editPostCtrl, templateUrl:"/partials/create.html", resolve:auth})
	.when("/post/:slug", {controller:postSingleCtrl, templateUrl:"/partials/postSingle.html"})
	.when("/login", {controller:loginCtrl, templateUrl:"/partials/login.html"})
	.when("/logout", {controller:logoutCtrl, templateUrl:"/partials/login.html"})
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

function auth($rootScope, $http, $q, $location){
	var q = $q.defer();
	if(!$rootScope.auth){
		$location.replace();
		$location.path("/")
	}
	console.log("here")
	q.resolve();
	return q.promise;
}

function logoutCtrl($scope, $rootScope, $http, $location){
	$http.post("/api/logout").success(function(){
		$rootScope.auth = false;
		window.auth = false;
		$location.path("/login");
		alertify.success("Logged out Successfully");
	})
}

function loginCtrl($scope, $http, $rootScope, setTitle, $location){
	setTitle("Some Blog | Login")
	if($rootScope.auth){
		$location.replace();
		$location.path("/");
		alertify.log("You are already logged in");
		return;
	}
	$scope.auth = function(){
		$http.post("/api/login", {username:$scope.username, password:$scope.password}).success(function(){
			$rootScope.auth = true;
			window.auth = true;
			alertify.success("Logged in successfully");
			$location.replace();
			$location.path("/");
		}).error(function(){
			alertify.error("Username or password was incorrect try again");
			$scope.pasword = "";
		})
	}
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

function createCtrl($scope, $http, $location, setTitle){
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