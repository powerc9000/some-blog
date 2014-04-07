
module.exports = function(db, config){
	var posts = require("./routes/posts")(db);
	var auth = require("./routes/auth")(db);
	var blogSettings = require("./routes/blogSettings")(db, config);
	var fs = require("fs");
	var ejs = require("ejs");
	var path = require('path');
	
	this.get("/theme/*", function(req, res){
		//Cut off the '/theme/' part of the path
		var file = req.path.slice(7);
		//Proxy over requests to /theme/ to the actaul theme directory 
		//Will have to see if this is a bottleneck
		var theme = config.theme || "default";
		res.sendfile(path.join(__dirname, "themes", theme, file));
	});
	//Catches everyting except /api and gives the index page for angularjs
	//Public things like javascript and css are resolved before this
	//But if you get a 404 on any of them it gives you the index page 
	//then angular tries to load that inside the template recursively
	//Stalling the page.
	//Probably a better way to handle this
	this.get(/^((?!\/api).)*$/, function(req, res){
		//All requests to URLS except /api just get the index.html probably should check if it has a file extension and deliver a 404 if so.
		//look for index.html in the current theme directory
		var theme = config.theme || "default";

		fs.readFile(path.join(__dirname, "themes", theme, "index.html"), "utf8", function(err, data){
			if(!err){
				res.end(ejs.render(data, {auth:req.session.auth, blogName:config["blog-name"]}));
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
	this.get("/api/all-themes", auth.checkAuth, blogSettings.allThemes);
	this.post("/api/change-theme", auth.checkAuth, blogSettings.changeTheme);
	this.post("/api/change-blog-name", auth.checkAuth, blogSettings.changeBlogName);
	//Public routes
	this.get("/api/post/:slug", posts.getPost);
	this.get("/api/posts", posts.getAll);
	this.get("/api/tag/:tag", posts.getByTag);
	//login logout stuff
	this.post("/api/logout", auth.logout);
	this.get("/api/isAuth", auth.isAuth);
	this.post("/api/login", auth.login);
};