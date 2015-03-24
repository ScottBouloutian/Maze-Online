function World(){
    this.players = [];
};
World.prototype = {
    addUser: function(user) {
        var userExists = false;
        for(var i=0;i<this.players.length && !userExists;i++) {
            if(this.players[i].username === user.username) {
                userExists = true;
            }
        }
        if(!userExists) {
            this.players.push(user);
            console.log("The current users are:");
            console.log(this.players);
        }
    },
    removeUser: function(user) {
        var self = this;
        this.players.forEach(function(player, i) {
            if (player.username === user.username) {
                self.players.splice(i, 1);
                return;
            }
        });
    },
    updatePosition: function(user, position) {
        user.position = position;
    },
    visiblePlayers: function(user) {
        return this.players.filter(function(player) {
            return player.position.chunk === user.position.chunk && player.username!=user.username;
        });
    },
    printUsers: function() {
        console.log(this.players);
    }
};

module.exports = World;
