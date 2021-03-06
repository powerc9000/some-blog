var doMarkdown = require("../helpers").doMarkdown;
module.exports = function(db){
  "use strict";
 
  function tagsToArray(tagString){
    if(tagString){
      tagString = tagString.split(",");
      tagString.forEach(function(t, i){
        tagString[i] = t.trim();
      });
      return tagString;
    }
    return [];
  }
  return{
    newPost: function(req, res){
      var post = {};
      var drafId = req.body.draftId;
      var draft = req.body.isDraft;
      post.title = req.body.title || "";
      post.body = req.body.body || "";
      post.tags = tagsToArray(req.body.tags);
      if(post.title.length && post.body.length){
        post.date = Date.now();
        post.markdown = post.body;
        post.body = doMarkdown(post.body);

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

    aboutPost: function(req, res){
      db.getAboutPost().then(function(post){
        res.send(post);
      });
    },

    getDrafts: function(req, res){
      var start = req.query.start || 0;
      var amount = req.query.amt || 10;
      db.getDrafts(start, amount).then(function(drafts){
        res.send(drafts);
      }, function(){
        res.send(500);
      });
    },

    newDraft: function(req, res){
      var post = req.body;
      post.tags = tagsToArray(req.body.tags);
      post.date = Date.now();
      db.newDraft(post).then(function(draft){
        res.send(draft);
      });
    },

    deleteDraft: function(req, res){
      var id = req.body.id;
      db.deleteDraft(id).then(function(){
        res.send(200);
      }, function(){
        res.send(500);
      });
    },

    getPost:function(req, res){
      db.getPost(req.params.slug).then(function(post){
        res.send(post);
        db.incrementPostViews(post.slug);
      }, function(){
        res.send(404);
      });
    },
    getDraft: function(req, res){
      db.getDraft(req.params.id).then(function(draft){
        res.send(draft);
      }, function(){
        res.send(404);
      });
    },
    edit: function(req, res){
      var post = {
        body: req.body.body,
        title: req.body.title,
        slug: req.body.slug,
        tags: tagsToArray(req.body.tags)
      };
      if(!post.title.length || !post.body.length){
        req.send({"error":"Post must have a body and a title"}, 403);
        return;
      }
      post.markdown = post.body;
      post.body = doMarkdown(post.body);
      db.editPost(post).then(function(){
        res.send(200);
      }, function(err){
        res.send(err, 403);
      });
    },

    getByTag: function(req, res){
      var tag = req.params.tag;
      if(!tag){
        res.send([]);
      }else{
        db.getPostsByTag(tag, 0, 10).then(function(posts){
          res.send(posts);
        });
      }
    },

    deletePost: function(req, res){
      var slug = req.params.slug;
      db.deletePost(slug).then(function(){
        res.send(200);
      }, function(err){
        res.send(err, 403);
      });
    },

    getAll: function(req, res){
      var page = req.query.page;
      var start; 
      var amt = 10;
      start = (page - 1) * 10;
      db.getAllPosts(start, amt).then(function(posts){
        res.send(posts);
      });
    }
  };
};