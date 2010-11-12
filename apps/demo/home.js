/**
 * home
 */
var rest = require('restler')
    ,settings = require('settings')

//显示主页 
exports.showIndex = function(req, res){
    res.render('demo/index.html', {
        locals: {
            title: 'My Express'
        }
    });
}

//返回json数据
exports.getJsonData = function(req,res) {
    res.send({success:true,rows:0})
}

//通过restler从其他系统获取json数据
exports.getRemoteJsonData = function(req,res) {
  rest.get(settings.BACKEND_URL+'/json').addListener('complete', function(data) {
      res.send(data);
  });  
}

//EOP