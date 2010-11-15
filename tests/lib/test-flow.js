/*
 * 单元测试: lib/flow.js
 */
var flow = require('./../../lib/flow')
    ,keystore = require('./../../lib/util/keystore')
    ,async_testing = require('./../../lib/async_testing/async_testing')
    
if (module == require.main) {
  return async_testing.run(process.ARGV);
}
    
module.exports = {
	//
	//node test-flow.js --test-name 'can_flow_simple'
	//
	'can_flow_simple' : function(test) {
		flow.exec(
			function() {
				  //异步操作
				  keystore.increment("counter", 1, this); //'this' serves as a callback to the next function
			
			},function(err, newValue) {
				  //increment异步操作的callback
				  test.strictEqual(newValue, 1, "increment test didn't work");
				  test.finish()
			}
		);
	}
	//
	//node test-flow.js --test-name 'can_flow_parallel'
	//
	,'can_flow_parallel' : function(test) {
		flow.exec(
			function() {
				  //to initiate several asynchronous tasks,
				  //then wait for all of those tasks to finish before continuing to the next step in the flow
				  keystore.set("firstName", "Bob", this.MULTI());
				  keystore.set("lastName", "Vance", this.MULTI());
			
			},function(err, newValue) {
				  var db = keystore.getDb();
				  test.strictEqual(db.firstName, "Bob", "multi test didn't work");
				  test.strictEqual(db.lastName, "Vance", "multi test didn't work");
				  test.finish()
			}
		);
	}
	//
	//node test-flow.js --test-name 'can_flow_serial'
	//
	,'can_flow_serial' : function(test) {
		var valueSequence = [];
		
		flow.serialForEach([1, 2, 3, 4], 
		function(val) {
			 //a function to be called for each item in the array
			 keystore.increment("forEachCounter", val, this);
			
		},function(error, newVal) {
			 //a function that receives the callback values after each iteration
			 if (error) throw error;
			 valueSequence.push(newVal);
			
		},function() {
			 //a function that is called after the entire process is finished
			 test.deepEqual(valueSequence, [1, 3, 6, 10], "sequence of values is incorrect");
			 test.finish()
		});
	}
};

//EOP
