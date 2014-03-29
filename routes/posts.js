module.exports = function(db){
	return{
		newPost: function(req, res){
			var post = req.body;
			var draft = req.body.isdraft;
			var draftId = req.body.draftid;
			if(post.title.length && post.body.length){
				post.date = Date.now();
				db.newPost(post).then(function(post){
					if(draft){
						db.deleteDraft(draftId);
					}
					res.send({postId:post._id, slug:post.slug});
				});
			}else{
				res.send({"error": "Post title and post body cannot be empty"}, 403);
			}
		},

		getDrafts: function(req, res){
			var start = req.query.start || 0;
			var amount = req.query.amt || 10;
			db.getDrafts(start, amount).then(function(drafts){
				res.send(drafts);
			}, function(){
				res.send(500);
			})
		},

		newDraft: function(req, res){
			var post = req.body;
			post.date = Date.now();
			db.newDraft(post).then(function(){
				res.send();
			})
		},

		getPost:function(req, res){
			db.getPost(req.params.slug).then(function(post){
				res.send(post);
			}, function(){
				res.send(404);
			});
		},
		getDraft: function(req, res){
			db.getDraft(req.params.id).then(function(draft){
				res.send(draft);
			}, function(){
				res.send(404);
			})
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