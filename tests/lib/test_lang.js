/**
 * 单元测试：JS语言本身
 */
module.exports = {
	//
	//expresso * -o 'can_use_constructor'
	//
	'can_use_constructor' : function(assert) {
		//对象实例的constructor是对象内置属性（或称元属性）之一，它的值总是指向创建当前对象的构造函数。
		var arr = [1, 56, 34, 12];
		assert.ok(arr.constructor === Array);
		assert.equal(typeof arr.constructor,"function")  
		
		var Foo = function() { };  
		assert.ok(Foo.constructor === Function);  
		assert.equal(typeof Foo.constructor,"function")  

		function Foo() { };  
		assert.ok(Foo.constructor === Function);  
		assert.equal(typeof Foo.constructor,"function")  
		
		var obj = new Foo();  
		assert.ok(obj.constructor === Foo);		
		assert.equal(typeof obj.constructor,"function")  
		
		var blankObj = {} //相当于 new Object()
		assert.ok(blankObj.constructor === Object);		
		assert.equal(typeof blankObj.constructor,"function")  
		
		function Person(name) {  
		    this.name = name;  
		};  
		Person.prototype.getName = function() {  
		    return this.name;  
		};  //向原型对象添加方法
		var p = new Person("ZhangSan");  
		assert.ok(Person.prototype.constructor === Person,"每个函数的prototype的constructor默认指向这个函数");
		assert.ok(p.constructor === Person,"因为有了上一条，才有这一条!");
		
		Person.prototype = {  
		    getName: function() {  
		        return this.name;  
		    }  
		}; //重新创建了一个新的原型对象（相当于 new Object...)
		var p = new Person("ZhangSan");  
		assert.ok(Person.prototype.constructor !== Person);
		assert.ok(Person.prototype.constructor === Object);
		assert.ok(p.constructor === Object,"constructor也会像一般属性一样查找到原型对象的constructor");
	}
	//
	//expresso * -o 'can_use_function'
	//
	//Thanks: http://www.permadi.com/tutorial/jsFunc/index.html
	,'can_use_function' : function(assert) {
		//在许多其他语言中，函数都只是语法特性，它们可以被定义、被调用，但却不是数据类型。
		//JS中，函数是一个真正的数据类型。
		var addVar = function(a, b) {  return a+b; }
		assert.equal(addVar(1,2),3,"函数申明方法之一")
		assert.equal(typeof addVar,"function")  
		assert.ok(addVar instanceof Function);		
		
		function addObject(a, b) { return a+b;}                     
		assert.equal(addObject(1,2),3,"函数申明方法之二")
		assert.equal(typeof addObject,"function")
		assert.ok(addObject instanceof Function);
		
		var addFunction = new Function("a", "b", "return a+b;");
		assert.equal(addFunction(1,2),3,"函数申明方法之三") 
		
		function createMyFunction(myOperator) {
		  return new Function("a", "b", "return a" + myOperator + "b;");
		} //注意：函数体不会被预先编译
		var add = createMyFunction("+");                // creates "add" function
		var subtract = createMyFunction("-");           // creates "subtract" function
		var multiply = createMyFunction("*");           // created "multiply" function
		assert.equal(add(10,2),12);   
		assert.equal(subtract(10,2),8);
		assert.equal(multiply(10,2),20); 
		
		function Ball() { }
		Ball.callsign="The Ball";
		assert.equal(Ball.callsign,"The Ball","Ball是对象，可是向对象添加属性")
		
		function myFunction() { 
  			return myFunction.message;
		}
		myFunction.message="old";	
		assert.equal(myFunction(),"old","函数体对可以引用自身对象中的属性")
		
		function Ball() {}
		var ball0 = new Ball(); // new操作符创建类型为Object的对象，然后执行Ball()。
		assert.equal(typeof ball0,"object","函数作为构造函数创建新的对象");
		assert.ok(ball0 instanceof Ball);   //Ball 是 ball0 对象的类型
		assert.ok(ball0 instanceof Object); //Object 也是 ball0 对象的类型		
		assert.ok(ball0.constructor === Ball);		
		
		function Ball(specifiedName) {
		  this.name = specifiedName;          //this 指向被创建的对象      
		}
		var ball0 = new Ball("Soccer Ball");  
		assert.equal(ball0.name,"Soccer Ball")		
	}
	//
	//expresso * -o 'can_use_prototype'
	//
	//Thanks: 《JavaScript王者归来》p523起
	,'can_use_prototype' : function(assert) {
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
		assert.equal(p1.z,0)
		assert.equal(p1.z,0)
		
		assert.ok(p1.prototype==undefined,"The prototype of an object is an internal property")
		
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
		assert.equal(boss1.getSalary(),200000)		
	}
	//
	//expresso * -o 'can_use_instanceof'
	//
	//Thanks: http://blog.csdn.net/xujiaxuliang/archive/2009/10/22/4713004.aspx
	//Thanks: http://joost.zeekat.nl/constructors-considered-mildly-confusing.html
	,'can_use_instanceof' : function(assert) {
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
 		
   		assert.ok(MyConstructor.constructor === Function)
 		assert.ok(myobject instanceof MyConstructor) // MyConstructor.prototype 等于 myobject 的 _proto_, 所以返回真。
   		assert.ok(myobject.constructor === Object) //注意不是 MyConstructor!
		
		function MyConstructor() {}
 		var myobject = new MyConstructor(); //_proto_ 等于 {} （空对象）
 		MyConstructor.prototype = {}; //创建了一个新的空对象
 		
 		assert.ok(!(myobject instanceof MyConstructor)) //为何是false? 因为 MyConstructor.prototype 
												   		 //不等于 myobject 的 _proto_(虽然都是空对象）
   		assert.ok(myobject.constructor == Object)
   		
		function Class1(){ };   
		function Class2(){ };   
		Class2.prototype = new Class1();   
		var obj1 = new Class2();   
		Class2.prototype = new Class1(); //创建了一个新的对象   
		var obj2 = new Class2();   
		asserk.ok(!(obj1 instanceof Class2)); //为何是false？原因与上面相同。   
		asserk.ok(obj2 instanceof Class2);     		
	}
}
//EOP
