module.exports = function(db){
	return{
		newPost: function(req, res){
			var post = req.body;
			if(post.title.length && post.body.length){
				post.date = Date.now();
				db.newPost(post).then(function(post){
					console.log(arguments);
					res.send({postId:post._id, slug:post.slug});
				});
			}else{
				res.send({"error": "Post title and post body cannot be empty"}, 403);
			}
		},

		getPost:function(req, res){
			db.getPost(req.params.slug).then(function(post){
				res.send(post);
			}, function(){
				res.send(404);
			});
		},

		edit: function(req, res){
			var post = req.body
			if(!post.title.length || !post.body.length){
				req.send({"error":"Post must have a body and a title"}, 403);
				return;
			}
			db.editPost(post).then(function(){
				res.send(200);
			}, function(err){
				res.send(err, 403);
			})
		},

		deletePost: function(req, res){
			var slug = req.params.slug;
			db.deletePost(slug).then(function(){
				res.send(200);
			}, function(err){
				res.send(err, 403);
			})
		},

		getAll: function(req, res){
			var start = req.query.start || 0;
			var amt = req.query.amt || 10;
			db.getAllPosts(start, amt).then(function(posts){
				res.send(posts);
			});
		}
	};
};