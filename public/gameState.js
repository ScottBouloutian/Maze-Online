// Describes a game state object
function GameState(chunkIndex) {
    this.chunkIndex = chunkIndex;
    this.player = {
        x: 1,
        y: 0
    };
    // An array of other players currently in this chunk
    this.visiblePlayers = [];
}
GameState.prototype = {

    queryMazeServer: function(callback) {
        var self = this;
        queryChunk(this.chunkIndex, function(chunk) {
            self.chunk = chunk;
            self.width = 8*2+1;
            self.height = (8 + self.chunk.offsetY) * 2 + 1;
            self.state = new Array(self.width * self.height);
            self.clearState();
            callback();
        });
    },

    // Clear the state array
    clearState: function() {
        for (var i = 0; i < this.state.length; i++) {
            this.state[i] = CellType.WALL;
        }
    },

    getCell: function(x, y) {
        return this.state[y * this.height + x];
    },

    setCell: function(x, y, type) {
        this.state[y * this.height + x] = type;
    },

    // Moves the player if possible. The callback is called if the player's position has changed.
    move: function(direction, callback) {
        switch (direction) {
            case Direction.LEFT:
                if (this.player.x == 0) {
                    this.chunkIndex--;
                    this.player.x = 16;
                    this.queryMazeServer(function() {
                        callback(true);
                    });
                } else if (this.getCell(this.player.x - 1, this.player.y) === CellType.EMPTY) {
                    this.player.x--;
                    callback(false);
                }
                break;
            case Direction.RIGHT:
                if (this.player.x == 16) {
                    this.chunkIndex++;
                    this.player.x = 0;
                    this.queryMazeServer(function() {
                        callback(true);
                    });
                } else if (this.getCell(this.player.x + 1, this.player.y) === CellType.EMPTY) {
                    this.player.x++;
                    callback(false);
                }
                break;
            case Direction.UP:
                if (this.getCell(this.player.x, this.player.y - 1) === CellType.EMPTY) {
                    this.player.y--;
                    callback(false);
                }
                break;
            case Direction.DOWN:
                if (this.getCell(this.player.x, this.player.y + 1) === CellType.EMPTY) {
                    this.player.y++;
                    callback(false);
                }
                break;
        }
    }

}

function queryChunk(chunkIndex, callback) {
    var client = new HttpClient();
    client.get('/api/maze/chunk?chunk=' + chunkIndex, function(res) {
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
