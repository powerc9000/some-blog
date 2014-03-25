
module.exports = function(db){
	var posts = require("./routes/posts")(db);
	var auth = require("./routes/auth")(db);
	this.get(/^((?!\/api).)*$/, function(req, res){
		res.render("index", {auth:req.session.auth});
	});

	this.post("/api/newpost", posts.newPost);
	this.post("/api/editpost", posts.edit);
	this.post("/api/deletepost/:slug", posts.deletePost);
	this.get("/api/post/:slug", posts.getPost);
	this.get("/api/posts", posts.getAll);

	this.get("/api/isAuth", auth.isAuth);
	this.post("/api/login", auth.login);
};