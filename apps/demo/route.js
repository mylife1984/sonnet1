/**
 * home
 */
var app = module.parent.exports

var service = require('./home'); 

app.get('/', service.get);

//EOP
