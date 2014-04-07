module.exports = function(db, config){
	var fs = require("fs");
	var Q = require("q");
	var path = require("path");
	//Returns the names of all the directories in a directory
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
		//Finds all the names of the theme folders in the theme directory
		//May need to change to find like a <theme-name>/theme.json so that it can have an img and a name along with it
		//besides just the directory name
		allThemes: function(req, res){
			var themes = [];
			getDirs(path.join(process.cwd(), "themes")).then(function(dirs){
				dirs.forEach(function(d, i){
					fs.readFile(path.join(process.cwd(), "themes", d, "theme.json"), "utf8", function(err, data){
						if(err) return;
						var t = JSON.parse(data);
						t.tag = d;
						themes.push(t);
						if(i + 1=== dirs.length){
							res.send({
								currentTheme: config.theme || "default",
								themes: themes
							});
						}
					});
				});
				
			});
		},
		changeTheme: function(req, res){
			var theme = req.body.theme;
			
			if(theme !== config.theme){
				config.theme = theme;
			
				fs.writeFile(path.join(process.cwd(), "config.json"), JSON.stringify(config, null, "  "), function(err){
					res.send(200);
				});
			}else{
				res.send(200);
			}
		},
		changeBlogName: function(req, res){
			config["blog-name"] = req.body.blogName;
			fs.writeFile(path.join(process.cwd(), "config.json"), JSON.stringify(config, null, "  "), function(err){
				res.send(200);
			});
		}
	};
};