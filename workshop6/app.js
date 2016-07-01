var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var app = express();
app.listen(3000,function(){
    console.log("Server running on 3000");
});

app.use(jsonParser);

var lastDice = 0;
var possibleMoves = Array(40); // 40 Mögliche Spielfeldpositionen (ohne goal und home)
var homeArray = Array(16); // Home der Spielfiguren
var goalArray = Array(16); //Goal der Spielfiguren
var homeCount = 0;
var goal;
var playerCount = 0;
var diceCount = 0;
var currentPosition = 0;
var playerID = 0;

//Spielfeld Array: 0 = frei; 1-15 FigurenID
for(var i=0; i<possibleMoves.length; i++) {
  possibleMoves[i] = 0;
}
for(var i=0; i<goalArray.length; i++) {
  goalArray[i] = 0;
}
for(var i=0; i<homeArray.length; i++) {
  homeArray[i] = i+1;
}
//
//TESTFALL: possibleMoves[12] = 13;
//Spielfigurposition ermitteln
app.put('/spielfigur/position',bodyParser.urlencoded({extended:true}) ,function(req, res){
  var id = req.body.id;
  //Figuren ID ermitteln
  var figureID = String(id);
  console.log("POSITION Figur:"+figureID);
  //var figureID = id.charAt(id.length-1);
  //Alle Spielfelder durchlaufen
  for(var i = 0; i < possibleMoves.length; i++){
    console.log("Auf Spielfeld " + i + " befindet sich die Figur" + possibleMoves[i]);
    //ID des Felds = Figuren ID -> Rückgabe
    if(possibleMoves[i] == figureID){
      console.log("Spieler "+figureID+" befindet sich auf "+i);
      res.end(i.toString());
    }
  }
  //Figur nicht auf Spielfeld: Verweis auf Goal-Array
  console.log("ziel:"+possibleMoves[0]);

  res.end("40");
  //Überprüfung ob in Goal im Dienstnutzer
});

//Wenn Figur nicht auf Spielfeld in Goal suchen
app.get('gamefield/goal/position', function(req,res) {
  var id = req.body.id;
  //Figuren ID ermitteln
  var figureID = id.substring(id.length-1);
  //Alle Goalfelder durchlaufen
  for(var i = 0; i < goalArray.length; i++){
    //ID des Felds = Figuren ID -> Rückgabe
    if(goalArray[i] == figureID){
      res.end(i.toString());
    }
  }
  //Figur nicht auf Spielfeld/Goal: Fehler
  res.end("FALSE");
})

//FigurID in Zielfeld zurückgeben
app.get('/spielzug',function(req,res){
  res.end(possibleMoves[currentPosition+lastDice].toString());
});
// nicht besetzt = 0, durch sich selbst besetzt = 1, durch Gegner besetzt = 2
app.put('/spielzug',bodyParser.urlencoded({extended:true}),function(req,res){
  var id = req.body.id;
  var figureID = String(id);
  var playerID = getPlayerID(figureID);
  console.log("SPIELZUG: Fig: "+figureID+ " Player: "+playerID);
  currentPosition = 0;

  //Finde aktuelle Position von Figur
  for(var i = 0; i < possibleMoves.length; i++){
    if(possibleMoves[i] == figureID){
      currentPosition = i;
      break;
    }
  }
  //Ist das Feld leer wird eine 0 zurückgegeben
  if(possibleMoves[currentPosition+lastDice] == 0){
    possibleMoves[currentPosition+lastDice] = figureID;
    possibleMoves[currentPosition] = 0;

    res.end("0");
  }
  //Ist das Feld durch eine eigene Figur besetzt, wird eine 1 zurückgegeben
  for(var i=playerID*4; i<playerID*4+4; i++) {
    if(possibleMoves[currentPosition+lastDice] == i){
      res.end("1");
    }
  }
  //Ist das Feld durch einen Gegner besetzt, wird eine 2 zurückgegeben
  possibleMoves[currentPosition+lastDice] = figureID;
  possibleMoves[currentPosition] = 0;
  res.end("2");
});

app.get('/dice',function (req,res){
    dice();
    console.log("Es wurde eine "+lastDice+" gewürfelt");
    res.end(lastDice.toString());
});

