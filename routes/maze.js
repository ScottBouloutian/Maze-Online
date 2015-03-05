var fs = require('fs');
var mazeFile = "maze-8000.dat";
var mazeSize = 8000;
var chunkSize = 8;
var numChunks = 1000000;
var chunkN = 1000;
var Q = require('q');

exports.chunk = function(req, res) {
    var chunk = req.query.chunk;
    readChunk(chunk)
        .then(function(chunkData) {
            res.json(chunkData);
        })
        .catch(function(reason) {
            res.json({
                err: reason
            });
        });

};

// Reads a given chunk of the maze from the file
// Automatically buffers the chunk if it is near the middle of the maze
// Returns with it a descriptor about the size of the chunk returned
function readChunk(chunkIndex) {
    if (chunkIndex < 0 || chunkIndex > numChunks - 1) {
        return Q.reject('invalid chunk index');
    } else {
        return Q.nfcall(fs.open, mazeFile, 'r')
            .then(function(fd) {
                // The row and column of the specified chunk in the grid of all possible chunks
                var chunkRow = chunkIndex / chunkN;
                var chunkCol = chunkIndex % chunkN;
                // The index of the first cell in the chunk in the grid of all possible cells
                var chunkStartIndex = chunkRow * chunkN * chunkSize * chunkSize + chunkSize * chunkCol;
                // Start calculating the bounds of the chunk of the maze to be retrieved
                var chunk = {
                    width: chunkSize,
                    height: chunkSize,
                    offsetX: 0,
                    offsetY: 0,
                };
                if (chunkRow > 0) {
                    // Add buffer space along the bottom of the chunk
                    chunkStartIndex -= mazeSize;
                    chunk.offsetY = 1;
                    chunk.height++;
                }
                if (chunkRow < chunkN - 1) {
                    // Add buffer space along the top of the chunk
                    chunk.height++;
                }
                if (chunkCol > 0) {
                    // Add buffer space along the left of the chunk
                    chunkStartIndex--;
                    chunk.offsetX = 1;
                    chunk.width++;
                }
                if (chunkCol < chunkN - 1) {
                    // Add buffer space along the right of the chunk
                    chunk.width++;
                }
                // The number of bytes to read in for each row of the chunk
                var bufferSize = Math.ceil(chunk.width / 4);
                var buffer = new Buffer(chunk.width * bufferSize);
                var promises = [];
                for (var row = 0; row < chunk.height; row++) {
                    var rowStartByte = (chunkStartIndex + row * mazeSize) / 4;
                    var promise = Q.nfcall(fs.read, fd, buffer, row * bufferSize, bufferSize, rowStartByte);
                    promises.push(promise);
                }
                // Read each row of the chunk from the maze data file
                return Q.all(promises)
                    .then(function() {
                        var chunkData = [];
                        for (var i = 0; i < buffer.length; i++) {
                            var byte = buffer[i];
                            var bits = toBinary(byte);
                            // The number of relevant cells in the current byte
                            var cellsInByte = 4;
                            // If we are looking at the last byte in a row
                            if(i%bufferSize === bufferSize - 1) {
                                cellsInByte = 4 - bufferSize % 4;
                            }
                            for (var cell = 0; cell < cellsInByte; cell++) {
                                chunkData.push(bits[cell * 2] * 2 + bits[cell * 2 + 1]);
                            }
                        }
                        // The entrance to the maze will be incorrect, fix it here
                        if (chunkIndex == 999000) {
                            chunkData[chunk.width * (chunk.height - 1)] = 3;
                        }
                        chunk.data = chunkData;
                        return chunk;
                    });
            });
    }
}

function toBinary(n) {
    var result = [];
    var bit;
    for (var i = 0; i < 8; i++) {
        bit = n % 2;
        n = Math.floor(n / 2);
        result[7 - i] = bit;
    }
    return result;
}
