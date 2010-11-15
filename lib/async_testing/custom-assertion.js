/**
 * Thanks: https://github.com/visionmedia/expresso/blob/master/bin/expresso
 */
var server = require('../../server')
    ,async_testing = require('./async_testing')
    ,sys = require('sys')
    ,assert = require('assert')
    ,http = require('http')
    
/**
 * Server port.
 */

var port = 5555;
/**
 * Boring output.
 */ 
var boring = false;
/**
 * Colorize the given string using ansi-escape sequences.
 * Disabled when --boring is set.
 *
 * @param {String} str
 * @return {String}
 */
function colorize(str){
    var colors = { bold: 1, red: 31, green: 32, yellow: 33 };
    return str.replace(/\[(\w+)\]\{([^]*?)\}/g, function(_, color, str){
        return boring
            ? str
            : '\x1B[' + colors[color] + 'm' + str + '\x1B[0m';
    });
}

/**
 * test.response
 */
async_testing.registerAssertion('response', 
   function response(server, req, res, msg){
    // Callback as third or fourth arg
    var callback = typeof res === 'function'
        ? res
        : typeof msg === 'function'
            ? msg
            : function(){};

    // Default messate to test title
    if (typeof msg === 'function') msg = null;
    msg = msg || assert.testTitle;
    msg += '. ';

    // Pending responses
    server.__pending = server.__pending || 0;
    server.__pending++;

    // Create client
    if (!server.fd) {
        server.listen(server.__port = port++, '127.0.0.1');
        server.client = http.createClient(server.__port);
    }

    // Issue request
    var timer,
        client = server.client,
        method = req.method || 'GET',
        status = res.status || res.statusCode,
        data = req.data || req.body,
        timeout = req.timeout || 0;

    var request = client.request(method, req.url, req.headers);

    // Timeout
    if (timeout) {
        timer = setTimeout(function(){
            --server.__pending || server.close();
            delete req.timeout;
            assert.fail(msg + 'Request timed out after ' + timeout + 'ms.');
        }, timeout);
    }

    if (data) request.write(data);
    request.addListener('response', function(response){
        response.body = '';
        response.setEncoding('utf8');
        response.addListener('data', function(chunk){ response.body += chunk; });
        response.addListener('end', function(){
            --server.__pending || server.close();
            if (timer) clearTimeout(timer);

            // Assert response body
            if (res.body !== undefined) {
                var eql = res.body instanceof RegExp
                  ? res.body.test(response.body)
                  : res.body === response.body;
                assert.ok(
                    eql,
                    msg + 'Invalid response body.\n'
                        + '    Expected: ' + sys.inspect(res.body) + '\n'
                        + '    Got: ' + sys.inspect(response.body)
                );
            }

            // Assert response status
            if (typeof status === 'number') {
                assert.equal(
                    response.statusCode,
                    status,
                    msg + colorize('Invalid response status code.\n'
                        + '    Expected: [green]{' + status + '}\n'
                        + '    Got: [red]{' + response.statusCode + '}')
                );
            }

            // Assert response headers
            if (res.headers) {
                var keys = Object.keys(res.headers);
                for (var i = 0, len = keys.length; i < len; ++i) {
                    var name = keys[i],
                        actual = response.headers[name.toLowerCase()],
                        expected = res.headers[name];
                    assert.equal(
                        actual,
                        expected,
                        msg + colorize('Invalid response header [bold]{' + name + '}.\n'
                            + '    Expected: [green]{' + expected + '}\n'
                            + '    Got: [red]{' + actual + '}')
                    );
                }
            }

            // Callback
            callback(response);
        });
    });
    request.end();
})

/**
 * test.includes
 */
async_testing.registerAssertion('includes',
  function(obj, val, msg) {
    msg = msg || sys.inspect(obj) + ' does not include ' + sys.inspect(val);
    assert.ok(obj.indexOf(val) >= 0, msg);
  }
)

//EOP
