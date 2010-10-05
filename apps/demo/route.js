/**
 * home
 */
var server = module.parent.exports

var service = require('./home'); 

server.get('/', service.get2);

//EOP
