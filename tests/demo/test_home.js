/**
 * 单元测试: demo/home.js
 */
var server = require('../../server'),
sys = require('sys');

module.exports = {
    //
    //expresso * -o 'can_show_home'
    //
    'can_show_home' : function(assert) {
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
        assert.response(server, req, res, function(res) {
            //console.log(sys.inspect(res));
            assert.includes(res.body, '退出');
        });
    }
    //
    //expresso * -o 'can_show_404'
    //
    ,'can_show_404' : function(assert) {
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
        assert.response(server, req, res, function(res) {
            assert.includes(res.body, 'Cannot find');
        });
    }
    //
    //expresso * -o 'can_show_500'
    //
    ,'can_show_500' : function(assert) {
        var req = {
            url : '/500page',
            method : 'GET'
        }
        var res = {
            status : 200,
            headers : {
                'Content-Type' : 'text/html; charset=utf-8'
            }
        }
        assert.response(server, req, res, function(res) {
            assert.includes(res.body, '500 ERROR');
        });
    }
    //
    //expresso * -o 'can_show_get_json_data'
    //
    ,'can_show_get_json_data' : function(assert) {
        var req = {
            url : '/json',
            method : 'GET'
        }
        var res = {
            status : 200,
            headers : {
                'Content-Type' : 'application/json'
            }
        }
        assert.response(server, req, res, function(res) {
            var resp = JSON.parse(res.body)  //builtin JSON 
            assert.ok(resp.success);
            assert.equal(resp.rows,0);
            assert.equal(JSON.stringify(resp),'{"success":true,"rows":0}')
        });
    }
    //
    //expresso * -o 'can_show_get_remote_json_data'
    //
    ,'can_show_get_remote_json_data' : function(assert) {
        var req = {
            url : '/remotejson',
            method : 'GET'
        }
        var res = {
            status : 200,
            headers : {
                'Content-Type' : 'application/json'
            }
        }
        assert.response(server, req, res, function(res) {
            var resp = JSON.parse(res.body)  //builtin JSON 
            assert.ok(resp.success);
            assert.equal(JSON.stringify(resp),'{"success":true}')
        });
    }
};

//EOP
