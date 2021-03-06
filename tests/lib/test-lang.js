/**
 * 单元测试：JS语言本身
 */
var async_testing = require('./../../lib/async_testing/async_testing')
    
if (module == require.main) {
  return async_testing.run(process.ARGV);
} 

module.exports = {
	//
	//node test-lang.js --test-name 'can_use_constructor'
	//
	'can_use_constructor' : function(test) {
		//对象实例的constructor是对象内置属性（或称元属性）之一，它的值总是指向创建当前对象的构造函数。
		var arr = [1, 56, 34, 12];
		test.ok(arr.constructor === Array);
		test.equal(typeof arr.constructor,"function")  
		
		var Foo = function() { };  
		test.ok(Foo.constructor === Function);  
		test.equal(typeof Foo.constructor,"function")  

		function Foo() { };  
		test.ok(Foo.constructor === Function);  
		test.equal(typeof Foo.constructor,"function")  
		
		var obj = new Foo();  
		test.ok(obj.constructor === Foo);		
		test.equal(typeof obj.constructor,"function")  
		
		var blankObj = {} //相当于 new Object()
		test.ok(blankObj.constructor === Object);		
		test.equal(typeof blankObj.constructor,"function")  
		
		function Person(name) {  
		    this.name = name;  
		};  
		Person.prototype.getName = function() {  
		    return this.name;  
		};  //向原型对象添加方法
		var p = new Person("ZhangSan");  
		test.ok(Person.prototype.constructor === Person,"每个函数的prototype的constructor默认指向这个函数");
		test.ok(p.constructor === Person,"因为有了上一条，才有这一条!");
		
		Person.prototype = {  
		    getName: function() {  
		        return this.name;  
		    }  
		}; //重新创建了一个新的原型对象（相当于 new Object...)
		var p = new Person("ZhangSan");  
		test.ok(Person.prototype.constructor !== Person);
		test.ok(Person.prototype.constructor === Object);
		test.ok(p.constructor === Object,"constructor也会像一般属性一样查找到原型对象的constructor");
		test.finish()
	}
	//
	//node test-lang.js --test-name 'can_use_function'
	//
	//Thanks: http://www.permadi.com/tutorial/jsFunc/index.html
	,'can_use_function' : function(test) {
		//在许多其他语言中，函数都只是语法特性，它们可以被定义、被调用，但却不是数据类型。
		//JS中，函数是一个真正的数据类型。
		var addVar = function(a, b) {  return a+b; }
		test.equal(addVar(1,2),3,"函数申明方法之一")
		test.equal(typeof addVar,"function")  
		test.ok(addVar instanceof Function);		
		
		function addObject(a, b) { return a+b;}                     
		test.equal(addObject(1,2),3,"函数申明方法之二")
		test.equal(typeof addObject,"function")
		test.ok(addObject instanceof Function);
		
		var addFunction = new Function("a", "b", "return a+b;");
		test.equal(addFunction(1,2),3,"函数申明方法之三") 
		
		function createMyFunction(myOperator) {
		  return new Function("a", "b", "return a" + myOperator + "b;");
		} //注意：函数体不会被预先编译
		var add = createMyFunction("+");                // creates "add" function
		var subtract = createMyFunction("-");           // creates "subtract" function
		var multiply = createMyFunction("*");           // created "multiply" function
		test.equal(add(10,2),12);   
		test.equal(subtract(10,2),8);
		test.equal(multiply(10,2),20); 
		
		function Ball() { }
		Ball.callsign="The Ball";
		test.equal(Ball.callsign,"The Ball","Ball是对象，可是向对象添加属性")
		
		function myFunction() { 
  			return myFunction.message;
		}
		myFunction.message="old";	
		test.equal(myFunction(),"old","函数体对可以引用自身对象中的属性")
		
		function Ball() {}
		var ball0 = new Ball(); // new操作符创建类型为Object的对象，然后执行Ball()。
		test.equal(typeof ball0,"object","函数作为构造函数创建新的对象");
		test.ok(ball0 instanceof Ball);   //Ball 是 ball0 对象的类型
		test.ok(ball0 instanceof Object); //Object 也是 ball0 对象的类型		
		test.ok(ball0.constructor === Ball);		
		
		function Ball(specifiedName) {
		  this.name = specifiedName;          //this 指向被创建的对象      
		}
		var ball0 = new Ball("Soccer Ball");  
		test.equal(ball0.name,"Soccer Ball")		
		test.finish()
	}
	//
	//node test-lang.js --test-name 'can_use_prototype'
	//
	//Thanks: 《JavaScript王者归来》p523起
	,'can_use_prototype' : function(test) {
		//“照猫画虎”: 猫是原型(prototype)，而虎是类型，也就是“虎.prototype= new 猫()”！
		//
		//描述自然界事物之间的“归类”关系，可以使用“继承”、“接口”和“原型”三种方法：
		//（1）“继承”描述的事物之间固有的衍生关系；
		//（2）“接口”描述的是事物功用方面的功用特征；
		//（3）“原型”则倾向于描述事物之间的“相似性”。
		//
		//JS要求每个具体的JavaScript类型有且仅有一个原型(prototype)，默认情况下，该原型就是一个Object对象。
		//
		//JS为每一个类型(Type)都提供了一个prototype属性（内置属性），将这个属性指向一个对象，这个对象就成为了
		//这个类型的“原型”，这意味着由这个类型所创建的所有对象都具有这个原型的特性。
		//
		function Point(x,y) {
			this.x = x
			this.y = y
		}
		var p1 = new Point(1,2),p2 = new Point(3,4)
		Point.prototype.z = 0 //动态为Point的原型添加了属性
		test.equal(p1.z,0)
		test.equal(p1.z,0)
		
		test.ok(p1.prototype==undefined,"The prototype of an object is an internal property")
		
		//
		//尽量采用 prototype 定义对象方法，可以避免在构造函数中构造方法的额外开销。
		//
		function Employee(name, salary) {
  			this.name=name;                
  			this.salary=salary;
		}
		Employee.prototype.getSalary=function getSalaryFunction()	{
  			return this.salary;
		}
		var boss1=new Employee("Joan", 200000);
		test.equal(boss1.getSalary(),200000)	
		test.finish()
	}
	//
	//node test-lang.js --test-name 'can_use_instanceof'
	//
	//Thanks: http://blog.csdn.net/xujiaxuliang/archive/2009/10/22/4713004.aspx
	//Thanks: http://joost.zeekat.nl/constructors-considered-mildly-confusing.html
	,'can_use_instanceof' : function(test) {
		//每个对象都会有一个内部的属性_proto_(虚拟机内部使用), 
		//每当创建一个对象的时候，这个对象的_proto_就会被赋值为这个对象的构造函数的prototype.
		//一旦对象创建完成，_proto_属性就不会改变。
		//
		//o instanceof c 时，虚拟机会把c.prototype和o的_proto_链上的节点逐个进行比较，
		//如果找到相等的节点，则返回true，否则返回false。
		//
		
		function MyConstructor() {}
 		MyConstructor.prototype = {};
 		var myobject = new MyConstructor(); //_proto_ 等于 {}
 		
   		test.ok(MyConstructor.constructor === Function)
 		test.ok(myobject instanceof MyConstructor) // MyConstructor.prototype 等于 myobject 的 _proto_, 所以返回真。
   		test.ok(myobject.constructor === Object) //注意不是 MyConstructor!
		
		function MyConstructor() {}
 		var myobject = new MyConstructor(); //_proto_ 等于 {} （空对象）
 		MyConstructor.prototype = {}; //创建了一个新的空对象
 		
 		test.ok(!(myobject instanceof MyConstructor)) //为何是false? 因为 MyConstructor.prototype 
												   		 //不等于 myobject 的 _proto_(虽然都是空对象）
   		test.ok(myobject.constructor == Object)
   		
		function Class1(){ };   
		function Class2(){ };   
		Class2.prototype = new Class1();   
		var obj1 = new Class2();   
		Class2.prototype = new Class1(); //创建了一个新的对象   
		var obj2 = new Class2();   
		test.ok(!(obj1 instanceof Class2)); //为何是false？原因与上面相同。   
		test.ok(obj2 instanceof Class2);     
		test.finish()
	}
	//
	//node test-lang.js --test-name 'can_functional_programming'
	//
	//Thanks: http://www.jzxue.com/wangzhankaifa/javascript-ajax/201006/28-3996.html
	,'can_functional_programming' : function(test) {
		//1.匿名函数
		function map(array, func){ 
		 	 var res = []; 
		  	 for ( var i = 0, len = array.length; i < len; i++){ 
		 		res.push(func(array[i])); 
		  	 } 
		 	 return res; 
		} 
		var mapped = map([1, 3, 5, 7, 8],  function (n){
			  return n = n + 1; 
		});  
		test.equal(mapped.join(","),"2,4,6,8,9","对数组中每一个元素加 1")
		
		//2.柯里化(currying)
		//柯里化是把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，
		//并且返回接受余下的参数而且返回结果的新函数的技术。
		function adder(num){ 
			  return function (x){ 
		  			return num + x; 
			  } 
		} 
		var add5 = adder(5); 
		var add6 = adder(6);
		test.equal(add5(1),6)
		test.equal(add6(1),7)
		
		//下面的抛物线的例子，更能说明柯里化如何使函数定义方式同数学语言描述方式的一致性
		//如果不用柯里化编程方式，也可实现同样的功能，但显然无法达到同样的效果！
		function parabola(a,b,c) {
			return function(x) {
				return a*x*x+b*x+c
			}
		}
  		var p1 = parabola(2,3,4)
  		test.equal(p1(15),499,"已知抛物线公式，代入变量x，得到结果")
  		test.finish()
	}
	//
	//node test-lang.js --test-name 'can_use_arguments'
	//
	,'can_use_arguments' : function(test) {
		function format(string) {
			var args = arguments; //为了让replace的闭包中访问arguments，所以要先保存到一个局部变量中 			
			//arguments是一个对象, 例如：
			//{ '0': 'And the %1 want to know whose %2 you %3'
			//, '1': 'papers'
			//, '2': 'shirt'
			//, '3': 'wear'
			//}
			//
			var pattern = new RegExp("%([1-" + arguments.length + "])", "g");
			return string.replace(pattern, function(match, index) {
		    	return args[index]; //属性名为数字，所以能获得正确的值
		  	});
		};
		var str = format("And the %1 want to know whose %2 you %3", "papers", "shirt", "wear");
		test.equal(str,"And the papers want to know whose shirt you wear")
		test.finish()
	}
	//
	//node test-lang.js --test-name 'can_use_array'
	//
	,'can_use_array' : function(test) {
		test.finish()
	}
}
//EOP
