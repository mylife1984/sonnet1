/**
 * home
 */
exports.showIndex = function(req, res){
    res.render('demo/index.html', {
        locals: {
            title: 'My Express'
        }
    });
}

exports.getJsonData = function(req,res) {
    res.send({success:true})
}

//EOP