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
		}
	};
};