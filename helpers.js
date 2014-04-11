var md = require("markdown").markdown;
exports.doMarkdown = function doMarkdown(val){
    var words;
    var lines;
    //Finds links
    var linkRegex = /(?:ftp|http|https):\/\/(?:[\w\.\-\+]+:{0,1}[\w\.\-\+]*@)?(?:[a-z0-9\-\.]+)(?::[0-9]+)?(?:\/|\/(?:[\w#!:\.\?\+=&%@!\-\/\(\)]+)|\?(?:[\w#!:\.\?\+=&%@!\-\/\(\)]+))?$/ig;
    if(val){

      //Split the entire Markdown string into lines then words
      lines = val.split("\n");
      lines.forEach(function(l, i){
        words = l.split(" ");
        words.forEach(function(w, i){
          w.replace(linkRegex, function(match, idx, word){
            words[i] = "["+word+"]"+"("+match+")";
          });
        });
        lines[i] = words.join(" ");
      });
      
      val = lines.join("\n");
      return md.toHTML(val);
    }
    else{
      return "";
    }
  };