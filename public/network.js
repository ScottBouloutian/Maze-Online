var socket = io();
Game.start(socket);

// Inform the game state of other visible players
socket.on('visible_players', function(visiblePlayers) {
    Game.state.visiblePlayers = visiblePlayers;
    Game.drawNetworkedPlayers();
});

// Handle server socket errors
socket.on('server_error', function(error) {
    console.log('a server error occurred');
    window.location.replace("http://google.com");
});
