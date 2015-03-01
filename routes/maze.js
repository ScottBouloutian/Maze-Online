var fs = require('fs');
var mazeFile = "maze-8000.dat";
var mazeSize = 8000;
var chunkSize = 8;
var numChunks = 1000;
var Q = require('q');

exports.chunk = function(req, res) {
    console.log("Retrieving chunk");
    var chunk = req.query.chunk;

    readChunk(0)
        .then(function(chunkData) {
            res.json({
                chunkData: chunkData
            });
        });

};

function readChunk(chunkIndex) {
    console.log('Reading chunk: ' + chunkIndex);
    var deferred = Q.defer();
    fs.open(mazeFile, 'r', function(status, fd) {
        if (status) {
            console.log(status.message);
            return;
        }
        var chunkStartIndex = chunkSize * chunkIndex;
        var bufferSize = chunkSize*2/8;
        var buffer = new Buffer(chunkSize * bufferSize);
        var promises = [];
        for(var row=0;row<chunkSize;row++) {
            var rowStartByte = (chunkStartIndex + row*mazeSize)/4;
            var promise = Q.nfcall(fs.read, fd, buffer, row*bufferSize, bufferSize, rowStartByte);
            promises.push(promise);
        }
        Q.all(promises)
            .done(function() {
                var chunkData = [];
                for(var i=0;i<chunkSize * bufferSize;i++) {
                    var byte = buffer[i];
                    var bits = toBinary(byte);
                    for(var cell=0;cell<4;cell++) {
                        chunkData.push(bits[cell*2]*2+bits[cell*2+1]);
                    }
                }
                deferred.resolve(chunkData);
            });
    });
    return deferred.promise;
}

function toBinary(n) {
    var result = [];
    var bit;
    for(var i=0;i<8;i++) {
        bit = n % 2;
        n=Math.floor(n/2);
        result[7-i] = bit;
    }
    return result;
}
