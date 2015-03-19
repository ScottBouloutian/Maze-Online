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

// Define the Game object
var Game = {

    // Initialize and start our game
    start: function() {
        // Initialize the game state
        Game.state = new GameState(startChunk);
        Game.state.queryMazeServer(function() {
            // Start crafty and set a background color so that we can see it's working
            Crafty.init(Game.width(), Game.height());
            Crafty.background('rgb(0, 0, 0)');
            // Draw the game state
            Game.draw();
        });
        // Allow keyboard input
        Crafty.e('Keyboard').bind('KeyDown', function(e) {
            if (e.key == Crafty.keys.LEFT_ARROW) {
                Game.state.move(Direction.LEFT, function() {
                    Game.draw();
                });
            } else if (e.key == Crafty.keys.RIGHT_ARROW) {
                Game.state.move(Direction.RIGHT, function() {
                    Game.draw();
                });
            } else if (e.key == Crafty.keys.UP_ARROW) {
                Game.state.move(Direction.UP, function() {
                    Game.draw();
                });
            } else if (e.key == Crafty.keys.DOWN_ARROW) {
                Game.state.move(Direction.DOWN, function() {
                    Game.draw();
                });
            }
        });
    },

    draw: function() {
        // Destroy all active maze entities
        var arr = Crafty('2D, Canvas').get().forEach(function(e) {
            e.destroy();
        });

        // Draw the chunk of the maze
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
                        this.drawCell(stateCol + 1, stateRow);
                        break;
                    case 1:
                        this.drawCell(stateCol - 1, stateRow);
                        break;
                    case 2:
                        this.drawCell(stateCol, stateRow + 1);
                        break;
                    case 3:
                        this.drawCell(stateCol, stateRow - 1);
                        break;
                }
            }
        }
        // Draw the player
        drawPlayer(Game.state.player.x, Game.state.player.y);
    },

    drawCell: function(x, y) {
        if (x < Game.state.width && y < Game.state.height) {
            Game.state.setCell(x, y, CellType.EMPTY);
        }
        drawEntity(x, y, 'rgb(255, 255, 255)');
    },

    width: function() {
        return Game.state.width * tile.width;
    },

    height: function() {
        return Game.state.height * tile.height;
    }
}

function drawEntity(x, y, color) {
    Crafty.e('2D, Canvas, Color')
        .attr({
            x: x * tile.width,
            y: y * tile.height,
            w: tile.width,
            h: tile.height
        })
        .color(color);
}

function drawPlayer(x, y) {
    drawEntity(x, y, 'rgb(255, 0, 0)');
}
