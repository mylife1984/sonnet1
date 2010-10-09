/**
 * 项目入口
 */
require.paths.unshift(__dirname);
require.paths.unshift(__dirname+"/lib");

var express = require('express'),
	sys = require('sys'),
	fs = require('fs'),
	log = require('util/log'),
	objToHTML = require('util/prettyJSON');

//This makes it accessible to your child module through module.parent.exports.
//
//例如：
//var app = module.parent.exports 
//app.get('/user/', function(req, res){ ...
//
var server = module.exports = express.createServer()

//in case of crash. I've never seen this used, got it from somebody else's code.
process.title = 'sonnet1';
process.addListener('uncaughtException', function (err, stack) {
    console.log("EXCEPTION: please see log.txt");
    //console.log(stack);
    log('*************************************');
    log('************EXCEPTION****************');
    log('*************************************');
    err.message && log(err.message);
    err.stack && log(err.stack);
    log('*************************************');
});

//配置
server.configure('development', function(){
    log('running in development mode');
    //server.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

server.configure('production', function(){
   log('running in production mode');
   server.use(express.errorHandler()); 
});

server.configure(function(){
	
    server.set('views', __dirname + '/views');
    
    //提供给view使用
    server.dynamicHelpers({
    	//<%= request.url %>
        request: function(req){
            return req;
        }
    })    
    server.helpers({
        debug: objToHTML
    }) 
    
    // Setup ejs views as default, with .html as the extension
    server.register('.html', require('ejs'));
    server.set('view engine', 'html');
    
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

//Error
server.error(function(err, req, res, next){
	    var url = 'http://' + req.headers.host + req.url;
        if (err.message != 'EISDIR, Is a directory') {
            log('*************************************');
            log('****************ERROR****************');
            log('*************************************');
            log(url);
            err.message && log(err.message);
            err.arguments && log(err.arguments);
            err.stack && log(err.stack);
            log('*************************************');
        }
        if (server.get('env') == 'production') {
            res.redirect('/');
        } else {
            res.render('500.html', { locals: { 
            	title: 'Error:'+url, 
            	message: err.message, 
            	object: err.stack }
            });
        }
});
// Example 404 page via simple Connect middleware
server.use(function(req, res){
    res.render('404.html');
});

//加载app
fs.readdirSync(__dirname + '/apps').forEach(function(filename){
    if (!/\.js$/.test(filename)) {
        require('apps/' + filename+"/route");
    }
});

//Only listen on $ node server.js
if (!module.parent) {
    server.listen(3000);
    console.log("Express server listening on port %d", server.address().port)
}
