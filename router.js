module.exports = function(){
	this.get(/^((?!\/api).)*$/, function(req, res){
		res.render("index");
	});
};