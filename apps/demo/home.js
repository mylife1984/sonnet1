/**
 * home
 */
exports.get = function(req, res){ 
    res.render('demo/index.ejs', {
        locals: {
            title: 'My Express'
        }
    });
}

//EOP