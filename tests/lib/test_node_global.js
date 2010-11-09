/*
 * 单元测试: 理解 node.js 的“Global Objects”
 */
    
module.exports = {
	//
	//expresso * -o 'can_use_node_global_1'
	//
	'can_use_node_global_1' : function(assert) {
		baseFoo = "foo";
		global.baseBar = "bar";

		assert.equal("foo", global.baseFoo, "全局变量应自动收集到 global 对象中");
		assert.equal("bar", baseBar, "global.x 自动作为全局变量使用");
	}
	//
	//expresso * -o 'can_use_node_global_2'
	//
	,'can_use_node_global_2' : function(assert) {
		var module = require("./fixtures/global/plain"),
  			fooBar = module.fooBar;

		//模块中可以定义全局变量，并放到局部对象中	
		assert.equal("foo", fooBar.foo);
		assert.equal("bar", fooBar.bar);
	}
	//
	//expresso * -o 'can_use_node_global_3'
	//
	,'can_use_node_global_3' : function(assert) {
		require("./fixtures/global/plain")

		//模块中可以定义全局变量，并按全局方式使用	
		assert.equal("foo", foo);
		assert.equal("bar", bar);
	}
}
//EOP
