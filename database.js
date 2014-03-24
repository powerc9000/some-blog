var Q = require("q");
module.exports = function(config){
	config = config || {
		path:"127.0.0.1:27017",
		db: "blog"
	};
	var Client = require('mongodb').MongoClient,
		Server = require('mongodb').Server,
		promise = Q.defer(),
		db = promise.promise;
		Client.connect("mongodb://"+config.path+"/"+config.db, function(err, con){
			promise.resolve(con);
		});
		function slugify(text) {

			return text.toString().toLowerCase()
				.replace(/\s+/g, '-')        // Replace spaces with -
				.replace(/[^\w\-]+/g, '')   // Remove all non-word chars
				.replace(/\-\-+/g, '-')      // Replace multiple - with single -
				.replace(/^-+/, '')          // Trim - from start of text
				.replace(/-+$/, '');         // Trim - from end of text
		}
		function randId() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
	return {
		newPost: function(post){
			var q = Q.defer();
			db.then(function(client){
				var c = client.collection("posts");
				post.slug = slugify(post.title) + "-" + randId();
				c.insert(post, function(err, records){
					q.resolve(records[0]);
				});
			});
			return q.promise;
		},

		getPost: function(slug){
			var q = Q.defer();

			db.then(function(client){
				var c = client.collection("posts");

				c.findOne({"slug": slug}, function(err, post){
					if(!post || err){
						q.reject();
					}else{
						q.resolve(post);
					}
				});
			});
			return q.promise;
		}
	};
};