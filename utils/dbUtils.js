var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient,
    ObjectID = mongodb.ObjectID,
    Q = require('q');

exports.getUser = function(id) {
    var db;
    return Q.nfcall(MongoClient.connect, 'mongodb://127.0.0.1:27017/maze-db')
        .then(function(database) {
            db = database;
            var users = db.collection('users');
            console.log('searching for user: ' + id);
            return Q.npost(users, 'findOne', [ObjectID(id)]);
        })
        .then(function(user) {
            db.close();
            return user;
        })
        .catch(function(error) {
            return {
                err: error
            };
        });
}
