exports.maze = function(req, res) {
    res.render('maze.ejs', {
        user: req.session.user
    });
};
