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

//EOP