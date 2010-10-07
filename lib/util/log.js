/**
 * Thanks: http://github.com/dylang/opowerjobs
 */
var sys = require("sys"),
	fs = require('fs'),
	settings = require('./../../settings')
	ospath = require('path')

var log_path = ospath.join(settings.PATH_ROOT,"log.txt");
    
var TIMEZONE_OFFSET = (240 - (new Date).getTimezoneOffset()) * 60000;

var prettyTimeDiff = function(date) {
    var hour = date.getHours();
    hour = hour == 0 ? 12 : hour > 12 ? hour - 12 : hour;
    var min = date.getMinutes();
    min = min < 10 ? '0' + min : min;
    var sec = date.getSeconds();
    sec = sec < 10 ? '0' + sec : sec;
    return  hour + ':' + min  + ':' + sec;
};


function log(msg) {
    var date = new Date();
    date.setTime(date - TIMEZONE_OFFSET);

	fs.open(log_path,'a+', 0666, function(err,fd){
	  fs.write(fd,prettyTimeDiff(date) + " - " + msg +'\n', null, 'utf8', 
	  		function(err,data) {
	    		fs.close(fd);
	  	  })
	})
}

module.exports = log;

//EOP
