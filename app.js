
/**
 * Module dependencies.
 */

var express = require('express');

//This makes it accessible to your child module through module.*parent*.exports.
//
//例如：
//var app = module.parent.exports 
//app.get('/user/', function(req, res){ ...
//
var app = module.exports = express.createServer(
    // Place default Connect favicon above logger so it is not in
    // the logging output
    //express.favicon(),

    // Custom logger format
    express.logger({ format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :status' })

);

require('./apps/demo/route')

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.use(express.bodyDecoder());
    app.use(express.methodOverride());
    app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
    app.use(app.router);
    app.use(express.cache());
    //app.use(express.gzip());   
    app.use(express.staticProvider(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
   app.use(express.errorHandler()); 
});

// Routes

// Only listen on $ node app.js

if (!module.parent) {
    app.listen(3000);
    console.log("Express server listening on port %d", app.address().port)
}
