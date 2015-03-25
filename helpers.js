var md = require("markdown").markdown;
function spliceString(str, index, count, add) {
  var ar = str.split('');
  ar.splice(index, count, add);
  return ar.join('');
}
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
            for(var j =0; j<word.length; j++){
              if(word[j] === "_"){
                
                word = spliceString(word, j, 0, "\\");
                j++;
              }
              //console.log(word);
            }
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