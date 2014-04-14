var dir = angular.module("directives", []);

dir.directive("toggle", function(){
  return function(scope, el, attrs){
    var nav = document.querySelectorAll(attrs.target)[0];
    var button = el[0];
    scope.$on("$routeChangeStart", function(){
      if(!nav.classList.contains("collapse")){
        nav.classList.add("collapse");
      }
    });
    button.onclick= function(e){
      if(nav.classList.contains("collapse")){
        nav.classList.remove("collapse");
      }else{
        nav.classList.add("collapse");
      }
      e.stopPropagation();
    };
      
  };
});