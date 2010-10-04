/**
 * home
 */
exports.get = function(req, res){ 
    res.render('index.jade', {
        locals: {
            title: 'My Express'
        }
    });
}

//EOP