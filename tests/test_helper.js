var sqlite = require('pksqlite')
    ,async_testing = require('./../lib/async_testing')
    ,wrap = async_testing.wrap
    ,fixture_sqlite = require('./lib/fixtures/sqlite')
    ,settings = require('./../settings')

var db

/**
 * 为 test-sqlite.js 准备测试数据
 */
module.exports.sqlite = { 
      setup: function(test, done) {
          //console.log("top setup")
          var prepareData = function(test,done) {
              test.db = db
              
              db.prepareAndStep("BEGIN;",function(error){
                  if (error) throw error;
                  fixture_sqlite.prepareData(db,function() {
                      done();
                  })    
              })
          }
          if(!db) {
              db = new sqlite.Database();
              db.open(settings.DATABASES.test.NAME, function(error) {
                  if (error) throw error;
                  prepareData(test,done)
              })
          } else {
              prepareData(test,done)
          }
        }
      , teardown: function(test, done) {
          //console.log("top teardown")
          test.db.prepareAndStep("ROLLBACK;",function(error){
              if (error) throw error;
          })
          done();
        }
}

//EOP