//Anzahl Würfe
app.put('/dice/number',bodyParser.urlencoded({extended:true}),function(req,res){
  var id = req.body.id;
  var figureID = String(id);
  console.log(req.body.id);
  for(var i=0; i<homeArray.length;i++){
    homeArray[i]=i;
  }

  //Spieler ermitteln
  playerID = getPlayerID(figureID);
  homeCount = 0;
  //Sind alle 4 Figuren in der Basis des gewählten Spielers, darf er 3 Mal würfeln
  for(var i=playerID*4; i<playerID*4+4; i++) {
    if(homeArray[i] >= playerID*4 && homeArray[i] <= playerID*4+3) {
      homeCount++;
    }
    if(homeCount == 4) {
      res.end("3");
    }
  }
  //Wo befinden sich die Figuren, wenn nicht in Home?
  for(var i = playerID*4; i<playerID*4+4; i++){
    //Ist eine Figur draußen und das letzte Feld in goal ist nicht besetzt, darf er nur 1 Mal würfeln
    if(goalArray[i] == 0) {
          res.end("1");
          //Ist eine Figur aus Home und diese befindet sich im letzten Feld von Goal darf er 3 Mal würfeln und das gleiche bei 2 und 3 Figuren
    }else if(goalArray[i] == 1 && goalArray[i-1] == 0 && goalArray[i-2] == 0 && goalArray[i-3] == 0 && homeCount == 3){
          res.end("3");
    }else if(goalArray[i] == 1 && goalArray[i-1] == 1 && goalArray[i-2] == 0 && goalArray[i-3] == 0 && homeCount == 2){
          res.end("3")
    }else if(goalArray[i] == 1 && goalArray[i-1] == 1 && goalArray[i-2] == 1 && goalArray[i-3] == 0 && homeCount == 1){
          res.end("3");
          //Ansonsten darf er nur 1 Mal würfeln
    }else {
      res.end("1");
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


app.put('/gamefield/neutral',bodyParser.urlencoded({extended:true}),function (req,res) {
  // else if(possibleMoves[lastDice+playerID*10] <= playerID*4 && possibleMoves[lastDice+playerID*10] >= playerID*4+3) {
  //   //Figur von Spieler auf neue Pos bewegen
  //   possibleMoves[lastDice+playerID*10] == figureID;
  //   res.end((lastDice+playerID*10).toString());
  // }
  //TESTFALL: dice();
  console.log("Würfelzahl:"+lastDice);
  var id = req.body.id;

  var figureID = String(id);
  playerID = getPlayerID(figureID);
  console.log("neutral: "+id);

/*
  if (possibleMoves[lastDice+playerID*10] < playerID*4 && possibleMoves[lastDice+playerID*10] > playerID*4+3){
     //Figur von Spieler auf neue Pos bewegen
     possibleMoves[lastDice+playerID*10] = figureID;
     res.end("true");
   }
   else if(possibleMoves[lastDice+playerID*10] >= playerID*4 && possibleMoves[lastDice+playerID*10] <= playerID*4+3){
     possibleMoves[lastDice+playerID*10] = figureID;
     res.end("true");
   }
   else{
     res.end("false");
   }
*/
//TO-DO Spielfeld von alter Position resetten
for(var i = 0; i < possibleMoves.length; i++){
  if(possibleMoves[i] == figureID){
    currentPosition = i;
    console.log("CurrentPos:"+currentPosition);
    console.log("possibleMoves:"+possibleMoves[i]);
  }
}
console.log("ziel:"+(lastDice*1.0+currentPosition*1.0));
possibleMoves[lastDice+currentPosition] = figureID;
possibleMoves[currentPosition] = 0;
res.end("true");
});

app.get('/gamefield/home',function (req,res) {
  //Basis Array: 0 = frei 1 = belegt
  //Noch ohne Sinn
});

app.put('/gamefield/home',bodyParser.urlencoded({extended:true}) ,function(req,res){
  var id = req.body.id;
  var figureID = String(id);
  playerID = getPlayerID(figureID);
  lastDice = 6;
  console.log(req.body);
  console.log("Spieler "+playerID+ " versucht Figur "+figureID+" aus home zu bewegen");
  //CurrentPosition an Dienstnutzer übergeben von der Figur,
  //um die Figur zu bewegen
  //Server muss bei jedem Klick abfragen ob Zug möglich Ist
  for(var i=playerID*4+1; i<=playerID*4+4;i++) {
    if(homeArray[i-1] >= playerID*4+1 && homeArray[i-1] <= playerID*4+4){
      //6 Gewürfelt(kein Zug möglich)->ausgewählte FigurID aus home auf Startfeld
      if(lastDice == 6 && possibleMoves[playerID*10] == 0) {
        //Spielfigur auf erstes Feld stellen
        possibleMoves[playerID*10] = figureID;
        homeArray[i-1] = 0;
        console.log("PlayerID: "+playerID+" PlayerID*10 " + playerID*10);
        console.log("Home erfolgreich verlassen: "+possibleMoves[playerID*10]);
        res.end("true");
      }else{
        console.log("FALSE: LastDice: "+lastDice+" Possiblemoves: "+ possibleMoves[playerID*10]);
      }
    }else{
      console.log("FALSE: homeArray["+i+"] "+homeArray[i]+" PlayerID "+playerID);
    }
  }
    res.end("false");
});

//Würfelfunktion
function dice() {
  lastDice = Math.round(Math.random() * (6 - 1) + 1);
  //lastDice = 6;
  //for(var i=0;i<possibleMoves.length;i++)
  //  console.log(possibleMoves[i]);
}

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

function getPlayerID(id){
  if(id > 0 && id <= 4){
    return 0;
  }
  else if(id > 4 && id <= 8 ){
    return 1;
  }
  else if(id > 8 && id <= 12){
    return 2;
  }
  else{
    return 3;
  }
}
