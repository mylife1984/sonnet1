/*
 * 单元测试: lib/underscore.js
 * 
 * 注意：全部用面向对象方式使用 underscore 库
 */
require('./../../lib/underscore')

var async_testing = require('./../../lib/async_testing/async_testing')
    
if (module == require.main) {
  return async_testing.run(process.ARGV);
} 
    
module.exports = {
	//
	//node test-underscore.js --test-name 'can_arrays_first'
	//
	'can_arrays_first' : function(test) {
		  test.equal(_([1, 2, 3]).first(), 1, 'can perform OO-style "first()"');		
		  test.equal(_([1,2,3]).first(2).join(','), '1,2', 'can pass an index to first');
		
	    var result = (function(){ return _(arguments).first(); })(4, 3, 2, 1);
    	test.equal(result, 4, 'works on an arguments object.');
    	test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_arrays_rest'
	//
	,'can_arrays_rest' : function(test) {
	    var numbers = [1, 2, 3, 4];
    	test.equal(_(numbers).rest().join(", "), "2, 3, 4", 'working rest()');
	    test.equal(_(numbers).rest(2).join(', '), '3, 4', 'rest can take an index');
    	
		  var result = (function(){ return _(arguments).tail(); })(1, 2, 3, 4);
	    test.equal(result.join(', '), '2, 3, 4', 'aliased as tail and works on arguments object');
	    test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_arrays_last'
	//
	,'can_arrays_last' : function(test) {
	    test.equal(_([1,2,3]).last(), 3, 'can pull out the last element of an array');
	    
	    var result = (function(){ return _(arguments).last(); })(1, 2, 3, 4);
	    test.equal(result, 4, 'works on an arguments object');
	    test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_arrays_compact'
	//
	,'can_arrays_compact' : function(test) {
	    test.equal(_([0, 1, false, 2, false, 3]).compact().join(","), '1,2,3', 'can trim out all falsy values');
		
	    var result = (function(){ return _(arguments).compact(); })(0, 1, false, 2, false, 3);
	    test.equal(result.join(","), '1,2,3', 'works on an arguments object');
	    test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_arrays_without'
	//
	,'can_arrays_without' : function(test) {
	    var list = [1, 2, 1, 0, 3, 1, 4];
    	test.equal(_(list).without(0, 1).join(', '), '2, 3, 4', 'can remove all instances of an object');
		
	    var result = (function(){ return _(arguments).without(0, 1); })(1, 2, 1, 0, 3, 1, 4);
    	test.equal(result.join(', '), '2, 3, 4', 'works on an arguments object');
    
    	var list = [{one : 1}, {two : 2}];
	    test.equal(_(list).without({one : 1}).length, 2, 'must use real object identity for comparisons.');
	    test.equal(_(list).without(list[0]).length, 1, 'removed');
	    test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_arrays_uniq'
	//
	,'can_arrays_uniq' : function(test) {
	    var list = [1, 2, 1, 3, 1, 4];
    	test.equal(_(list).uniq().join(', '), '1, 2, 3, 4', 'can find the unique values of an unsorted array');
		
	    var list = [1, 1, 1, 2, 2, 3];
    	test.equal(_(list).uniq(true).join(', '), '1, 2, 3', 'can find the unique values of a sorted array faster');
    	
	    var result = (function(){ return _(arguments).uniq(); })(1, 2, 1, 3, 1, 4);
    	test.equal(result.join(', '), '1, 2, 3, 4', 'works on an arguments object');
    	test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_arrays_intersect'
	//
	,'can_arrays_intersect' : function(test) {
	    var stooges = ['moe', 'curly', 'larry'], 
	    	leaders = ['moe', 'groucho'];
	    	
	    test.equal(_(stooges).intersect(leaders).join(''), 'moe', 'can perform an OO-style intersection');
		
	    var result = (function(){ return _(arguments).intersect(leaders); })('moe', 'curly', 'larry');
    	test.equal(result.join(''), 'moe', 'works on an arguments object');
    	test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_arrays_zip'
	//
	,'can_arrays_zip' : function(test) {
	    var names = ['moe', 'larry', 'curly'], 
	    	ages = [30, 40, 50], 
	    	leaders = [true];
    	var stooges = _(names).zip(ages, leaders);
    	//stooges的值为（想象一下裤子的拉链）：
    	//[ [ 'moe', 30, true ]
		//, [ 'larry', 40, undefined ]
		//, [ 'curly', 50, undefined ]
		//]
    	test.equal(String(stooges), 'moe,30,true,larry,40,,curly,50,', 'zipped together arrays of different lengths');
    	test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_arrays_indexOf'
	//
	,'can_arrays_indexOf' : function(test) {
	    var numbers = [1, 2, 3];
	    test.equal(_(numbers).indexOf(2), 1, 'can compute indexOf, even without the native function');
	    
	    var result = (function(){ return _(arguments).indexOf(2); })(1, 2, 3);
	    test.equal(result, 1, 'works on an arguments object');
	    test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_arrays_lastIndexOf'
	//
	,'can_arrays_lastIndexOf' : function(test) {
	    var numbers = [1, 0, 1, 0, 0, 1, 0, 0, 0];
	    test.equal(_(numbers).lastIndexOf(1), 5, 'can compute lastIndexOf, even without the native function');
    	test.equal(_(numbers).lastIndexOf(0), 8, 'lastIndexOf the other element');
    	
    	var result = (function(){ return _(arguments).lastIndexOf(1); })(1, 0, 1, 0, 0, 1, 0, 0, 0);
    	test.equal(result, 5, 'works on an arguments object');
    	test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_arrays_range'
	//
	,'can_arrays_range' : function(test) {
	    test.equal(_(0).range().join(''), '', 'range with 0 as a first argument generates an empty array');
	    test.equal(_(4).range().join(' '), '0 1 2 3', 'range with a single positive argument generates an array of elements 0,1,2,...,n-1');
	    test.equal(_(5).range(8).join(' '), '5 6 7', 'range with two arguments a &amp; b, a&lt;b generates an array of elements a,a+1,a+2,...,b-2,b-1');
	    test.equal(_(8).range(5).join(''), '', 'range with two arguments a &amp; b, b&lt;a generates an empty array');
	    test.equal(_(3).range(10,3).join(' '), '3 6 9', 'range with three arguments a &amp; b &amp; c, c &lt; b-a, a &lt; b generates an array of elements a,a+c,a+2c,...,b - (multiplier of a) &lt; c');
	    test.equal(_(3).range(10,15).join(''), '3', 'range with three arguments a &amp; b &amp; c, c &gt; b-a, a &lt; b generates an array with a single element, equal to a');
	    test.equal(_(12).range(7,-2).join(' '), '12 10 8', 'range with three arguments a &amp; b &amp; c, a &gt; b, c &lt; 0 generates an array of elements a,a-c,a-2c and ends with the number not less than b');
	    test.equal(_(0).range(-10,-1).join(' '), '0 -1 -2 -3 -4 -5 -6 -7 -8 -9', 'final example in the Python docs');
	    test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_collections_each'
	//
	,'can_collections_each' : function(test) {
		//数组
	    _([1, 2, 3]).each(function(num, i) {
    	  test.equal(num, i + 1, 'each iterators provide value and iteration count');
    	});
    	
	    var answer = null;
    	_([1, 2, 3]).each(function(num) { 
    		if ((answer = num) == 2) _().breakLoop(); 
    	});
    	test.equal(answer, 2, 'the loop brtest.oke in the middle');
    	
	    var answers = [];
	    _([1, 2, 3]).each(function(num) { 
	    	answers.push(num * this.multiplier);
	    }, {multiplier : 5});
	    test.equal(answers.join(', '), '5, 10, 15', 'context object property accessed');
    	
		var answers = [];
		_([1, 2, 3]).forEach(function(num) { 
			answers.push(num); 
		});
		test.equal(answers.join(', '), '1, 2, 3', 'aliased as "forEach"');

	    var answer = null;
    	_([1, 2, 3]).each(function(num, index, arr) { 
    		if (_(arr).include(num)) answer = true; 
    	});
    	test.ok(answer, 'can reference the original collection from inside the iterator');
		
    	//对象
		var answers = [];
		var obj = {one : 1, two : 2, three : 3};
		obj.constructor.prototype.four = 4; //等于 Object.prototype.four = 4;
		_(obj).each(function(value, key) { 
			answers.push(key); 
		}); //看不到 four 属性！
		test.equal(answers.join(", "), 'one, two, three', 'iterating over objects works, and ignores the object prototype.');
		delete obj.constructor.prototype.four;
		
	    var answers = [];
	    _({range : 1, speed : 2, length : 3}).each(function(value,key){ 
	    	answers.push(value); 
	    });
	    test.ok(answers.join(', '), '1, 2, 3', 'can iterate over objects with numeric length properties');
	    test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_collections_map'
	//
	,'can_collections_map' : function(test) {
	    var doubled = _([1, 2, 3]).map(function(num){ 
	    	return num * 2; 
	    });
    	test.equal(doubled.join(', '), '2, 4, 6', 'doubled numbers');
		
	    var tripled = _([1, 2, 3]).map(function(num){ 
	    	return num * this.multiplier; 
	    },{multiplier : 3});
    	test.equal(tripled.join(', '), '3, 6, 9', 'tripled numbers with context');
    	test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_collections_reduce'
	//
	,'can_collections_reduce' : function(test) {
	    var sum = _([1, 2, 3]).reduce(function(sum, num){ 
	    	return sum + num; 
	    }, 1);
    	test.equal(sum, 7, 'can sum up an array');
		
	    var context = {multiplier : 3};
	    var sum = _([1, 2, 3]).reduce(function(sum, num){ 
	    	return sum + num * this.multiplier; 
	    }, 0, context);
	    test.equal(sum, 18, 'can reduce with a context object');
	    
	    var sum = _([1, 2, 3]).inject(function(sum, num){ 
	    	return sum + num; 
	    }, 0);
    	test.equal(sum, 6, 'aliased as "inject"');
    	test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_collections_all'
	//
	,'can_collections_all' : function(test) {
	    var list = _([1, 2, 3]).foldr(function(memo, num){ 
	    	return memo + num; 
	    }, '');
    	test.equal(list, '321', 'can perform right folds');
    	test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_collections_all'
	//
	,'can_collections_all' : function(test) {
	    var result = _([1, 2, 3]).all(function(num){ 
	    	return num * 2 == 4; 
	    });
    	test.equal(result, 2, 'found the first "2" and brtest.oke the loop');
    	test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_collections_all'
	//
	,'can_collections_all' : function(test) {
	    var evens = _([1, 2, 3, 4, 5, 6]).all(function(num){ 
	    	return num % 2 == 0; 
	    });
    	test.equal(evens.join(', '), '2, 4, 6', 'alled each even number');
		
	    var evens = _([1, 2, 3, 4, 5, 6]).filter(function(num){ 
	    	return num % 2 == 0; 
	    });
    	test.equal(evens.join(', '), '2, 4, 6', 'aliased as "filter"');
    	test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_collections_all'
	//
	,'can_collections_all' : function(test) {
	    var odds = _([1, 2, 3, 4, 5, 6]).all(function(num){ 
	    	return num % 2 == 0; 
	    });
    	test.equal(odds.join(', '), '1, 3, 5', 'alled each even number');
    	test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_collections_all'
	//
	,'can_collections_all' : function(test) {
	    test.ok(_([]).all(), 'the empty set');
	    test.ok(_([true, true, true]).all(), 'all true values');
	    test.ok(!_([true, false, true]).all(), 'one false value');
	    test.ok(_([0, 10, 28]).all(function(num){ 
	    	return num % 2 == 0; 
	    }), 'even numbers');
	    test.ok(!_([0, 11, 28]).all(function(num){ 
	    	return num % 2 == 0; 
	    }), 'an odd number');
	    test.ok(_([true, true, true]).every(), 'aliased as "every"');
	    test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_collections_any'
	//
	,'can_collections_any' : function(test) {
	    test.ok(!_([]).any(), 'the empty set');
	    test.ok(!_([false, false, false]).any(), 'all false values');
	    test.ok(_([false, false, true]).any(), 'one true value');
	    test.ok(!_([1, 11, 29]).any(function(num){ 
	    	return num % 2 == 0; 
	    }), 'all odd numbers');
	    test.ok(_([1, 10, 29]).any(function(num){ 
	    	return num % 2 == 0; 
	    }), 'an even number');
	    test.ok(_([false, false, true]).some(), 'aliased as "some"');
	    test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_collections_include'
	//
	,'can_collections_include' : function(test) {
	    test.ok(_([1,2,3]).include(2), 'two is in the array');
	    test.ok(!_([1,3,9]).include(2), 'two is not in the array');
	    test.ok(_({moe:1, larry:3, curly:9}).contains(3), '_.include on objects checks their values');
	    test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_collections_invoke'
	//
	,'can_collections_invoke' : function(test) {
	    var list = [[5, 1, 7], [3, 2, 1]];
	    var result = _(list).invoke('sort');
	    test.equal(result[0].join(', '), '1, 5, 7', 'first array sorted');
	    test.equal(result[1].join(', '), '1, 2, 3', 'second array sorted');
	    test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_collections_pluck'
	//
	,'can_collections_pluck' : function(test) {
	    var people = [{name : 'moe', age : 30}, {name : 'curly', age : 50}];
    	test.equal(_(people).pluck('name').join(', '), 'moe, curly', 'pulls names out of objects');
    	test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_collections_max'
	//
	,'can_collections_max' : function(test) {
	    test.equal(3, _([1, 2, 3]).max(), 'can perform a regular Math.max');

    	var neg = _([1, 2, 3]).max(function(num){ return -num; });
    	test.equal(neg, 1, 'can perform a computation-based max');
    	test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_collections_min'
	//
	,'can_collections_min' : function(test) {
	    test.equal(1, _([1, 2, 3]).min(), 'can perform a regular Math.min');

    	var neg = _([1, 2, 3]).min(function(num){ return -num; });
    	test.equal(neg, 3, 'can perform a computation-based min');
    	test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_collections_sortBy'
	//
	,'can_collections_sortBy' : function(test) {
	    var people = [{name : 'curly', age : 50}, {name : 'moe', age : 30}];
    	people = _(people).sortBy(function(person){ return person.age; });
    	test.equal(_(people).pluck('name').join(', '), 'moe, curly', 'stooges sorted by age');
    	test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_collections_sortedIndex'
	//
	,'can_collections_sortedIndex' : function(test) {
	    var numbers = [10, 20, 30, 40, 50], num = 35;
    	var index = _(numbers).sortedIndex(num);
    	test.equal(index, 3, '35 should be inserted at index 3');
    	test.finish()
	}
	//
	//node test-underscore.js --test-name 'can_collections_toArray'
	//
	,'can_collections_toArray' : function(test) {
	    test.ok(!_(arguments).isArray(), 'arguments object is not an array');
    	test.ok(_(_(arguments).toArray()).isArray(), 'arguments object converted into array');

    	var numbers = _({one : 1, two : 2, three : 3}).toArray();
    	test.equal(numbers.join(', '), '1, 2, 3', 'object flattened into array');
    	test.finish()
	}
};

//EOP
