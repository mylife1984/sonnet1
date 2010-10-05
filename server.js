
/**
 * Module dependencies.
 */

var express = require('express'),
	sys = require('sys'),
	log = require('./lib/util/log').from(__filename),
	objToHTML = require('./lib/util/prettyJSON');

//This makes it accessible to your child module through module.*parent*.exports.
//
//例如：
//var app = module.parent.exports 
//app.get('/user/', function(req, res){ ...
//
var server = module.exports = express.createServer()

//in case of crash. I've never seen this used, got it from somebody else's code.
process.title = 'opowerjobs';
process.addListener('uncaughtException', function (err, stack) {
    console.log(err);
    console.log(stack);
    log('*************************************');
    log('************EXCEPTION****************');
    log('*************************************');
    err.message && log(err.message);
    err.stack && log(err.stack);
    log('*************************************');
});

//调用其他分系统
require('./apps/demo/route')

//配置
server.configure('development', function(){
    log('running in development mode');
    server.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

server.configure('production', function(){
   log('running in production mode');
   server.use(express.errorHandler()); 
});

server.configure(function(){
    server.helpers({
        debug: objToHTML,
        log: log
    });
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

//Error
server.error(function(err, req, res, next){
        if (err.message != 'EISDIR, Is a directory') {
            log('*************************************');
            log('****************ERROR****************');
            log('*************************************');
            log('http://' + req.headers.host + req.url);
            err.message && log(err.message);
            err.arguments && log(err.arguments);
            err.stack && log(err.stack);
            log('*************************************');
        }
        if (server.get('env') == 'production') {
            res.redirect('/');
        } else {
            res.render('error.ejs', { locals: { title: 'Error', message: err.message, object: false } });
        }
});

//Routes
server.get('/log', function(req, res) {
    res.render('log.ejs',  { locals: { history: log.history() } });
});

// Required for 404's to return something
server.get('/*', function(req, res){
    var host = req.headers.host.split(':')[0],
        new_url,
        extension = req.url.match(/\....$/);

    if (extension) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Cannot ' + req.method + ' ' + req.url);
    }
    else {
        if (!req.session.tempHost || host == 'localhost') {
            if (req.headers['user-agent'] && req.headers['user-agent'].match(/msnbot|slurp/i) === null) {
                log('404', req.url, req.headers.referrer || req.headers.referer || req.session.jobboard || '');
            }
        }

        var array = req.url.replace(/\/\//g, '/').split('/');
        if (array.pop() == '') { array.pop(); }

        new_url = array.join('/') || '/';
        res.redirect(new_url);
    }
});

//Only listen on $ node server.js
if (!module.parent) {
    server.listen(3000);
    console.log("Express server listening on port %d", server.address().port)
}
