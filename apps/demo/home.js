/**
 * home
 */
exports.get = function(req, res){ 
    res.render('demo/index.jade', {
        locals: {
            title: 'My Express'
        }
    });
}

//EOP