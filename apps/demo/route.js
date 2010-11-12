/**
 * home
 */
 
var server = module.parent.exports

var service = require('./home'); 

server.get('/', service.showIndex);

server.get('/json', service.getJsonData);

server.get('/remotejson', service.getRemoteJsonData);

server.get('/500page', service.show500page); //show500page不存在

//EOP