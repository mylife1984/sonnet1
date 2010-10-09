/*
 * 单元测试: lib/underscore.js
 */
require('./../../lib/underscore')
    
module.exports = {
	//
	//expresso * -o 'can_arrays_first'
	//
	'can_arrays_first' : function(assert) {
		assert.equal(_([1, 2, 3]).first(), 1, 'can perform OO-style "first()"');	
	}
};

//EOP
