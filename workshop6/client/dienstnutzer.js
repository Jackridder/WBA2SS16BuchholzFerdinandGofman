var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var request = require('request');
var allClients = [];

server.listen(3001);
console.log("Dienstnutzer auf Port 3001");

var optionsGET = {
  host: 'localhost',
  port: 3000,
  path: 'leer',
  method: 'GET',
  headers: {
    accept: 'application/json'
  }
}
var optionsPOST = {
  host: 'localhost',
  port: 3000,
  path: 'leer',
  method: 'POST',
  headers: {
    accept: 'application/json'
  }
}

function startGame(){
  console.log("4 Spieler verbunden. Starte spiel");
}

io.on('connection',function(socket){
  console.log("socket verbunden");

  socket.on('join',function(socket){
    console.log("Player joined");
    io.emit('players',{data:allClients.length});
    newPlayer();
    if(allClients.length==4)
      startGame();
  });
  socket.on('abort',function(socket){
    console.log("Player aborted");
    newPlayer();
  });
});

io.sockets.on('connection', function(socket) {
   allClients.push(socket);
   io.emit('players',{data:allClients.length});

   socket.on('disconnect', function() {
      console.log('Player left');

      var i = allClients.indexOf(socket);
      allClients.splice(i, 1);

      if(allClients.length==0){
        abortGame();
      }
   });
});

app.set('view engine', 'ejs');
app.get('/',function (req,res) {
    res.render('index');
});

function newPlayer(){
  data = false;
  request.post('http://localhost:3000/spielfigur', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
      data = body;
    }
  });
  return data;
}

function getPlayerCount(){
  request('http://localhost:3000/spielfigur', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      io.emit("players",{c:body});
      players = body;
    }
  });

}

function abortGame(){
  request.delete('http://localhost:3000/spielfigur', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("Game aborted");
    }
  });
}
