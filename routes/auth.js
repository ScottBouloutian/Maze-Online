var MongoClient = require('mongodb').MongoClient,
    Q = require('q');

exports.login = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var db;
    Q.nfcall(MongoClient.connect, 'mongodb://127.0.0.1:27017/maze-db')
        .then(function(database) {
            db = database;
            var users = db.collection('users');
            return Q.npost(users, 'findOne', [{
                username: username,
                password: password
            }]);
        })
        .then(function(user) {
            db.close();
            if (user) {
                formatUserDocument(user);
                console.log('A user logged in:');
                console.log(user);
                req.session.user = user;
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
    delete req.session.user;
    res.redirect('/');
}

function formatUserDocument(user) {
    delete user._id;
    delete user.password;
    if(!user.position) {
        user.position = {
            chunk: 999000,
            x: 1,
            y: 0
        };
    }
}
