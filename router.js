
module.exports = function(db){
	var posts = require("./routes/posts")(db);
	var auth = require("./routes/auth")(db);
	var fs = require("fs");
	var ejs = require("ejs");
	var config = require("./config");
	var path = require('path');
	
	//Catches everyting except /api and gives the index page for angularjs
	//Public things like javascript and css are resolved before this
	//But if you get a 404 on any of them it gives you the index page 
	//then angular tries to load that inside the template recursively
	//Stalling the page.
	//Probably a better way to handle this
	this.get("/theme/*", function(req, res){
		var file = req.path.slice(7);
		var theme = config.theme || "default";
		console.log(path.join(__dirname, "themes", theme, file));
		res.sendfile(path.join(__dirname, "themes", theme, file));
	});
	this.get(/^((?!\/api).)*$/, function(req, res){
		var theme = config.theme || "default";
		fs.readFile(path.join(__dirname, "themes", theme, "index.html"), "utf8", function(err, data){
			if(!err){
				res.end(ejs.render(data, {auth:req.session.auth}));
			}else{
				res.send(404);
			}
			
		});
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
	this.get("/api/tag/:tag", posts.getByTag);
	//login logout stuff
	this.post("/api/logout", auth.logout);
	this.get("/api/isAuth", auth.isAuth);
	this.post("/api/login", auth.login);
};