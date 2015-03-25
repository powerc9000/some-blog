var router = angular.module("adminRouter", ["ngRoute"]);

router.config(function($routeProvider, $locationProvider){
  $locationProvider.html5Mode(true);
  $routeProvider
  .when("/admin", {controller:adminCtrl, templateUrl:"/partials/admin-home.html"})
  .when("/admin/posts", {controller:postListCtrl, templateUrl:"/partials/post-list.html"})
  .when("/admin/create", {controller:createCtrl, templateUrl:"/partials/create.html"})
  .when("/admin/edit/:slug", {controller:editPostCtrl, templateUrl:"/partials/create.html"})
  .when("/admin/drafts", {controller:draftCtrl, templateUrl:"/partials/all-drafts.html"})
  .when("/admin/draft/:id", {controller:draftSingleCtrl, templateUrl:"/partials/create.html"})
  .when("/admin/blog-settings", {controller:blogSettingsCtrl, templateUrl:"/partials/blog-settings.html"});
});

function auth($rootScope, $q, $location){
  var q = $q.defer();
  if(!$rootScope.auth){
    $location.replace();
    $location.path("/");
  }

  q.resolve();
  return q.promise;
}

function postListCtrl($scope, $http, $location){
  var page = $location.search().page || 1;
  $http.get("/api/posts?page="+page).success(function(data){
    $scope.count = data.count;
    $scope.posts = data.posts;
  });

  $scope.deletePost = function(){
    var that = this;
    //delete this.post;
    function doDelete(){
      $http.post("/api/deletepost/"+that.post.slug).success(function(){
        alertify.success("Post deleted successfully");
        $scope.posts.splice($scope.posts.indexOf(that.post), 1);
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

function blogSettingsCtrl($scope, $rootScope, $http, setTitle){
  setTitle("Blog Settings");
  $scope.blog_name_new = $rootScope.blog_name;
  $scope.blogNewDescription = $scope.blogDescription;
  $http.get("/api/all-themes").success(function(data){
    $scope.themes = data.themes;
    $scope.currentTheme = data.currentTheme;
  }).error(function(){
    alertify.error("Could not load themes");
  });
  $http.get("/api/admin/blog-description").success(function(data){
    $scope.blogNewDescription = $scope.blogDescription = data;
  });
  $scope.saveBlogDescription = function(){
    $http.post("/api/change-blog-description", {blogDescription:$scope.blogNewDescription}).success(function(){
      alertify.success("Desciption successfully changed");
    });
  };

  $scope.saveBlogName = function(){
    $http.post("/api/change-blog-name", {blogName:$scope.blog_name_new}).success(function(){
      $rootScope.blog_name = $scope.blog_name_new;
      setTitle("Blog Settings");
    });
  };
  $scope.changeTheme = function(theme){
    if(theme === $scope.currentTheme) return;
    $http.post("/api/change-theme/", {theme:theme}).success(function(){
      $scope.currentTheme = theme;
      alertify.success("Theme changed successfully");
    });
  };
}

function editPostCtrl($scope, $http, $routeParams, $location, setTitle){
  $scope.action = "Edit";
  $scope.edit_post = true;
  $http.get("/api/post/"+$routeParams.slug).success(function(data){
    $scope.newPostTitle = data.title;
    $scope.newPostBody = data.markdown;
    $scope.tags = data.tags.join(", ");
    $scope.post = data;
    setTitle(data.title);
  });
  $scope.newPost = function(){
    $http.post("/api/editpost", {title:$scope.newPostTitle, body:$scope.newPostBody, slug:$scope.post.slug, tags:$scope.tags}).success(function(data){
      $location.path("/admin/posts");
      alertify.success("Post was edited successfully");
    }).error(function(data){
      alertify.alert(data.error);
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
  $scope.edit_post = true;
  setTitle("Edit draft");
  $http.get("/api/draft/"+$routeParams.id).success(function(data){
    $scope.draft = data;
    $scope.newPostTitle = data.title;
    $scope.newPostBody = data.body;
    $scope.tags = data.tags.join(", ");
  });
  $scope.newPost = function(){
    $http.post("/api/newpost", {title:$scope.newPostTitle, body:$scope.newPostBody, isdraft:true, draftid:$scope.draft._id, tags:$scope.tags}).success(function(data){
      $location.path("/post/"+data.slug);
    }).error(function(){
      alert("Not okay");
    });
  };
  $scope.saveDraft = function(){
    $http.post("/api/newdraft", {title:$scope.newPostTitle, body:$scope.newPostBody, tags:$scope.tags}).success(function(data){
      $http.post("/api/deleteDraft", {id:$scope.draft._id}).success(function(){
        $location.replace();
        $location.path("/admin/draft/"+data._id);
        alertify.success("Draft saved!");
      });
    }).error(function(){
      alertify.error("oops something went wrong please try again!");
    });
  };
  $scope.deleteDraft = function(){
    $http.post("/api/deleteDraft", {id:$scope.draft._id}).success(function(){
      alertify.success("Draft Delete");
      $location.replace();
      $location.path("/admin");
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
  $scope.edit_post = true;
  setTitle("Create Post");
  $scope.newPost = function(){
    $http.post("/api/newpost", {title:$scope.newPostTitle, body:$scope.newPostBody, tags:$scope.tags}).success(function(data){
      window.location.href="/post/"+data.slug;
    }).error(function(data){
      alertify.error(data.error);
    });
  };
  $scope.draft = function(){
    $http.post("/api/newdraft", {title:$scope.newPostTitle, body:$scope.newPostBody, tags:$scope.tags}).success(function(data){
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
          $location.path("/admin");
        });
        
      }
    });
  };
}

