// Describes a game state object
function GameState(chunkIndex) {
    this.chunkIndex = chunkIndex;
    this.player = {
        x: 1,
        y: 0
    }
}
GameState.prototype = {

    queryMazeServer: function(callback) {
        var self = this;
        queryChunk(this.chunkIndex, function(chunk) {
            self.chunk = chunk;
            self.state = new Array(chunk.width * chunk.height);
            self.clearState();
            callback();
        });
    },

    getWidth: function() {
        return this.chunk.width;
    },

    getHeight: function() {
        return this.chunk.height;
    },

    // Clear the state array
    clearState: function() {
        for (var i = 0; i < this.state.length; i++) {
            this.state[i] = CellType.WALL;
        }
    },

    getCell: function(x, y) {
        return this.state[y * 17 + x];
    },

    setCell: function(x, y, type) {
        this.state[y * 17 + x] = type;
    },

    move: function(direction, callback) {
        switch (direction) {
            case Direction.LEFT:
                if (this.player.x == 0) {
                    this.chunkIndex--;
                    this.player.x = 16;
                    this.queryMazeServer(function() {
                        callback();
                    });
                } else if (this.getCell(this.player.x - 1, this.player.y) === CellType.EMPTY) {
                    this.player.x--;
                    callback();
                }
                break;
            case Direction.RIGHT:
                if (this.player.x == 16) {
                    this.chunkIndex++;
                    this.player.x = 0;
                    this.queryMazeServer(function() {
                        callback();
                    });
                } else if (this.getCell(this.player.x + 1, this.player.y) === CellType.EMPTY) {
                    this.player.x++;
                    callback();
                }
                break;
            case Direction.UP:
                if (this.getCell(this.player.x, this.player.y - 1) === CellType.EMPTY) {
                    this.player.y--;
                    callback();
                }
                break;
            case Direction.DOWN:
                if (this.getCell(this.player.x, this.player.y + 1) === CellType.EMPTY) {
                    this.player.y++;
                    callback();
                }
                break;
        }
    },

    debug: function() {
        console.log('there are ' + this.state.length + ' elements in state');
        this.state.forEach(function(type) {
            console.log(type);
        });
    },


}

function queryChunk(chunkIndex, callback) {
    var client = new HttpClient();
    client.get('http://localhost:3000/api/maze/chunk?chunk=' + chunkIndex, function(res) {
        var chunk = JSON.parse(res);
        callback(chunk);
    });
}

function HttpClient() {
    this.get = function(aUrl, aCallback) {
        anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }
        anHttpRequest.open("GET", aUrl, true);
        anHttpRequest.send(null);
    }
}
