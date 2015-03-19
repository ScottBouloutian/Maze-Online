var MongoClient = require('mongodb').MongoClient,
    Q = require('q');

exports.login = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    Q.nfcall(MongoClient.connect, 'mongodb://127.0.0.1:27017/maze-db')
        .then(function(db) {
            var users = db.collection('users');
            return Q.npost(users, 'findOne', [{
                username: username,
                password: password
            }]);
        })
        .then(function(user) {
            if (user) {
                req.session.user_id = username;
                res.redirect('/');
            } else {
                res.json({
                    err: 'no user found'
                });
            }
        })
        .catch(function(error) {
            res.json({
                err: error
            });
        });
};

exports.logout = function(req, res) {
    delete req.session.user_id;
    res.redirect('/');
}
