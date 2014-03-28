var app = angular.module("main", ["router"]).config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'XSRF-TOKEN';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRF-Token';    
}
]).run(function($rootScope){
	$rootScope.auth = window.auth;
});

app.directive("markdown", function($timeout){
	return function(scope, el, attr){
		scope.$watch(attr.markdown, doMarkdownAndTex);

		function doMarkdownAndTex(val){
			if(val){
				el[0].innerHTML = markdown.toHTML(val);
				$timeout(function(){
					MathJax.Hub.Queue(["Typeset",MathJax.Hub, el[0]]);
				}, 200);
				
			}
			else{
				el[0].innerHTML = "";
			}
		}
	};
	
});

app.directive("activeLink", function($location){

	return function(scope, el, attr){
		scope.$on("$routeChangeSuccess", function(){
			if($location.path() === attr["activeLink"]){
				el[0].classList.add("active");
			}else{
				el[0].classList.remove("active");
			}
		})
		
	}
});