/**
 * home
 */
 
var server = module.parent.exports

var sys = require('sys');
console.log(sys.inspect(server))
//console.log(server.ROOT_PATH);

var service = require('./home'); 

server.get('/', service.showIndex);

//EOP