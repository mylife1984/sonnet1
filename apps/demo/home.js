/**
 * home
 */
exports.showIndex = function(req, res){ 
    res.render('demo/index.ejs', {
        locals: {
            title: 'My Express'
        }
    });
}

//EOP