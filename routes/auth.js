var bcrypt = require("bcrypt");
var Q = require("q");
module.exports = function(db){

	return{
		isAuth: function(req, res){
			if(req.session.auth){
				res.send(200);
			}else{
				res.send(403);
			}
		},

		login: function(req, res){
			var pass = req.body.pass;
			var q = Q.defer();
			

			q.promise.then(function(hash){
				return db.checkAuth(req.body.username);
			}).then(function(user){
				bcrypt.compare(pass, user.password, function(err, res){
					req.session.auth = res;
					if(!res || err){
						res.send({"error":"Username or password incorrect"}, 403)
					}
					else{
						req.send(200);
					}
				})
				
			}, function(err){
				req.session.auth = false;
				req.send(auth, 403);
			})

		}
	}
}