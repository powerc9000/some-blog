
module.exports = function(db){
	var posts = require("./routes/posts")(db);
	this.get(/^((?!\/api).)*$/, function(req, res){
		res.render("index");
	});

	this.post("/api/newpost", posts.newPost);
	this.post("/api/editpost", posts.edit);
	this.post("/api/deletepost/:slug", posts.deletePost);
	this.get("/api/post/:slug", posts.getPost);
	this.get("/api/posts", posts.getAll);
};