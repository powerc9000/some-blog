var app = angular.module("admin", ["adminRouter", "ngSanitize"]).config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'XSRF-TOKEN';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRF-Token';
  }
  ]).run(function($rootScope){
    $rootScope.root_page_title = "Some Blog";
    $rootScope.blog_name = window.blogName;
    $rootScope.auth = window.auth;
  });

  app.factory("setTitle", function($rootScope){
    return function(title){
      $rootScope.root_page_title = title + " | " + $rootScope.blog_name;
    };
  });
  app.directive("activeLink", function($location){
    return function(scope, el, attr){
      scope.$on("$routeChangeSuccess", function(){
        if($location.path() === attr.activeLink){
          el[0].classList.add("active");
        }else{
          el[0].classList.remove("active");
        }
      });
      
    };
  });
  app.directive("expandTextarea", function(){
    return function(scope, el, attrs){
      el[0].style.height = el[0].style.height || 0;

      scope.$watch(attrs.expandTextarea, function(){
        console.log(parseInt(el[0].style.height));
        if(!el) return;
        if(el[0].scrollHeight > parseInt(el[0].style.height)){
          el[0].style.height = el[0].scrollHeight + "px";
        }else{
          el[0].style.height = el[0].scrollHeight + "px";
        }
        
      });
    };
  });

// app.directive("breadcrumbs", function(){
//   return {
//     restrict: "E",
//     templateUrl: "/partials/admin-breadcrumbs.html"
//   };
// });

app.directive("markdown", function($timeout){
  return function(scope, el, attr){
    scope.$watch(attr.markdown, doMarkdownAndTex);

    function doMarkdownAndTex(val, old){
      var words;
      var lines;
      old = old || "";
      //Finds links
      var linkRegex = /(?:ftp|http|https):\/\/(?:[\w\.\-\+]+:{0,1}[\w\.\-\+]*@)?(?:[a-z0-9\-\.]+)(?::[0-9]+)?(?:\/|\/(?:[\w#!:\.\?\+=&%@!\-\/\(\)]+)|\?(?:[\w#!:\.\?\+=&%@!\-\/\(\)]+))?$/ig;
      if(val){

        //Split the entire Markdown string into lines then words
        lines = val.split("\n");
        lines.forEach(function(l, i){
          words = l.split(" ");
          words.forEach(function(w, i){
            w.replace(linkRegex, function(match, idx, word){
              words[i] = "["+word+"]"+"("+match+")";
            });
          });
          lines[i] = words.join(" ");
        });
        
        val = lines.join("\n");
        el[0].innerHTML = markdown.toHTML(val, "Gruber", {sanitize:false});
        $timeout(function(){
          MathJax.Hub.Queue(["Typeset",MathJax.Hub, el[0]]);
        }, 0);
        
      }
      else{
        el[0].innerHTML = "";
      }
    }
  };
  
});