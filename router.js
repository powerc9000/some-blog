
module.exports = function(db){
	var posts = require("./routes/posts")(db);
	var auth = require("./routes/auth")(db);
	this.get(/^((?!\/api).)*$/, function(req, res){
		res.render("index", {auth:req.session.auth});
	});

	this.post("/api/newpost", auth.checkAuth, posts.newPost);
	this.post("/api/editpost", auth.checkAuth, posts.edit);
	this.post("/api/deletepost/:slug", auth.checkAuth, posts.deletePost);
	this.get("/api/post/:slug", posts.getPost);
	this.get("/api/posts", posts.getAll);

	this.post("/api/logout", auth.logout)

	this.get("/api/isAuth", auth.isAuth);
	this.post("/api/login", auth.login);
};