/**
 * 测试 pksqlite 具备的功能
 */
var flow = require('./../../lib/flow')
    ,async_testing = require('./../../lib/async_testing')

if (module == require.main) {
  return async_testing.run(process.ARGV);
}
  
module.exports = {
  /**
   * node test-sqlite.js --test-name "can select"
   */
   'can select' : function(test) {
  	 	  var db = test.db,_stmt
        flow.exec(
          function() {
              var sql = 'SELECT name FROM t_test';
              db.prepare(sql,this)
              
          },function(error, stmt) {   
          	  _stmt = stmt
              if (error) throw error;
              stmt.fetchAll(this)
              
          },function (error, rows) {    
              if (error) throw error;
          	  test.equal(rows.length,1)
          	  test.equal(rows[0].name,"n1")
          	  
              _stmt.finalize(this)
              
          }, function(error) {
              if (error) throw error;
              test.finish()
          }    
        ) //flow
     } //function   
    /**
     * node test-sqlite.js --test-name "can count"
     */
     ,'can count' : function(test) {
        var db = test.db,_stmt
        flow.exec(
          function() {
              var sql = 'SELECT COUNT(*) AS count FROM t_test';
              db.prepare(sql,this)
              
          },function(error, stmt) {   
              _stmt = stmt
              if (error) throw error;
              stmt.fetchAll(this)
              
          },function (error, rows) {    
              if (error) throw error;
              test.equal(rows.length,1)
              
              _stmt.finalize(this)
              
          }, function(error) {
              if (error) throw error;
              test.finish()
          }
        ) //flow  
     }
    //
    //node test-sqlite.js --test-name "can select using bind"
    //
    ,'can select using bind' : function(test) {
          var db = test.db,_stmt;
          flow.exec(
            function() {
                var sql = 'SELECT name FROM t_test WHERE name = ?';
                db.prepare(sql,this)
                
            },function(error, stmt) {   
                _stmt = stmt
                if (error) throw error;
                stmt.bindArray(["n1"],this)
                
            },function (error) {    
                if (error) throw error;
                _stmt.fetchAll(this)
                
            },function (error, rows) {    
                if (error) throw error;
                //console.log(rows.length)
                test.equal(rows.length,1)
                
                _stmt.finalize(this)
                
            }, function(error) {
                if (error) throw error;
                test.finish()
            }
          ) //flow  
    }     
    //
    //node test-sqlite.js --test-name "can insert"
    //
    ,'can insert' : function(test) {
    	    var db = test.db,_stmt;
          var testInserted = function() {
              var _stmt;
              flow.exec(
                function() {
                    var sql = 'SELECT name FROM t_test ORDER BY id DESC';
                    db.prepare(sql,this)
                    
                },function(error, stmt) {   
                    _stmt = stmt
                    if (error) throw error;
                    stmt.fetchAll(this)
                    
                },function (error, rows) {    
                    if (error) throw error;
                    test.equal(rows.length,2)
                    test.deepEqual(rows,[{name:'n2'},{name:'n1'}])
                    
                    _stmt.finalize(this)
                    
                }, function(error) {
                    if (error) throw error;
                    test.finish()
                }
              ) //flow  
          } //testInserted
          flow.exec(
            function() {
                var sql =  'INSERT INTO t_test (name) VALUES ("n2")'
                var option = {affectedRows: true, lastInsertRowID: true }
                db.prepare(sql,option,this)
                
            },function(error, stmt) {  
                if (error) throw error;
                
                stmt.step(function (error, row) {    
                    if (error) throw error;
                    //console.log(this.lastInsertRowID)
                    test.ok(this.lastInsertRowID);
                    test.equal(this.affectedRows, 1);
                    
                    testInserted()                    
                }) // 注意：只能在 callback 的上下文对象(this)中才能取得 lastInsertRowID
            }
          ) //flow  
    }   
    //
    //node test-sqlite.js --test-name "can update"
    //
    ,'can update' : function(test) {
    	    var db = test.db,_stmt;
          var testUpdated = function() {
              var _stmt;
              flow.exec(
                function() {
                    var sql = 'SELECT name FROM t_test';
                    db.prepare(sql,this)
                    
                },function(error, stmt) {   
                    _stmt = stmt
                    if (error) throw error;
                    stmt.fetchAll(this)
                    
                },function (error, rows) {    
                    if (error) throw error;
                    test.equal(rows.length,1)
                    test.deepEqual(rows,[{name:'n2'}])
                    
                    _stmt.finalize(this)
                    
                }, function(error) {
                    if (error) throw error;
                    test.finish()
                }
              ) //flow  
          } //testUpdated
          flow.exec(
            function() {
                var sql =  'UPDATE t_test SET name = "n2"'
                db.prepare(sql,this)
                
            },function(error, stmt) {  
                if (error) throw error;
                
                stmt.step(function (error, row) {    
                    if (error) throw error;
                    
                    testUpdated()
                }) 
            }
          ) //flow  
    }
    //
    //node test-sqlite.js --test-name "can delete"
    //
    ,'can delete' : function(test) {
    	    var db = test.db,_stmt;
          var testDeleted = function() {
              var _stmt;
              flow.exec(
                function() {
                    var sql = 'SELECT name FROM t_test';
                    db.prepare(sql,this)
                    
                },function(error, stmt) {   
                    _stmt = stmt
                    if (error) throw error;
                    stmt.fetchAll(this)
                    
                },function (error, rows) {    
                    if (error) throw error;
                    test.equal(rows.length,0)
                    
                    _stmt.finalize(this)
                    
                }, function(error) {
                    if (error) throw error;
                    test.finish()
                }
              ) //flow  
          } //testDeleted
          flow.exec(
            function() {
                var sql =  'DELETE FROM t_test'
                db.prepare(sql,this)  //不能使用 prepareAndStep?
                
            },function(error, stmt) {  
                if (error) throw error;
                
                stmt.step(function (error, row) {    
                    if (error) throw error;
                    testDeleted()
                }) 
            }
          ) //flow  
    } 
     
};
  
var config = require('./../test_helper').sqlite
config.suite = module.exports
async_testing.wrap(config)

//EOP

