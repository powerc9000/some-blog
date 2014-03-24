
module.exports = function(db){
	var posts = require("./routes/posts")(db);
	this.get(/^((?!\/api).)*$/, function(req, res){
		res.render("index");
	});

	this.post("/api/newpost", posts.newPost);
	this.get("/api/post/:slug", posts.getPost);
};