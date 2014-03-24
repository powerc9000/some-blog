
/**
 * Module dependencies.
 */
 /*jshint node: true*/
"use strict";
var fs = require('fs');
var express = require('express');
var router = require('./router');
var http = require('http');
var path = require('path');
var ejs = require("ejs");
var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "html");
app.engine('html', ejs.__express);
app.set('view options', { layout: false });
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('some secret'));
app.use(express.cookieSession());
app.use(express.csrf());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
router.call(app);
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
