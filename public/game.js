Game = {
  // This defines our grid's size and the size of each of its tiles
  map_grid: {
    width: 17,
    height: 17,
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
    client.get('http://localhost:3000/api/maze/chunk?chunk=2', function(res) {
        var chunkData = JSON.parse(res).chunkData;

        for(var row=7;row>-1;row--) {
            for(var col=0;col<8;col++) {
                drawCell(col*2+1,row*2+1);
                console.log(((7-row)*8+col) + ' - ' + chunkData[(7-row)*8+col]);
                switch(chunkData[(7-row)*8+col]) {
                    case 0:
                        drawCell(col*2+1+1,row*2+1);
                        break;
                    case 1:
                        drawCell(col*2+1-1,row*2+1);
                        break;
                    case 2:
                        drawCell(col*2+1,row*2+1+1);
                        break;
                    case 3:
                        drawCell(col*2+1,row*2+1-1);
                        break;
                }
            }
        }

    });
}

};

function drawCell(x,y) {
    console.log('drawing ' + x + ',' + y);
    Crafty.e('2D, Canvas, Color')
      .attr({
        x: x * Game.map_grid.tile.width,
        y: y * Game.map_grid.tile.height,
        w: Game.map_grid.tile.width,
        h: Game.map_grid.tile.height
      })
      .color('rgb(255, 255, 255)');
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
