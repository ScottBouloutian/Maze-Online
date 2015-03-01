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

Game = {
  // This defines our grid's size and the size of each of its tiles
  map_grid: {
    width: 15,
    height: 15,
    tile: {
      width: 32,
      height: 32
    }
  },

  // The total width of the game screen. Since our grid takes up the entire screen
  //  this is just the width of a tile times the width of the grid
  width: function() {
    return this.map_grid.width * this.map_grid.tile.width;
  },

  // The total height of the game screen. Since our grid takes up the entire screen
  //  this is just the height of a tile times the height of the grid
  height: function() {
    return this.map_grid.height * this.map_grid.tile.height;
  },

  // Initialize and start our game
  start: function() {
    // Start crafty and set a background color so that we can see it's working
    Crafty.init(Game.width(), Game.height());
    Crafty.background('rgb(0, 0, 0)');
    client = new HttpClient();
    client.get('http://localhost:3000/api/maze/chunk?chunk=999000', function(res) {
        var chunkData = JSON.parse(res).chunkData;
        var gameState = new GameState(17,17,chunkData);
        // Draw the game state
        gameState.draw();
        // Allow keyboard input
        Crafty.e('Keyboard').bind('KeyDown', function(e) {
          if (e.key == Crafty.keys.LEFT_ARROW) {
            gameState.move(Direction.LEFT);
            gameState.draw();
          } else if (e.key == Crafty.keys.RIGHT_ARROW) {
            gameState.move(Direction.RIGHT);
            gameState.draw();
          } else if (e.key == Crafty.keys.UP_ARROW) {
            gameState.move(Direction.UP);
            gameState.draw();
          } else if (e.key == Crafty.keys.DOWN_ARROW) {
            gameState.move(Direction.DOWN);
            gameState.draw();
          }
        });
        //gameState.debug();
    });
}

};

function drawPlayer(x,y) {
    Crafty.e('2D, Canvas, Color')
      .attr({
        x: x * Game.map_grid.tile.width,
        y: y * Game.map_grid.tile.height,
        w: Game.map_grid.tile.width,
        h: Game.map_grid.tile.height
      })
      .color('rgb(255, 0, 0)');
}

var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.send( null );
    }
}

// Describes a game state object
function GameState(width, height, chunkData) {
    this.chunkIndex = 999000;
    this.chunkData = chunkData;
    this.playerX = 1;
    this.playerY = 0;
    // Initialize the state of the board
    this.state = new Array(width * height);
    this.clearState();
}
GameState.prototype = {
    clearState: function() {
        for (var i = 0; i < this.state.length; i++) {
          this.state[i] = CellType.WALL;
        }
    },

    getCell: function(x,y) {
        return this.state[y*8+x];
    },

    setCell: function(x,y,type) {
        this.state[y*8+x] = type;
    },

    draw: function() {
        // Destroy all active maze entities
        var arr = Crafty('2D, Canvas').get().forEach(function(e) {
          e.destroy();
        });

        // Draw the maze
        for(var row=7;row>-1;row--) {
            for(var col=0;col<8;col++) {
                this.drawCell(col*2+1,row*2+1);
                switch(this.chunkData[(7-row)*8+col]) {
                    case 0:
                        this.drawCell(col*2+1+1,row*2+1);
                        break;
                    case 1:
                        this.drawCell(col*2+1-1,row*2+1);
                        break;
                    case 2:
                        this.drawCell(col*2+1,row*2+1+1);
                        break;
                    case 3:
                        this.drawCell(col*2+1,row*2+1-1);
                        break;
                }
            }
        }
        // Draw the player
        drawPlayer(this.playerX,this.playerY);
    },

    drawCell: function(x,y) {
        this.setCell(x,y,CellType.EMPTY);
        Crafty.e('2D, Canvas, Color')
          .attr({
            x: x * Game.map_grid.tile.width,
            y: y * Game.map_grid.tile.height,
            w: Game.map_grid.tile.width,
            h: Game.map_grid.tile.height
          })
          .color('rgb(255, 255, 255)');
    },

    move: function(direction) {
        switch (direction) {
          case Direction.LEFT:
            if(this.getCell(this.playerX - 1,this.playerY) === CellType.EMPTY) {
                this.playerX--;
            }
            break;
          case Direction.RIGHT:
              if(this.playerX == 14) {
                  // Move a sector to the right
                  this.chunkIndex++;
                  var self = this;
                  this.playerX = 0;
                  this.queryChunkData(function() {
                      self.draw();
                  });
              } else if(this.getCell(this.playerX + 1,this.playerY) === CellType.EMPTY) {
                this.playerX++;
              }
            break;
          case Direction.UP:
              if(this.getCell(this.playerX,this.playerY - 1) === CellType.EMPTY) {
                  this.playerY--;
              }
            break;
          case Direction.DOWN:
              if(this.getCell(this.playerX,this.playerY + 1) === CellType.EMPTY) {
                  this.playerY++;
              }
            break;
        }
    },

    queryChunkData: function(callback) {
        console.log('querying');
        var client = new HttpClient();
        var self = this;
        client.get('http://localhost:3000/api/maze/chunk?chunk=' + this.chunkIndex, function(res) {
            var chunkData = JSON.parse(res).chunkData;
            self.chunkData = chunkData;
            callback();
        });
    },

    debug: function() {
        console.log('there are ' + this.state.length + ' elements in state');
        this.state.forEach(function(type) {
            console.log(type);
        });
    }
}
