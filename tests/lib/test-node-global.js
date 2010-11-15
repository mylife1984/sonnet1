/*
 * 单元测试: 理解 node.js 的“Global Objects”
 */
var async_testing = require('./../../lib/async_testing/async_testing')
    
if (module == require.main) {
  return async_testing.run(process.ARGV);
} 
    
module.exports = {
	//
	//node test-node-global.js --test-name 'can_use_node_global_1'
	//
	'can_use_node_global_1' : function(test) {
		baseFoo = "foo";
		global.baseBar = "bar";

		test.equal("foo", global.baseFoo, "全局变量应自动收集到 global 对象中");
		test.equal("bar", baseBar, "global.x 自动作为全局变量使用");
		
		test.finish()
	}
	//
	//node test-node-global.js --test-name 'can_use_node_global_2'
	//
	,'can_use_node_global_2' : function(test) {
		var module = require("./fixtures/global/plain"),
  			fooBar = module.fooBar;

		//模块中可以定义全局变量，并放到局部对象中	
		test.equal("foo", fooBar.foo);
		test.equal("bar", fooBar.bar);
		
		test.finish()
	}
	//
	//node test-node-global.js --test-name 'can_use_node_global_3'
	//
	,'can_use_node_global_3' : function(test) {
		require("./fixtures/global/plain")

		//模块中可以定义全局变量，并按全局方式使用	
		test.equal("foo", foo);
		test.equal("bar", bar);
		
		test.finish()
	}
}
//EOP
