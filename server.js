
/**
 * Module dependencies.
 */

var express = require('express');
var sys = require('sys')

//This makes it accessible to your child module through module.*parent*.exports.
//
//例如：
//var app = module.parent.exports 
//app.get('/user/', function(req, res){ ...
//
var server = module.exports = express.createServer()

//调用其他分系统
require('./apps/demo/route')

//配置
server.configure('development', function(){
    server.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

server.configure('production', function(){
   server.use(express.errorHandler()); 
});

server.configure(function(){
    server.set('views', __dirname + '/views');
    server.use(express.logger({ format: ':method :url :status' }));
    server.use(express.bodyDecoder());
    server.use(express.methodOverride());
    server.use(express.cookieDecoder());        
    server.use(server.router);
    server.use(express.conditionalGet()); //必须与cache一起用
    server.use(express.cache());
    server.use(express.gzip());   
    server.use(express.staticProvider(__dirname + '/public'));
});


// Routes

// Only listen on $ node server.js
if (!module.parent) {
    server.listen(3000);
    console.log("Express server listening on port %d", server.address().port)
}
