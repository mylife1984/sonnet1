/**
 * 单元测试: demo/home.js
 */
var server = require('../../server')
    ,async_testing = require('./../../lib/async_testing')
    ,Buffer = require('buffer').Buffer
    
if (module == require.main) {
  return async_testing.run(process.ARGV);
}

module.exports = {
    /**
     * node test-home.js --test-name "can show home page"
     */
    'can show home page' : function(test) {
        var req = {
            url : '/',
            method : 'GET'
        }
        var res = {
            status : 200,
            headers : {
                'Content-Type' : 'text/html; charset=utf-8'
            }
        }
        test.response(server, req, res, function(res) {
            //console.log(sys.inspect(res));
            test.includes(res.body, '退出');
            test.finish()
        });
    }
    /**
     * node test-home.js --test-name "can show 404 page"
     */
    ,'can show 404 page' : function(test) {
        var req = {
            url : '/notfoundpage',
            method : 'GET'
        }
        var res = {
            status : 200,
            headers : {
                'Content-Type' : 'text/html; charset=utf-8'
            }
        }
        test.response(server, req, res, function(res) {
            test.includes(res.body, 'Cannot find');
            test.finish()
        });
    }
    /**
     * node test-home.js --test-name "can show 500 page"
     */
//    ,'can show 500 page' : function(test) {
//        var req = {
//            url : '/500page',
//            method : 'GET'
//        }
//        var res = {
//            status : 200,
//            headers : {
//                'Content-Type' : 'text/html; charset=utf-8'
//            }
//        }
//        test.response(server, req, res, function(res) {
//        	  console.log(res.body)
//            test.includes(res.body, '500 ERROR');
//            test.finish()
//        });
//    }
    /**
     * node test-home.js --test-name "can get json data"
     */
    ,'can get json data' : function(test) {
        var username = 'Test';
        var password = '123';
        //auth is: 'Basic VGVzdDoxMjM='
        var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
        var req = {
            url : '/json',
            method : 'GET',
            headers : {
                'Authorization' : auth
            }
        }
        var res = {
            status : 200,
            headers : {
                'Content-Type' : 'application/json'
            }
        }
        test.response(server, req, res, function(res) {
            var resp = JSON.parse(res.body)  //builtin JSON 
            test.ok(resp.success);
            test.equal(resp.rows,0);
            test.equal(JSON.stringify(resp),'{"success":true,"rows":0}')
            test.finish()
        });
    }
    /**
     * node test-home.js --test-name "can get remote json data"
     * 
     * 注意：需要启动 sonnet11 项目
     */
//    ,'can get remote json data' : function(test) {
//        var req = {
//            url : '/remotejson',
//            method : 'GET'
//        }
//        var res = {
//            status : 200,
//            headers : {
//                'Content-Type' : 'application/json'
//            }
//        }
//        test.response(server, req, res, function(res) {
//            var resp = JSON.parse(res.body)  //builtin JSON 
//            test.ok(resp.success);
//            test.equal(JSON.stringify(resp),'{"success":true}')
//            test.finish()
//        });
//    }
};

//EOP
