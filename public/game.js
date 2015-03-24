// The cell type describes what can be located in a given cell.
var CellType = {
    EMPTY: 0,
    WALL: 1,
    PLAYER: 2,
};

// The directions in which the player can travel
var Direction = {
    LEFT: 0,
    RIGHT: 1,
    UP: 2,
    DOWN: 3
};

var tile = {
    width: 24,
    height: 24
};

var startChunk = 999000;

var playerEntity;
var networkedPlayerEntities = [];
var mazeEntities = [];

// Define the Game object
var Game = {

    // Initialize and start our game
    start: function(socket) {
        // Initialize the game state
        console.log('[client] starting the game');
        Game.state = new GameState(startChunk);
        Game.state.queryMazeServer(function() {
            // Start crafty and set a background color so that we can see it's working
            Crafty.init(Game.width(), Game.height());
            Crafty.background('rgb(0, 0, 0)');
            // Draw the game state
            drawMaze();
            drawPlayer(Game.state.player.x, Game.state.player.y);
        });
        // Allow keyboard input
        Crafty.e('Keyboard').bind('KeyDown', function(e) {
            if (e.key == Crafty.keys.LEFT_ARROW) {
                Game.state.move(Direction.LEFT, function(newChunk) {
                    if(newChunk) {
                        drawMaze();
                    }
                    drawPlayer(Game.state.player.x, Game.state.player.y);
                    emitMoveSignal();
                });
            } else if (e.key == Crafty.keys.RIGHT_ARROW) {
                Game.state.move(Direction.RIGHT, function(newChunk) {
                    if(newChunk) {
                        drawMaze();
                        drawPlayer(Game.state.player.x, Game.state.player.y);
                    }
                    drawPlayer(Game.state.player.x, Game.state.player.y);
                    emitMoveSignal();
                });
            } else if (e.key == Crafty.keys.UP_ARROW) {
                Game.state.move(Direction.UP, function(newChunk) {
                    if(newChunk) {
                        drawMaze
                    }
                    drawPlayer(Game.state.player.x, Game.state.player.y);
                    emitMoveSignal();
                });
            } else if (e.key == Crafty.keys.DOWN_ARROW) {
                Game.state.move(Direction.DOWN, function(newChunk) {
                    if(newChunk) {
                        destroyMazeEntities();
                    }
                    drawPlayer(Game.state.player.x, Game.state.player.y);
                    emitMoveSignal();
                });
            }
        });
    },

    drawNetworkedPlayers: function() {
        networkedPlayerEntities.forEach(function(e) {
            e.destroy();
        });
        networkedPlayerEntities = [];
        // Draw networked players
        Game.state.visiblePlayers.forEach(function(visiblePlayer) {
            var e = drawEntity(visiblePlayer.position.x, visiblePlayer.position.y, 'rgb(0,0,255)');
            networkedPlayerEntities.push(e);
        });
        // Make sure the player is drawn above any networked players
        drawPlayer(Game.state.player.x, Game.state.player.y);
    },

    drawCell: function(x, y) {
        if (x < Game.state.width && y < Game.state.height) {
            Game.state.setCell(x, y, CellType.EMPTY);
        }
        var e = drawEntity(x, y, 'rgb(255, 255, 255)');
        mazeEntities.push(e);
    },

    width: function() {
        return Game.state.width * tile.width;
    },

    height: function() {
        return Game.state.height * tile.height;
    }
}

function drawEntity(x, y, color) {
    return Crafty.e('2D, Canvas, Color')
        .attr({
            x: x * tile.width,
            y: y * tile.height,
            w: tile.width,
            h: tile.height
        })
        .color(color);
}

function drawPlayer(x, y) {
    if(playerEntity) {
        playerEntity.destroy();
    }
    playerEntity = drawEntity(x, y, 'rgb(255, 0, 0)');
}

// Inform the server of the player's updated position
function emitMoveSignal() {
    socket.emit('move', {
        chunk: Game.state.chunkIndex,
        x: Game.state.player.x,
        y: Game.state.player.y
    });
}

// Destroy all active maze entities
function destroyMazeEntities() {
    while(mazeEntities.length > 0) {
        mazeEntities.pop().destroy();
    }
}

// Draw the chunk of the maze
function drawMaze() {
    destroyMazeEntities();
    for (var row = 0; row < Game.state.chunk.height; row++) {
        for (var col = 0; col < Game.state.chunk.width; col++) {
            var stateRow = (7 - row) * 2 + 1;
            var stateCol = col * 2 + 1;
            if (Game.state.chunk.offsetX === 1) {
                stateCol -= 2;
            }
            if (Game.state.chunk.offsetY === 1) {
                stateRow += 2;
            }
            Game.drawCell(stateCol, stateRow);
            switch (Game.state.chunk.data[row * Game.state.chunk.width + col]) {
                case 0:
                    Game.drawCell(stateCol + 1, stateRow);
                    break;
                case 1:
                    Game.drawCell(stateCol - 1, stateRow);
                    break;
                case 2:
                    Game.drawCell(stateCol, stateRow + 1);
                    break;
                case 3:
                    Game.drawCell(stateCol, stateRow - 1);
                    break;
            }
        }
    }
}
