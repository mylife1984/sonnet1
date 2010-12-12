var sqlite = require('pksqlite')
    ,flow = require('./../../../lib/flow')

module.exports.prepareData = function(db,callback) {
    flow.exec(
      function() {
          var sql = 'CREATE TABLE t_test(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)'
          db.prepareAndStep(sql,this)
          
      },function(error) {  
          if (error) throw error;
          
          var sql = 'INSERT INTO t_test (name) VALUES ("n1")'
          db.prepareAndStep(sql,this)
          
      },function(error) {  
          if (error) throw error;
          callback()
      }
   ) //flow   
}
//EOP
