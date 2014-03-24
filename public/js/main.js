var app = angular.module("main", ["router"]).config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'XSRF-TOKEN';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRF-Token';    
}
]);

app.directive("markdown", function($timeout){
	return function(scope, el, attr){
		scope.$watch("post.body", doMarkdownAndTex);
		
		scope.$watch("newPostBody", doMarkdownAndTex);

		function doMarkdownAndTex(val){
			if(val){
				el[0].innerHTML = markdown.toHTML(val);
				$timeout(function(){
					MathJax.Hub.Queue(["Typeset",MathJax.Hub, "preview"]);
				}, 200);
				
			}else{
				el[0].innerHTML = "";
			}
		}
	};
});