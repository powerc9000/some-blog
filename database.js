var Q = require("q");

module.exports = function(){
  "use strict";
  var config = {
    path:process.env.databasePath || "127.0.0.1:27017",
    db: process.env.databaseName ||"blog",
    username: process.env.dbUsername || "",
    password: process.env.dbPassword || ""
  };
  var Client = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    objId = require("mongodb").ObjectID,
    promise = Q.defer(),
    db = promise.promise;
  var connectionUrl;

  if(config.username && config.password){
    connectionUrl = "mongodb://"+config.username+":"+config.password+"@"+config.path;
  }else{
    connectionUrl = "mongodb://"+config.path+"/"+config.db;
  }

    Client.connect(connectionUrl, function(err, con){
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
    getAboutPost: function(){
      var q = Q.defer();
      db.then(function(client){
        var c = client.collection("posts");
        c.findOne({"title":"About"}, function(err, post){
          if(err){
            q.reject();
          }else{
            q.resolve(post);
          }
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
    incrementPostViews: function(slug){
      var q = Q.defer();
      var post;
      this.getPost(slug).then(function(post_){
        post = post_;
        return db;
      }).then(function(client){
        var c = client.collection("posts");
        var views = post.views || 0;
        c.update({"slug": post.slug}, {$set:{views:views + 1}}, function(err, post){
          if(!err){
            q.resolve(post.views);
          }else{
            q.reject(err);
          }
        });
      });

      return q;
    },
    getPostsByTag: function(tag, start, amt){
      var q = Q.defer();
      db.then(function(client){
        var c = client.collection("posts");

        c.find({tags:tag}).sort({_id:-1}).skip(start).limit(amt).toArray(function(err, posts){
          if(err){
            q.reject(err);

          }else{
            q.resolve(posts);
          }
        });
      });
      return q.promise;
    },

    editPost: function(post){
      var q = Q.defer();
      db.then(function(client){
        var c = client.collection("posts");
        c.update({"slug":post.slug}, {$set:{title:post.title, body:post.body, markdown:post.markdown, tags:post.tags}}, function(err, post){
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

        c.find().sort({_id:-1}).skip(start).limit(amt).toArray(function(err, posts){
          c.count(function(err, total){
            q.resolve({posts:posts, count:total});
          });
          
        });
      });

      return q.promise;
    }
  };
};