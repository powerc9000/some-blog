module.exports = function(db, config){
	var fs = require("fs");
	var Q = require("q");
	var path = require("path");
	getDirs = function(rootDir) {
		var q = Q.defer();
		fs.readdir(rootDir, function(err, files) {
			var dirs, file, filePath, index, _i, _len, _results;
			dirs = [];
			_results = [];
			files.forEach(function(file, i){
				if(file[0] !== '.'){
					filePath = "" + rootDir + "/" + file;

					fs.stat(filePath, function(err, stat){
						if(stat.isDirectory()){
							dirs.push(file);
						}
						if (files.length === (i + 1)) {
							q.resolve(dirs);
						}
					});
				}

			});
		
		});
		return q.promise;
	};
	return{
		allThemes: function(req, res){
			getDirs(path.join(process.cwd(), "themes")).then(function(dirs){
				res.send({
					currentTheme: config.theme || "default",
					themes: dirs
				});
			});
		},
		changeTheme: function(req, res){
			config.theme = req.body.theme;
			fs.writeFile(path.join(process.cwd(), "config.json"), JSON.stringify(config, null, "  "), function(err){
				res.send(200);
			});
		},
		changeBlogName: function(req, res){
			config["blog-name"] = req.body.blogName;
			fs.writeFile(path.join(process.cwd(), "config.json"), JSON.stringify(config, null, "  "), function(err){
				res.send(200);
			});
		}
	};
};