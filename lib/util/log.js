/**
 * Thanks: http://github.com/dylang/opowerjobs
 */
var sys = require("sys"),
	fs = require('fs'),
    history = [],
    ready;

var log_path = "./logs/log.txt"
    
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


function init(path) {
    var file = path.split('/').pop().split('.')[0];
    var log_function = function() { log(file, arguments); };
    log_function.history = function(){ return history;};
    log_function.ago = prettyTimeDiff;
    return log_function;
}

function log(file, messages) {

    var date = new Date();
    date.setTime(date - TIMEZONE_OFFSET);

    var output = [];
    for ( var i in messages ) {
    	var msg = messages[i]
        switch (typeof msg) {
            case 'string':
                output.push(color(colors.white, msg));
                break;
            case 'number':
                output.push(color(colors.yellow, msg));
                break;
            case 'function':
                output.push(color(colors.bold.yellow, msg.toString()));
                break;
            default:
                msg = sys.inspect(msg, false, 6, true);
                if (msg.length > 80) {
                    msg = ("\n" + msg).split(/\n/).join("\n    ");
                }
                output.push(color(colors.bold.cyan, msg));
                break;
        }
		fs.open(log_path,'a+', 0666, function(err,fd){
		  fs.write(fd,prettyTimeDiff(date) + " - " + msg +'\n', null, 'utf8', 
		  		function(err,data) {
		    		fs.close(fd);
		  	  })
		})
    };

    console.log(
        (color(colors.cyan, prettyTimeDiff(date))) + ' '
        + (file ? color(colors.green, file) + ' ' : '')
        + output.join(' ')
        );

    //history.push({
    //    date: date,
    //    file: file,
    //    messages: messages
    //});
}

var colors = {
  reset: "\x1B[0m",

  grey:    "\x1B[0;30m",
  red:     "\x1B[0;31m",
  green:   "\x1B[0;32m",
  yellow:  "\x1B[0;33m",
  blue:    "\x1B[0;34m",
  magenta: "\x1B[0;35m",
  cyan:    "\x1B[0;36m",
  white:   "\x1B[0;37m",

  bold: {
    grey:    "\x1B[1;30m",
    red:     "\x1B[1;31m",
    green:   "\x1B[1;32m",
    yellow:  "\x1B[1;33m",
    blue:    "\x1B[1;34m",
    magenta: "\x1B[1;35m",
    cyan:    "\x1B[1;36m",
    white:   "\x1B[1;37m"
  }
};

function color(color, text) {
    return color + text + colors.reset;
}

module.exports = log;
module.exports.from = init;

if (!ready) {
    log('log', ['ready']);
    ready = true;
}