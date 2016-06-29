var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.listen(3000,function(){
    console.log("Server running on 3000");
});

var jsonParser = bodyParser.json();
app.use(jsonParser);

var lastDice = 0;
var possibleMoves = Array(40); // 40 Mögliche Spielfeldpositionen
var homeArray = Array(16); // Basis der Spielfiguren
var goalArray = Array(4); //Ziel der Spielfiguren
var homeCount = 0;
var goal;
var playerCount = 0;
var diceCount = 0;

//Spielfeld Array: 0 = frei; 1 = gelb, 2 = grün, 3 = schwarz, 4 = rot
for(var i=0; i<possibleMoves.length; i++) {
  possibleMoves[i] = 0;
}
for(var i=0; i<goalArray.length; i++) {
  goalArray[i] = 0;
}

app.get('/dice',function (req,res){
    dice();
    res.end(lastDice.toString());
});

app.get('/dice/number',function(req,res){
  //Wie oft Würfeln
  homeCount = 0;
  for(var i=playerID*4; i<playerID*4+4; i++) {
    if(homeArray[i] == 1) {
      homeCount++;
    }
    if(homeCount == 4) {
      res.end("3");
    }
  }
  for(var i = playerID*4; i<playerID*4+4; i++){
    if(goalArray[i] == 0) {
          res.end("1");
    }else if(goalArray[i] == 1 && goalArray[i-1] == 0 && goalArray[i-2] == 0 && goalArray[i-3] == 0){
          res.end("3");
    }else if(goalArray[i] == 1 && goalArray[i-1] == 1 && goalArray[i-2] == 0 && goalArray[i-3] == 0){
          res.end("3")
    }else if(goalArray[i] == 1 && goalArray[i-1] == 1 && goalArray[i-2] == 1 && goalArray[i-3] == 0){
          res.end("3");
    }else {
      red.end("1");
    }
  }
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

app.get('/gamefield/neutral',function (req,res) {
  if(possibleMoves[req.body.fieldid]){ //Falls Spielzug möglich
      possibleMoves[req.body.fieldif] = 0;
      res.end(true);
  }// Erlaube Spielzug und entferne aus Möglichen
  else {
    res.end(false);
  }
});

app.get('/gamefield/home',function (req,res) {
  //Basis Array: 0 = frei 1 = belegt
  for(var i=0; i<homeArray.length; i++) {
    homeArray[i] = 1;
  }
});

//Würfelfunktion
function dice() {
  lastDice = Math.round(Math.random() * (6 - 1) + 1);
}

// app.put('/gamefield/home', function(req, res){
// //********************* Würfellogik home Anfang *********************
// //Spieler und Spielfigur ID speichern und trennen
// var id = req.body.id;
// var playerID = id.substring(1,2);
// var figureID = id.substring(0,1);
//
//
//   if(homeArray[] == 1) {
//     //6 Gewürfelt(kein Zug möglich)->letzte Figur aus home auf Startfeld
//     if(lastDice == 6 && possibleMoves[0] == 0) {
//       //Spielfigur auf erstes Feld stellen
//       app.put('/gamefield', function(req, res) {
//         possibleMoves[0] = 1;
//       });
//     }
//     //6 Gewürfelt, Startfeld belegt & andere Figur schlagbar
//     else if(lastDice == 6 && possibleMoves[0] == 1 && possibleMoves[5] == 2) {
//       //Figur von Spieler auf neue Pos bewegen
//       possibleMoves[5] == 1;
//       //TO-DO: Gegner
//       dice();
//     }
//     //6 Gewürfelt und Startfeld belegt
//     else if(lastDice == 6 && possibleMoves[0] == 1) {
//       //Figur von Spieler auf neue Pos bewegen
//       possibleMoves[5] == 1;
//       dice();
//     }
//     //Kein Zug möglich: 3 Mal würfel
//     else if(diceCount<2) {
//       diceCount++;
//       dice();
//       }
//       //Drei Mal gewürfelt:
//       else {
//         diceCount = 0;
//       }
//     }
//   }
// //********************* Würfellogik home Ende *********************
// }
// //********************* Würfellogik goal Anfang *********************
//
//
//
//
//
//
//
//
//
//   if(lastDice == 6 && possibleMoves > 0) {
//     app.put('/gamefield/home', function(req, res)) {
//
//     }
//   }
// }


app.get('/gamefield/goal',function (req,res) {
    for(i=0;i<4;i++){
      for(j=0;j<4;j++){
        if(goal[i][j]==0)
          res.end(i);
      }
    }
    res.end();
});

app.delete('/spielfigur',function (req,res) {
    playerCount = 0;
    possibleMoves = [];
    lastDice = 0;
    res.end("true");
});

app.get('/spielfigur/:picname',function (req,res) {
    var filename = req.params.picname;
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

app.get('/spielfigur',function (req,res) {
  console.log("GET Spielfigur: "+playerCount);
  res.end(playerCount.toString());
});

app.post('/spielfigur',jsonParser,function (req,res) {
  console.log("Spieler "+playerCount+" verbunden");
  if(playerCount<4){
    playerCount++;
    res.end("true");
  }else{
    res.end("false"); //spiel bereits gestartet
  }

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
