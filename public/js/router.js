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
  .when("/about", {controller:aboutCtrl, templateUrl:"/theme/partials/about.html"})
  .when("/admin", {controller:redirectToAdmin, templateUrl:"/partials/404.html"})
  //Auth things
  .otherwise({controller:_404Ctrl, templateUrl:"/partials/404.html"});
});

function _404Ctrl(){

}
function redirectToAdmin(){
 //window.location.replace("/admin#/admin");
}
function aboutCtrl($scope, $http){
  $http.get("/api/about-blog").success(function(data){
    $scope.description = data.body;
  });
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





function logoutCtrl($scope, $rootScope, $http, $location){
  $http.post("/api/logout").success(function(){
    $rootScope.auth = false;
    window.auth = false;
    window.location.replace("/login");
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
      //$location.path("/admin");
      window.location.replace("/admin");
    }).error(function(){
      alertify.error("Username or password was incorrect try again");
      $scope.password = "";
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

  
}



