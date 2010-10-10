/*
 * 单元测试: lib/underscore.js
 * 
 * 注意：全部用面向对象方式使用 underscore 库
 */
require('./../../lib/underscore')
    
module.exports = {
	//
	//expresso * -o 'can_arrays_first'
	//
	'can_arrays_first' : function(assert) {
		assert.equal(_([1, 2, 3]).first(), 1, 'can perform OO-style "first()"');		
		assert.equal(_([1,2,3]).first(2).join(','), '1,2', 'can pass an index to first');
		
	    var result = (function(){ return _(arguments).first(); })(4, 3, 2, 1);
    	assert.equal(result, 4, 'works on an arguments object.');
	}
	//
	//expresso * -o 'can_arrays_rest'
	//
	,'can_arrays_rest' : function(assert) {
	    var numbers = [1, 2, 3, 4];
    	assert.equal(_(numbers).rest().join(", "), "2, 3, 4", 'working rest()');
	    assert.equal(_(numbers).rest(2).join(', '), '3, 4', 'rest can take an index');
    	
		var result = (function(){ return _(arguments).tail(); })(1, 2, 3, 4);
	    assert.equal(result.join(', '), '2, 3, 4', 'aliased as tail and works on arguments object');
	}
	//
	//expresso * -o 'can_arrays_last'
	//
	,'can_arrays_last' : function(assert) {
	    assert.equal(_([1,2,3]).last(), 3, 'can pull out the last element of an array');
	    
	    var result = (function(){ return _(arguments).last(); })(1, 2, 3, 4);
	    assert.equal(result, 4, 'works on an arguments object');
	}
	//
	//expresso * -o 'can_arrays_compact'
	//
	,'can_arrays_compact' : function(assert) {
	    assert.equal(_([0, 1, false, 2, false, 3]).compact().join(","), '1,2,3', 'can trim out all falsy values');
		
	    var result = (function(){ return _(arguments).compact(); })(0, 1, false, 2, false, 3);
	    assert.equal(result.join(","), '1,2,3', 'works on an arguments object');
	}
	//
	//expresso * -o 'can_arrays_without'
	//
	,'can_arrays_without' : function(assert) {
	    var list = [1, 2, 1, 0, 3, 1, 4];
    	assert.equal(_(list).without(0, 1).join(', '), '2, 3, 4', 'can remove all instances of an object');
		
	    var result = (function(){ return _(arguments).without(0, 1); })(1, 2, 1, 0, 3, 1, 4);
    	assert.equal(result.join(', '), '2, 3, 4', 'works on an arguments object');
    
    	var list = [{one : 1}, {two : 2}];
	    assert.equal(_(list).without({one : 1}).length, 2, 'must use real object identity for comparisons.');
	    assert.equal(_(list).without(list[0]).length, 1, 'removed');
	}
	//
	//expresso * -o 'can_arrays_uniq'
	//
	,'can_arrays_uniq' : function(assert) {
	    var list = [1, 2, 1, 3, 1, 4];
    	assert.equal(_(list).uniq().join(', '), '1, 2, 3, 4', 'can find the unique values of an unsorted array');
		
	    var list = [1, 1, 1, 2, 2, 3];
    	assert.equal(_(list).uniq(true).join(', '), '1, 2, 3', 'can find the unique values of a sorted array faster');
    	
	    var result = (function(){ return _(arguments).uniq(); })(1, 2, 1, 3, 1, 4);
    	assert.equal(result.join(', '), '1, 2, 3, 4', 'works on an arguments object');
	}
	//
	//expresso * -o 'can_arrays_intersect'
	//
	,'can_arrays_intersect' : function(assert) {
	    var stooges = ['moe', 'curly', 'larry'], 
	    	leaders = ['moe', 'groucho'];
	    	
	    assert.equal(_(stooges).intersect(leaders).join(''), 'moe', 'can perform an OO-style intersection');
		
	    var result = (function(){ return _(arguments).intersect(leaders); })('moe', 'curly', 'larry');
    	assert.equal(result.join(''), 'moe', 'works on an arguments object');
	}
	//
	//expresso * -o 'can_arrays_zip'
	//
	,'can_arrays_zip' : function(assert) {
	    var names = ['moe', 'larry', 'curly'], 
	    	ages = [30, 40, 50], 
	    	leaders = [true];
    	var stooges = _(names).zip(ages, leaders);
    	//stooges的值为（想象一下裤子的拉链）：
    	//[ [ 'moe', 30, true ]
		//, [ 'larry', 40, undefined ]
		//, [ 'curly', 50, undefined ]
		//]
    	assert.equal(String(stooges), 'moe,30,true,larry,40,,curly,50,', 'zipped together arrays of different lengths');
	}
	//
	//expresso * -o 'can_arrays_indexOf'
	//
	,'can_arrays_indexOf' : function(assert) {
	    var numbers = [1, 2, 3];
	    assert.equal(_(numbers).indexOf(2), 1, 'can compute indexOf, even without the native function');
	    
	    var result = (function(){ return _(arguments).indexOf(2); })(1, 2, 3);
	    assert.equal(result, 1, 'works on an arguments object');
	}
	//
	//expresso * -o 'can_arrays_lastIndexOf'
	//
	,'can_arrays_lastIndexOf' : function(assert) {
	    var numbers = [1, 0, 1, 0, 0, 1, 0, 0, 0];
	    assert.equal(_(numbers).lastIndexOf(1), 5, 'can compute lastIndexOf, even without the native function');
    	assert.equal(_(numbers).lastIndexOf(0), 8, 'lastIndexOf the other element');
    	
    	var result = (function(){ return _(arguments).lastIndexOf(1); })(1, 0, 1, 0, 0, 1, 0, 0, 0);
    	assert.equal(result, 5, 'works on an arguments object');
	}
	//
	//expresso * -o 'can_arrays_range'
	//
	,'can_arrays_range' : function(assert) {
	    assert.equal(_(0).range().join(''), '', 'range with 0 as a first argument generates an empty array');
	    assert.equal(_(4).range().join(' '), '0 1 2 3', 'range with a single positive argument generates an array of elements 0,1,2,...,n-1');
	    assert.equal(_(5).range(8).join(' '), '5 6 7', 'range with two arguments a &amp; b, a&lt;b generates an array of elements a,a+1,a+2,...,b-2,b-1');
	    assert.equal(_(8).range(5).join(''), '', 'range with two arguments a &amp; b, b&lt;a generates an empty array');
	    assert.equal(_(3).range(10,3).join(' '), '3 6 9', 'range with three arguments a &amp; b &amp; c, c &lt; b-a, a &lt; b generates an array of elements a,a+c,a+2c,...,b - (multiplier of a) &lt; c');
	    assert.equal(_(3).range(10,15).join(''), '3', 'range with three arguments a &amp; b &amp; c, c &gt; b-a, a &lt; b generates an array with a single element, equal to a');
	    assert.equal(_(12).range(7,-2).join(' '), '12 10 8', 'range with three arguments a &amp; b &amp; c, a &gt; b, c &lt; 0 generates an array of elements a,a-c,a-2c and ends with the number not less than b');
	    assert.equal(_(0).range(-10,-1).join(' '), '0 -1 -2 -3 -4 -5 -6 -7 -8 -9', 'final example in the Python docs');
	}
	//
	//expresso * -o 'can_collections_each'
	//
	,'can_collections_each' : function(assert) {
	    _([1, 2, 3]).each(function(num, i) {
    	  assert.equal(num, i + 1, 'each iterators provide value and iteration count');
    	});
    	
	    var answer = null;
    	_([1, 2, 3]).each(function(num) { 
    		if ((answer = num) == 2) _().breakLoop(); 
    	});
    	assert.equal(answer, 2, 'the loop broke in the middle');
    	
	    var answers = [];
	    _([1, 2, 3]).each(function(num) { 
	    	answers.push(num * this.multiplier);
	    }, {multiplier : 5});
	    assert.equal(answers.join(', '), '5, 10, 15', 'context object property accessed');
    	
		answers = [];
		_([1, 2, 3]).forEach(function(num) { 
			answers.push(num); 
		});
		assert.equal(answers.join(', '), '1, 2, 3', 'aliased as "forEach"');

		answers = [];
		var obj = {one : 1, two : 2, three : 3};
		obj.constructor.prototype.four = 4;
		_(obj).each(function(value, key) { 
			answers.push(key); 
		});
		assert.equal(answers.join(", "), 'one, two, three', 'iterating over objects works, and ignores the object prototype.');
		delete obj.constructor.prototype.four;
		
	}
};

//EOP
