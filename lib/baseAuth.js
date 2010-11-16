var Buffer = require('buffer').Buffer;

function BaseAuth() {  
      
};  
BaseAuth.prototype.authenticate = function(request, successCallback, failureCallback) {
    var requestUsername = "";
    var requestPassword = "";
    if (!request.headers['authorization']) {
        failureCallback();
    } else {
        var auth = this._decodeBase64(request.headers['authorization']);
        if (auth) {
            requestUsername = auth.username;
            requestPassword = auth.password;
        } else {
            failureCallback();
        }
    }
    
    successCallback(requestUsername);
    //TODO: Query your database (don't forget to do so async)
//    db.query(function(result)  {
//        if (result.username == requestUsername && result.password == requestPassword) {
//            successCallback(requestUsername);
//        } else {
//            failureCallback();
//        }
//    });
};
BaseAuth.prototype._decodeBase64 = function(headerValue) {
    var value;
    if (value = headerValue.match("^Basic\\s([A-Za-z0-9+/=]+)$")) {
        var auth = (new Buffer(value[1] || "", "base64")).toString("ascii");
        return {
            username : auth.slice(0, auth.indexOf(':')),
            password : auth.slice(auth.indexOf(':') + 1, auth.length)
        };
    } else {
        return null;
    }
};

module.exports = BaseAuth

//EOP
