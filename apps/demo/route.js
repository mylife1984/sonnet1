/**
 * home
 */
 
var server = module.parent.exports

//var sys = require('sys');
//console.log(sys.inspect(server))
//console.log(server.ROOT_PATH);

var service = require('./home'); 

server.get('/', service.showIndex);
server.get('/500page', service.show500page); //show500page不存在

//EOP