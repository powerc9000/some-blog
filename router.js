
module.exports = function(db){
	var posts = require("./routes/posts")(db);
	var auth = require("./routes/auth")(db);
	//Catches everyting except /api and gives the index page for angularjs
	//Public things like javascript and css are resolved before this
	//But if you get a 404 on any of them it gives you the index page 
	//then angular tries to load that inside the template recursively
	//Stalling the page.
	//Probably a better way to handle this
	this.get(/^((?!\/api).)*$/, function(req, res){
		res.render("index", {auth:req.session.auth});
	});
	//Authed routes
	this.post("/api/newpost", auth.checkAuth, posts.newPost);
	this.post("/api/editpost", auth.checkAuth, posts.edit);
	this.post("/api/deletepost/:slug", auth.checkAuth, posts.deletePost);
	this.get("/api/drafts", auth.checkAuth, posts.getDrafts);
	this.post("/api/newdraft", auth.checkAuth, posts.newDraft);
	this.get("/api/draft/:id", auth.checkAuth, posts.getDraft);
	this.post("/api/deleteDraft", auth.checkAuth, posts.deleteDraft);

	//Public routes
	this.get("/api/post/:slug", posts.getPost);
	this.get("/api/posts", posts.getAll);

	//login logout stuff
	this.post("/api/logout", auth.logout);
	this.get("/api/isAuth", auth.isAuth);
	this.post("/api/login", auth.login);
};