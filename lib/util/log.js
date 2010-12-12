/**
 * 日志(引用 /log4js.json 中的配置）
 */
var log4js = require('log4js')()
    ,settings = require('settings')
    ,ospath = require('path')

var filename = ospath.join(settings.PATH_ROOT,"log.txt");
log4js.addAppender(log4js.fileAppender(filename), "sonnet");
var logger = log4js.getLogger('sonnet');

module.exports = logger;

//EOP
