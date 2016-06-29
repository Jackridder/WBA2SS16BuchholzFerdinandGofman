var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var request = require('request');
var allClients = [];
var currentPlayer = 0;

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
  allClients[0].emit('test');
}

io.on('connection',function(socket){
  console.log("IO: Socket verbunden");
  socket.on('join',function(socket){
    console.log("Player joined");
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
  console.log("SOCKETS: new Socket");
   allClients.push(socket);
   io.emit('players',{data:allClients.length});
   socket.on('dice',function (){
     console.log("player diced.");
     request('http://localhost:3000/dice', function (error, response, body) {
       if (!error && response.statusCode == 200) {
         console.log("dice result: "+body);
         io.emit('diced',{data:body});
       }
     });
   });
   socket.on('disconnect', function() {
      console.log('Player left');

      socket.emit('left',{data:allClients.length});

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

app.get('/gamefield',function (req,res) {
  res.sendFile(__dirname+'/gamefield/gamefield.jpg', function (err){
     if(err) {
          console.log(err);
          res.status(404).end("Datei nich gefunden");
      }
      else{
          console.log("Datei geschickt!");
      }
      res.end();
  });
});

app.get('/spielfigur/:picid',function (req,res) {
    var filename = req.params.picid+".png";
    res.sendFile(__dirname+'/spielfigur/'+filename, function (err){
       if(err) {
            console.error("SendFile error:", err, " (status: " + err.status + ")");
            //console.log(err);
            if (err.status) {
              res.status(err.status).end();
            }
        }
        else{
            console.log("Datei geschickt!");
        }
        res.end();
    });
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
