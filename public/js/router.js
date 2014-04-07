var router = angular.module("router", ["ngRoute"]);
router.config(function($routeProvider, $locationProvider){
	$locationProvider.html5Mode(true);
	$routeProvider
	//Public things
	.when("/", {controller:mainCtrl, templateUrl:"/theme/partials/home.html"})
	.when("/post/:slug", {controller:postSingleCtrl, templateUrl:"/theme/partials/postSingle.html"})
	.when("/tag/:tag", {controller:tagCtrl, templateUrl:"/theme/partials/tags.html"})
	.when("/login", {controller:loginCtrl, templateUrl:"/theme/partials/login.html"})
	.when("/logout", {controller:logoutCtrl, templateUrl:"/theme/partials/login.html"})
	//Auth things
	.when("/admin", {controller:adminCtrl, templateUrl:"/partials/admin.html", resolve:adminCtrl.resolve})
	.when("/admin/create", {controller:createCtrl, templateUrl:"/partials/create.html", resolve:adminCtrl.resolve})
	.when("/admin/edit/:slug", {controller:editPostCtrl, templateUrl:"/partials/create.html", resolve:adminCtrl.resolve})
	.when("/admin/drafts", {controller:draftCtrl, templateUrl:"/partials/all-drafts.html", resolve:adminCtrl.resolve})
	.when("/admin/draft/:id", {controller:draftSingleCtrl, templateUrl:"/partials/create.html", resolve:adminCtrl.resolve})
	.when("/admin/blog-settings", {controller:blogSettingsCtrl, templateUrl:"/partials/blog-settings.html", resolve:adminCtrl.resolve})
	.otherwise({controller:_404Ctrl, templateUrl:"/partials/404.html"});
});

function _404Ctrl(){

}

function mainCtrl($scope, $http, setTitle, $location){
	var page = $location.search().page || 1;
	$scope.page = page;
	setTitle("Home");
	$scope.count = 0;
	$scope.nextPage = true;
	$scope.nextPrev = function(next){
		if(next){
			return (+page)+1;
		}else{
			return (+page)-1;
		}
		
	};
	$http.get("/api/posts?page="+page).success(function(data){
		$scope.posts = data.posts;
		$scope.count = data.count;
		if((page - 1) * 10 + 10 >= $scope.count){
			$scope.nextPage = false;
		}
	});


}

function tagCtrl($scope, $http, setTitle, $routeParams){
	setTitle($routeParams.tag);
	$http.get("/api/tag/"+$routeParams.tag).success(function(posts){
		$scope.posts = posts;
		$scope.tag = $routeParams.tag;
	});
}

function auth($rootScope, $q, $location){
	var q = $q.defer();
	if(!$rootScope.auth){
		$location.replace();
		$location.path("/");
	}

	q.resolve();
	return q.promise;
}

function blogSettingsCtrl($scope, $rootScope, $http, setTitle){
	setTitle("Blog Settings");
	$scope.blog_name_new = $rootScope.blog_name;
	$http.get("/api/all-themes").success(function(data){
		$scope.themes = data.themes;
		$scope.currentTheme = data.currentTheme;
	}).error(function(){
		alertify.error("Could not load current themes");
	});
	$scope.saveBlogName = function(){
		$http.post("/api/change-blog-name", {blogName:$scope.blog_name_new}).success(function(){
			$rootScope.blog_name = $scope.blog_name_new;
			setTitle("Blog Settings");
		});
	};
	$scope.changeTheme = function(theme){
		$http.post("/api/change-theme/", {theme:theme}).success(function(){
			$scope.currentTheme = theme;
			alertify.success("Theme changed successfully");
		});
	};
}

function logoutCtrl($scope, $rootScope, $http, $location){
	$http.post("/api/logout").success(function(){
		$rootScope.auth = false;
		window.auth = false;
		$location.path("/login");
		alertify.success("Logged out Successfully");
	});
}

function loginCtrl($scope, $http, $rootScope, setTitle, $location){
	setTitle("Some Blog | Login");
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
			$scope.password = "";
		});
	};
}

function editPostCtrl($scope, $http, $routeParams, $location, setTitle){
	$scope.action = "Edit";
	$http.get("/api/post/"+$routeParams.slug).success(function(data){
		$scope.newPostTitle = data.title;
		$scope.newPostBody = data.markdown;
		$scope.tags = data.tags.join(", ");
		$scope.post = data;
		setTitle(data.title);
	});
	$scope.newPost = function(){
		$http.post("/api/editpost", {title:$scope.newPostTitle, body:$scope.newPostBody, slug:$scope.post.slug, tags:$scope.tags}).success(function(data){
			$location.path("/post/"+$scope.post.slug);
			//alert("Okay");
		}).error(function(data){
			alertify.alert(data.error);
		});
	};
}

function postSingleCtrl($scope, $http, $routeParams, $location, setTitle){
	$http.get("/api/post/"+$routeParams.slug).success(function(data){
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
			});
		}
		alertify.confirm("Are you sure you want to delete this post", function(e){
			if(e){
				doDelete();
			}
		});
	};
}

function draftCtrl($scope, $http, $location, setTitle){
	$scope.drafts = [];
	$http.get("/api/drafts").success(function(data){
		$scope.drafts = data;
	});
}

function draftSingleCtrl($scope, $http, $location, $routeParams, setTitle){
	$scope.action = "draft";
	setTitle("Edit draft");
	$http.get("/api/draft/"+$routeParams.id).success(function(data){
		$scope.draft = data;
		$scope.newPostTitle = data.title;
		$scope.newPostBody = data.body;
	});
	$scope.newPost = function(){
		$http.post("/api/newpost", {title:$scope.newPostTitle, body:$scope.newPostBody, isdraft:true, draftid:$scope.draft._id}).success(function(data){
			$location.path("/post/"+data.slug);
			//alert("Okay");
		}).error(function(){
			alert("Not okay");
		});
	};
	$scope.saveDraft = function(){
		$http.post("/api/newdraft", {title:$scope.newPostTitle, body:$scope.newPostBody}).success(function(data){
			$http.post("/api/deleteDraft", {id:$scope.draft._id}).success(function(){
				$location.replace();
				$location.path("/admin/draft/"+data._id);
				alertify.success("Draft saved!");
			});
		}).error(function(){
			alertify.error("oops something went wrong please try again!");
		});
	};
}

function adminCtrl($scope, $http, $location, setTitle){
	setTitle("Admin");
} 

adminCtrl.resolve = {
	auth:auth
};
function createCtrl($scope, $http, $location, setTitle){
	$scope.action = "Create";
	setTitle("Create Post");
	$scope.newPost = function(){
		$http.post("/api/newpost", {title:$scope.newPostTitle, body:$scope.newPostBody, tags:$scope.tags}).success(function(data){
			$location.path("/post/"+data.slug);
			//alert("Okay");
		}).error(function(data){
			alertify.error(data.error);
		});
	};
	$scope.draft = function(){
		$http.post("/api/newdraft", {title:$scope.newPostTitle, body:$scope.newPostBody}).success(function(data){
			$location.path("/admin");
			alertify.success("Draft saved!");
		}).error(function(){
			alertify.error("oops something went wrong please try again!");
		});
	};
	$scope.cancel = function(e){
		alertify.confirm("Do you really want to cancel? All your progress will be lost.", function(res){
			if(res){
				$scope.$apply(function(){
					$location.path("/");
				});
				
			}
		});
	};
}