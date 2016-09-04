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


//******************************************************************************
//*****SOCKETIO CONNECTION LISTENER*********************************************
//******************************************************************************
io.on('connection',function(socket){
  console.log("IO: Socket verbunden");

  socket.on('start',function(){
    console.log("Player started game");
    if(allClients.length>=2)
      startGame();
  });

  socket.on('abort',function(){
    console.log("Player aborted");
    abortGame();
  });
});

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
         allClients[currentPlayer].emit('unlockPlayer',{data:currentPlayer});
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
                3 = Keine 6
             */
             if (!error && response.statusCode == 200) {
               console.log("gamefield/home: "+fieldflag);

               //console.log("MOVEWISH: emit GETOUT");
               switch(parseInt(fieldflag)){
                 case 0:
                   console.log("Startfeld frei");
                   io.emit('getout',{data:true,figure:msg.figure,player:msg.player});
                   //nextRound();
                   break;
                 case 1:
                   console.log("Startfeld mit eigener Figur besetzt");
                   io.emit('getout',{data:false,figure:msg.figure,player:msg.player});
                   //nextRound();
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
                 case 3:
                   console.log("Keine 6 gewürfelt");
                   io.emit('getout',{data:false,figure:msg.figure,player:msg.player});
                   nextRound();
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
                       console.log("MOVEWISH: kick figure: "+victim);
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
                         nextRound();
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

     //Prüfen ob Spiel gewonnen
     request.put('http://localhost:3000/spielzug/gewinner',{form:{id:msg.figure}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          if(body != "false"){
            console.log("Wir haben einen Gewinner: "+body);
            io.emit('gamewon',{data:parseInt(body)});
          }
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

function abortGame(){
  request.delete('http://localhost:3000/gamefield/reset', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("Game aborted");
    }
  });
}

function startGame(){
  console.log(allClients.length+" Spieler verbunden. Starte spiel");
  allClients[0].emit('tokenadd',{data:currentPlayer,dices:3});
  io.emit('gamestart',{data:allClients.length});
}

function nextRound(){
  allClients[currentPlayer].emit('tokenremove',{data:currentPlayer});
  currentPlayer = (currentPlayer+1)%allClients.length;
  //allClients[currentPlayer].emit('tokenadd',{data:currentPlayer});
  request.put('http://localhost:3000/dice/number',{form:{id:currentPlayer}}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("Anzahl der Würfe: "+body+" für Spieler "+currentPlayer);
      //currentPlayer = (currentPlayer+1)%allClients.length;
      allClients[currentPlayer].emit('tokenadd',{data:currentPlayer,dices:parseInt(body)});
    }
  });
  console.log("Next Round - Next Player: "+currentPlayer);
}
