var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var request = require('request');

//******************************************************************************
//*****INITIATE*****************************************************************
//******************************************************************************
var allClients = [];
var currentPlayer = 0;

server.listen(3001);
console.log("Dienstnutzer auf Port 3001");

function startGame(){
  console.log("4 Spieler verbunden. Starte spiel");
  allClients[0].emit('tokenadd',{data:currentPlayer});
}

//******************************************************************************
//*****SOCKETIO CONNECTION LISTENER*********************************************
//******************************************************************************
io.on('connection',function(socket){
  console.log("IO: Socket verbunden");

  socket.on('join',function(){
    console.log("Player joined");
    newPlayer();
    if(allClients.length==4)
      startGame();
  });

  socket.on('abort',function(){
    console.log("Player aborted");
    abortGame();
  });
});
function nextRound(){
  allClients[currentPlayer].emit('tokenremove',{data:currentPlayer});
  currentPlayer = (currentPlayer+1)%allClients.length;
  allClients[currentPlayer].emit('tokenadd',{data:currentPlayer});
  console.log("Next Round - Next Player: "+currentPlayer);
}
io.sockets.on('connection', function(socket) {
  console.log("SOCKETS: new Socket");
   allClients.push(socket);
   io.emit('players',{data:allClients.length});
   socket.on('dice',function (){ // Es wurde gewürfelt
     console.log("player diced.");
     // Neue Augenzahl würfeln
     request('http://localhost:3000/dice', function (error, response, body) {
       if (!error && response.statusCode == 200) {
         console.log("dice result: "+body);
         io.emit('diced',{data:body});
       }
     });
   });
   socket.on('movewish',function(msg){ // Spieler möchte sich bewegen
     console.log("MOVEWISH: "+msg.figure);

     // Aktuelle Position der Figur finden:
     request.put('http://localhost:3000/spielfigur/position',{form:{id:msg.figure}}, function (error, response, pos) {
       if (!error && response.statusCode == 200) {
         console.log("MOVEWISH: position "+pos);
         if(pos == 40){ // Spielerfigur befindet sich im Home
           console.log("Bewegte Figur ist in home");
           // Ist das wunschfeld frei?
           request.put('http://localhost:3000/gamefield/home',{form:{id:msg.figure}}, function (error, response, fieldflag) {
             /*
                0 = Feld frei
                1 = Eigene Figur besetzt
                2 = Fremde Figur besetzt
             */
             if (!error && response.statusCode == 200) {
               console.log("gamefield/home: "+fieldflag);

               //console.log("MOVEWISH: emit GETOUT");
               switch(parseInt(fieldflag)){
                 case 0:
                 console.log("Startfeld frei");
                 io.emit('getout',{data:true,figure:msg.figure,player:msg.player});
                 nextRound();
                 break;
                 case 1:
                 console.log("Startfeld mit eigener Figur besetzt");
                 io.emit('getout',{data:false,figure:msg.figure,player:msg.player});
                 break;
                 case 2:
                 console.log("Startfeld mit fremder Figur besetzt");
                 request.put('http://localhost:3000/spielzug/home/kickPlayer',{form:{id:msg.figure}}, function (error, response, victim) {
                   if (!error && response.statusCode == 200) {
                     console.log("MOVEWISH: kick figur: "+victim);
                     io.emit('kickfigure',{data:victim});
                     io.emit('getout',{data:true,figure:msg.figure,player:msg.player});
                     nextRound();
                   }
                 });

                 break;
               }

             }
           });

         }else{ // Spielfigur befindet sich auf Feld
           request.put('http://localhost:3000/spielzug',{form:{id:msg.figure}}, function (error, response, fieldflag) {
             /*
                0 = Feld frei
                1 = Eigene Figur besetzt
                2 = Fremde Figur besetzt
                3 = Goal frei
                4 = Goal besetzt
             */
             if (!error && response.statusCode == 200) {
               console.log("MOVEWISH NEUTRAL ANSWER: "+fieldflag);
               switch(parseInt(fieldflag)){
                 case 0: //Feld Frei
                   io.emit('movefield',{data:true,figure:msg.figure,position:pos});
                   nextRound();
                   console.log("MOVEWISH: emit movefield");
                   break;
                 case 2: //Fremde Figur
                   request('http://localhost:3000/spielzug/kickPlayer', function (error, response, victim) {
                     if (!error && response.statusCode == 200) {
                       console.log("MOVEWISH: kick player: "+victim);
                       io.emit('kickfigure',{data:victim});
                       io.emit('movefield',{data:true,figure:msg.figure,position:pos});
                       nextRound();
                     }
                   });
                  break;
                 case 3: //Goal Frei
                   console.log("Switch 3");
                   request.put('http://localhost:3000/gamefield/goal/position',{form:{id:msg.figure}}, function (error, response, goalpos) {
                     if (!error && response.statusCode == 200) {
                       console.log("goalpos: "+goalpos);
                       if(goalpos==false){
                         io.emit('movegoal',{data:false,figure:msg.figure,position:""});
                         console.log("MOVEWISH: Goal false");
                       }else{
                          io.emit('movegoal',{data:true,figure:msg.figure,position:goalpos});
                          nextRound();
                          console.log("MOVEWISH: Goal true");
                        }
                      }else{
                        console.log("ERROR: "+error);
                      }
                   });
                    break;

                 case 1: // Feld besetzt
                 case 4: // Goal besetzt
                 console.log("Feld oder Ziel ist besetzt.");
                  io.emit('movefield',{data:false,figure:msg.figure,position:pos});
                  break;
               }
             }
           });
         }
       }
     });

   });


   socket.on('moved',function(msg){
     console.log("Player "+msg.data+" moved to X"+msg.x+" Y"+msg.y);
     //io.emit('move',{data:true,player:msg.data,x:msg.x,y:msg.y})
     allClients[currentPlayer].emit('tokenremove',{data:currentPlayer});
     //Wie oft darf gewürfelt werden
     request.put('http://localhost:3000/dice/number',{form:{id:msg.data.charAt(msg.data.length)}}, function (error, response, body) {
       if (!error && response.statusCode == 200) {
         console.log("PUT:"+body);
         currentPlayer = (currentPlayer+1)%allClients.length;
         allClients[currentPlayer].emit('tokenadd',{data:currentPlayer});
       }
     });

   })
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

//******************************************************************************
//*****EXPRESS EJS RENDERER*****************************************************
//******************************************************************************
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
          //console.log("Datei geschickt!");
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
            //console.log("Datei geschickt!");
        }
        res.end();
    });
});

app.get('/rules',function (req,res) {
  res.sendFile(__dirname+'/rules/rules.html', function (err){
     if(err) {
          console.log(err);
      }
      else{
          console.log("Datei geschickt!");
      }
      res.end();
  });
});

//******************************************************************************
//*****FUNCTIONS****************************************************************
//******************************************************************************

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
