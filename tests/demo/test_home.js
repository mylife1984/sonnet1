
// Run $ expresso

/**
 * Module dependencies.
 */

var app = require('../../app');

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
		assert.response(app, req, res, function(res) {
					assert.includes(res.body, '<title>My Express</title>');
				});
	}
};