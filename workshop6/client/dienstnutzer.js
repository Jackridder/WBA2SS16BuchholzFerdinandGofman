var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var request = require('request');
var allClients = [];
//var app = express();

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

//var io = require('socket.io').listen(3000);
//var socketDienstnutzer = require('socket.io-client')('http://localhost:3000');
//var socketDienstnutzer = io.connect('http://localhost');
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

    if(allClients.length==4)
      abortGame();
  });
});

io.sockets.on('connection', function(socket) {
   allClients.push(socket);
   io.emit('players',{data:allClients.length});

   socket.on('disconnect', function() {
      console.log('Player left');

      var i = allClients.indexOf(socket);
      allClients.splice(i, 1);
   });
});


/*
app.listen(3001,function(){
});*/
app.set('view engine', 'ejs');
app.get('/',function (req,res) {
    res.render('index');
});

function newPlayer(){
  /*
  optionsPOST.path = '/spielfigur';

  var postSpielfigur = server.request(optionsPOST, function(res){
    console.log("Spieler hat sich verbunden");
    res.on('data', function(chunk){
        data = chunk;
    });
  });
  postSpielfigur.end();
  */
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
  /*optionsGET.path = '/spielfigur';
  var data = "00";
  var getPlayerCount = server.request(optionsGET, function(res){
    console.log("Hole Spieleranzahl vom Server");
    res.on('data', function(chunk){
        data = chunk;
    });
  });
  postSpielfigur.end();*/
  request('http://localhost:3000/spielfigur', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      io.emit("players",{c:body});
      players = body;
    }
  });

}

function abortGame(){
  /*
  optionsPOST.path = '/spielfigur';

  var postSpielfigur = server.request(optionsPOST, function(res){
    console.log("Spieler hat sich verbunden");
    res.on('data', function(chunk){
        data = chunk;
    });
  });
  postSpielfigur.end();
  */
  data = false;
  request.delete('http://localhost:3000/spielfigur', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
    }
  });
  return data;
}
