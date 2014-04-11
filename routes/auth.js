var bcrypt = require("bcrypt");
var Q = require("q");
module.exports = function(db){

	return{
		isAuth: function(req, res){
			if(req.session.auth){
				res.send(200);
			}else{
				res.send(401);
			}
		},
		checkAuth: function(req, res, next){
			if(req.session.auth){
				next();
			}else{
				res.send({"error":"you must be logged in"}, 401);
			}
		},
		checkAuthRedirect: function(req, res, next){
			if(req.session.auth){
				next();
			}else{
				res.method = "get";
				res.redirect("/login");
			}
		},
		logout: function(req, res){
			req.session.auth = false;
			res.send(200);
		},
		login: function(req, res){
			var pass = req.body.password;
			var q = Q.defer();
			
			db.checkAuth(req.body.username).then(function(user){
				bcrypt.compare(pass, user.password, function(err, r){
					req.session.auth = r;
					if(!r || err){
						console.log(err);
						res.send({"error":"Username or password incorrect"}, 401);
					}
					else{
						res.send(200);
					}
				});
				
			}, function(err){
				req.session.auth = false;
				res.send(err, 401);
			});

		}
	};
};