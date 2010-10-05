
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
console.log(sys.inspect(module))
var app = module.exports = express.createServer()

//调用其他

require('./apps/demo/route')


// Configuration
app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
   app.use(express.errorHandler()); 
});

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.use(express.logger({ format: ':method :url :status' }));
    app.use(express.bodyDecoder());
    app.use(express.methodOverride());
    app.use(express.cookieDecoder());        
    app.use(app.router);
    app.use(express.conditionalGet()); //必须与cache一起用
    app.use(express.cache());
    app.use(express.gzip());   
    app.use(express.staticProvider(__dirname + '/public'));
});


// Routes

// Only listen on $ node app.js

if (!module.parent) {
    app.listen(3000);
    console.log("Express server listening on port %d", app.address().port)
}
