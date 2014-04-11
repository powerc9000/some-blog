(function(angular){
	"use strict";
	var app = angular.module("main", ["router", "ngSanitize"]).config(['$httpProvider', function($httpProvider) {
		$httpProvider.defaults.xsrfCookieName = 'XSRF-TOKEN';
		$httpProvider.defaults.xsrfHeaderName = 'X-CSRF-Token';
	}
	]).run(function($rootScope){
		$rootScope.root_page_title = "Some Blog";
		$rootScope.blog_name = window.blogName;
	});

	app.factory("setTitle", function($rootScope){
		return function(title){
			$rootScope.root_page_title = title + " | " + $rootScope.blog_name;
		};
	});

	app.directive("blogPost", function(){
		return{
			restrict:"E",
			templateUrl:"/theme/partials/post.html"
		};
	});
	
	app.directive("youtube", function($timeout){
		return function postLink(scope, el, attr){
			var regex = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
			var once = {};

			scope.$watch(attr.youtube, function(val){
				var a;
				$timeout(function(){
					a = el[0].getElementsByTagName("a");
					if(a.length){
						[].forEach.call(a, function(l){
							var match = l.href.match(regex);
							var ratio = 0.5625;
							if(match && !once[match[1]]){
								var frame = document.createElement("iframe");
								var frameContain = document.createElement("div");
								once[match[1]] = true;
								frame.width = el[0].offsetWidth/1.50;
								frame.height = frame.width * ratio;
								frame.src = 'http://www.youtube.com/embed/' + match[1];
								frameContain.appendChild(frame);
								l.parentNode.insertBefore(frameContain, l);

								//l.hidden = true;
							}
						});
					}
				},0);
				
			});
		};
	});
	app.directive("tex", function($timeout){
		return function(scope, el, attr){
			scope.$watch(attr.tex, function(val){
				$timeout(function(){
					MathJax.Hub.Queue(["Typeset",MathJax.Hub, el[0]]);
				}, 0);
				
			});
			
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
}(angular));
