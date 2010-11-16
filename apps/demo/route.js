/**
 * home
 */
 
var server = module.parent.exports
   ,service = require('./home')
   
function requireLogin(req, res, next) {
	  if(req.user.authenticated) {
	  	 console.log('login ok');
	  	 next();
	  }
}
   
server.get('/', service.showIndex);

server.get('/json', requireLogin, service.getJsonData);

server.get('/remotejson', service.getRemoteJsonData);

server.get('/500page', service.show500page); //show500page不存在

//EOP