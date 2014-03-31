var Q = require("q");

module.exports = function(config){
	"use strict";
	config = config || {
		path:"127.0.0.1:27017",
		db: "blog"
	};
	var Client = require('mongodb').MongoClient,
		Server = require('mongodb').Server,
		objId = require("mongodb").ObjectID,
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
		deleteDraft: function(id){
			var q = Q.defer();
			db.then(function(client){
				var c = client.collection("drafts");
				c.remove({_id:objId(id)}, function(err, post){
					if(!err){
						q.resolve();
					}else{
						q.reject(err);
					}
				});
			});
			return q.promise;
		},

		getDrafts: function(start, amt){
			var q = Q.defer();
			amt = amt || 10;
			db.then(function(client){
				var c = client.collection("drafts");

				c.find().sort({_id:-1}).skip(start).limit(10).toArray(function(err, posts){
					q.resolve(posts);
				});
			});

			return q.promise;
		},

		newDraft: function(post){
			var q = Q.defer();
			db.then(function(client){
				var c = client.collection("drafts");
				c.insert(post, function(err, records){
					q.resolve(records[0]);
				});
			});
			return q.promise;
		},
		getDraft: function(id){
			var q = Q.defer();
			db.then(function(client){
				var c = client.collection("drafts");
				c.findOne({_id:objId(id)}, function(err, draft){
					if(!draft || err){
						q.reject();
					}else{
						q.resolve(draft);
					}
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
		},

		editPost: function(post){
			var q = Q.defer();
			db.then(function(client){
				var c = client.collection("posts");
				c.update({"slug":post.slug}, {$set:{title:post.title, body:post.body, markdown:post.markdown}}, function(err, post){
					q.resolve();
				});
			});

			return q.promise;
		},

		deletePost: function(slug){
			var q = Q.defer();
			db.then(function(client){
				var c = client.collection("posts");
				c.remove({slug:slug}, function(err, post){
					if(!err){
						q.resolve();
					}else{
						q.reject(err);
					}
				});
			});
			return q.promise;
		},

		checkAuth: function(username, password){
			var q = Q.defer();
			db.then(function(client){
				var c = client.collection("users");

				c.findOne({username:username}, function(err, post){
					if(post){
						q.resolve(post);
					}else{
						q.reject({"error":"Username or password is incorrect"});
					}
				});
			});
			return q.promise;
		},

		getAllPosts: function(start, amt){
			var q = Q.defer();
			amt = amt || 10;
			db.then(function(client){
				var c = client.collection("posts");

				c.find().sort({_id:-1}).skip(start).limit(10).toArray(function(err, posts){
					q.resolve(posts);
				});
			});

			return q.promise;
		}
	};
};