(function(angular){
	"use strict";
	var app = angular.module("main", ["router", "ngSanitize"]).config(['$httpProvider', function($httpProvider) {
		$httpProvider.defaults.xsrfCookieName = 'XSRF-TOKEN';
		$httpProvider.defaults.xsrfHeaderName = 'X-CSRF-Token';
	}
	]).run(function($rootScope){
		$rootScope.root_page_title = "Some Blog";
		$rootScope.auth = window.auth;
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
