//TO-DO: Goal ausgeben!
//TO-DO: letzte Figur von vorherigem Spieler gehört einem selbst
var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var app = express();
app.listen(3000,function(){
    console.log("Server running on 3000");
});
app.use(jsonParser);

//Anlegen globaler Variablen
var lastDice = 0;               //Letzter Würfelwurfs
var gamefieldArray = Array(40); //40 Mögliche Spielfeldpositionen (ohne goal und home)
var homeArray = Array(16);      //Home der Spielfiguren
var goalArray = Array(16);      //Goal der Spielfiguren
var homeCount = 0;              //Anzahl der Spieler im Goal
var playerCount = 0;            //Anzahl verbundener Spieler
var diceCount = 0;              //Anzahl der erlaubten Würfelwürfe (nicht alle Fälle)
var currentPosition = 0;        //Aktuelle Position der gewählten Figur
var unusedMoves = 0;            //Unbenutzte Feldzüge bei Arrayübergang

//Spielfeld aufbauen oder zurücksetzen
resetGame();

//****************************************Spielfigurposition ermitteln****************************************
app.put('/spielfigur/position',bodyParser.urlencoded({extended:true}) ,function(req, res){
  var id = req.body.id;
  //Figuren ID ermitteln
  var figureID = String(id);
  //Alle Spielfelder durchlaufen
  for(var i = 0; i < gamefieldArray.length; i++){
    console.log("Auf Spielfeld " + i + " befindet sich die Figur" + gamefieldArray[i]);
    //ID des Felds = Figuren ID -> Rückgabe
    if(gamefieldArray[i] == figureID){
      res.end(i.toString());
    }
  }
  //Figur nicht auf Spielfeldern -> Alle Goalfelder durchlaufen
  for(var i = 0; i < goalArray.length; i++){
    //ID des Felds = Figuren ID -> Rückgabe
    if(goalArray[i] == figureID){
      res.end("41");
    }
  }
  //Nicht im Spielfeld oder Goal -> Figur ist in Home
  res.end("40");
});
//******************************************************************************
//***************************************Figurposition in Goal ermitteln**************************************
app.put('/gamefield/goal/position',bodyParser.urlencoded({extended:true}), function(req,res) {
  //Figuren ID ermitteln
  var id = req.body.id;
  var figureID = String(id);
  var bool = false;

  //Alle Goalfelder durchlaufen
  for(var i = 0; i < goalArray.length; i++){
    console.log("Auf Goalfeld "+i+" steht Figur: "+goalArray[i]);
    //ID des Felds = Figuren ID -> Rückgabe
    if(goalArray[i] == figureID){
      bool = true;
      res.end(i.toString());
    }
  }
  if(!bool){
      res.end("false");
  }

});
//******************************************************************************
//**************************************FigurID in Zielfeld zurückgeben***************************************
app.get('/spielzug/',function(req,res){
  res.end(gamefieldArray[currentPosition+lastDice].toString());
});
//******************************************************************************
//**********************************************Spieler kicken************************************************

app.get('/spielzug/kickPlayer',function(req,res){
  //Position von zu kickender Figur
  var victim = gamefieldArray[(currentPosition+lastDice)%40];
  console.log("Figur " + victim + " wurde von Figur " + gamefieldArray[currentPosition] + " gekickt")
  //Setzen Kickenden auf das Feld des Gekickten
  gamefieldArray[(currentPosition+lastDice)%40] = gamefieldArray[currentPosition];
  homeArray[victim-1] = victim;
  //Alte Position auf 0 setzen
  gamefieldArray[currentPosition] = 0;
  res.end(victim.toString());
});
//******************************************************************************
//****************************************Spieler auf Startfeld kicken****************************************
app.put('/spielzug/home/kickPlayer',bodyParser.urlencoded({extended:true}),function(req,res){
  var id = req.body.id;
  var figureID = String(id);
  var playerID = getPlayerID(figureID);

  //Gegnerische Figur ermitteln
  var victim = gamefieldArray[playerID*10];
  //Setzen Kickenden auf das Feld des Gekickten
  gamefieldArray[playerID*10] = figureID;
  //Gegner zurück nach Home und eigener Spieler verlässt Home
  homeArray[id-1]= 0;
  homeArray[victim-1] = victim;
  res.end(victim.toString());
});

//******************************************************************************
//**************************************Kompletten Spielzug durchführen***************************************
app.put('/spielzug',bodyParser.urlencoded({extended:true}),function(req,res){
  var id = req.body.id;
  var figureID = String(id);
  var playerID = getPlayerID(figureID);
  var enterGoal = true;//Erstes Goalfeld besetzt und neuer Goaleintritt -> kein Überspringen
  console.log("SPIELZUG: Fig: "+figureID+ " Player: "+playerID);
  currentPosition = 0;

  //Finde aktuelle Position von Figur
  for(var i = 0; i < gamefieldArray.length; i++){
    if(gamefieldArray[i] == figureID){
      currentPosition = i;
      break;
    }
  }
  //Für Spieler 1-3 neue Runde nach Ende des Spielfelds bei Feld 39
  if(figureID>4 && currentPosition+lastDice>39){
    console.log("Übergang! Figur: "+figureID+" Startposition: "+currentPosition+" Wurf: "+lastDice);
    unusedMoves = (lastDice+currentPosition)-40;
    console.log("UnusedMoves: Player 1-3"+unusedMoves);
    //Zielfeld besetzt?

    if(gamefieldArray[unusedMoves] >= playerID*4+1  && gamefieldArray[unusedMoves] < playerID*4 ){
      res.end("1");

    }
    else if((gamefieldArray[unusedMoves] < playerID*4+1  || gamefieldArray[unusedMoves] >= playerID*4) && gamefieldArray[unusedMoves] != 0){
      res.end("2");
      console.log("Zielfeld besetzt von Figur: "+gamefieldArray[(currentPosition+lastDice)%40]+" Startfeld von " +gamefieldArray[currentPosition]);
    }
    else{
      gamefieldArray[unusedMoves] = figureID;
      gamefieldArray[currentPosition] = 0;
      res.end("0");
    }
  }
  //Überprüfen ob gewählte Spielfigur beim Zug ins Goal gehen würde
  //Für Spieler 1-3 anders als Spieler 0, da Spieler 0 Übergang von 39 auf 0 hätte (FeldID)
  //Hier Spieler 0:
  if(figureID<=4 && currentPosition+lastDice>39) {
    console.log("Für Spieler 0");
    unusedMoves = (lastDice+currentPosition)-40; //Restliche Feldzüge berechnen nachdem Goaleintrittsfeld erreicht wurde
    //Figur in Goalarray platzieren; vorher checken ob Position besetzt
    console.log("UnusedMoves: Player 0 "+unusedMoves);
    for(var i=playerID*4; i<playerID*4+unusedMoves; i++){
      if(goalArray[i] != 0) {
         enterGoal = false;
      }
    }
    if((unusedMoves<4)&&(goalArray[unusedMoves] == 0)&&enterGoal){
      console.log("0 leeres Feld!");
      goalArray[unusedMoves] = figureID;
      gamefieldArray[currentPosition] = 0;
      res.end("3");
      console.log("0 Ende leeres Feld");
    }
    else{
      console.log("0 Goal besetzt!");
      console.log("Inhalt des Zieldfeldes: "+goalArray[playerID*4+unusedMoves]);
      res.end("4");
    }
  }

  //Hier Spieler 1-3:
  if((currentPosition<=playerID*10-1) && (currentPosition+lastDice>playerID*10-1) && playerID >= 1) {
    console.log("Für Spieler 1-3");
    unusedMoves = lastDice - ((playerID*10-1)-currentPosition)-1; //Restliche Feldzüge berechnen nachdem Goaleintrittsfeld erreicht wurde
    //Figur in Goalarray platzieren; vorher checken ob Position besetzt
    console.log("unusedmoves: "+unusedMoves+ " playerID: "+playerID+" goalarray: "+goalArray[playerID*4+unusedMoves]);
    if((unusedMoves<4)&&(goalArray[playerID*4+unusedMoves] == 0)){
      console.log("1-3 leeres Feld!");
      goalArray[playerID*4+unusedMoves] = figureID;
      gamefieldArray[currentPosition] = 0;
      res.end("3");
    }else{
      console.log("1-3 Goal besetzt!");
      res.end("4");
    }
  }
  //Ist das Feld leer wird eine 0 zurückgegeben
  else if((gamefieldArray[(currentPosition+lastDice)] == 0)){
    console.log("normaler Zug");
    gamefieldArray[currentPosition+lastDice] = figureID;
    gamefieldArray[currentPosition] = 0;
    res.end("0");
  }
  //Ist das Feld durch eine eigene Figur besetzt, wird eine 1 zurückgegeben
  for(var i=playerID*4+1; i<=playerID*4+4; i++) {
    if(gamefieldArray[currentPosition+lastDice] == i){
      console.log("Zielfeld besetzt");
      res.end("1");
    }
  }
  res.end("2");
});
//******************************************************************************
//********************************************Gesamte Homelogik***********************************************
app.put('/gamefield/home',bodyParser.urlencoded({extended:true}) ,function(req,res){
  var id = req.body.id;
  var figureID = String(id);
  playerID = getPlayerID(figureID);
  console.log(req.body);
  console.log("Spieler "+playerID+ " versucht Figur "+figureID+" aus home zu bewegen");
  //Server muss bei jedem Klick abfragen ob Zug möglich Ist
  for(var i=playerID*4+1; i<=playerID*4+4;i++) {
    if(homeArray[i-1] >= playerID*4+1 && homeArray[i-1] <= playerID*4+4){
      //6 Gewürfelt(kein Zug möglich)->ausgewählte FigurID aus home auf Startfeld
      if(lastDice == 6 && gamefieldArray[playerID*10] == 0) {
        console.log("6 Gewürfelt, Startfeld frei!");
        //Spielfigur auf erstes Feld stellen
        gamefieldArray[playerID*10] = figureID;
        homeArray[id-1] = 0;
        for(var i=0; i<16;i++){
          console.log("Homefeld "+i+" steht Figur "+homeArray[i]);
        }
        console.log("Figur "+figureID+" hat Home erfolgreich verlassen, steht auf "+playerID*10);
        res.end("0");
      }
      else if(lastDice !=6){
        console.log("Keine 6 gewürfelt");
        res.end("3");
      }
    }else{
      console.log("Figur in falschem Home");
    }
  }
  if((gamefieldArray[playerID*10]>=playerID*4+1) && (gamefieldArray[playerID*10]<=playerID*4+4)){
    console.log("Fehler: Eigene Figur auf Startfeld!");
    res.end("1");
  }
  else{
    console.log("Fremde Figur auf Startfeld!")
    res.end("2");
  }

});
//******************************************************************************
//*******************************************Ermitteln des Gewinners******************************************
app.put('/spielzug/gewinner',bodyParser.urlencoded({extended:true}),function(req,res){
  var id = req.body.id;
  var winner = true;
  var playerID = String(id);

  for(var i=playerID*4; i<playerID*4+4; i++){
    if(goalArray[i] == 0){
      console.log("Noch kein Gewinner, da Goal nicht voll!"+i);
      winner = false;
    }
  }
  //Alle Figuren in Goal -> Übergebener Player ist gewinner
  if(winner) {
    console.log("Player: " + playerID + " hat gewonnen");
    res.end(playerID);
  }
  else{
    res.end("false");
  }
});
//******************************************************************************
//*******************************************Spielzuglogik in Goal********************************************
app.put('/spielzug/goal',bodyParser.urlencoded({extended:true}) ,function(req,res){
  var id = req.body.id;
  var figureID = String(id);
  var currentGoalPosition;
  playerID = getPlayerID(figureID);

  //Figur in Goal suchen und Position speichern
  for(var i=playerID*4; i<playerID*4+4; i++){
    if(goalArray[i]==figureID){
      console.log("Figur gefunden: " + goalArray[i]);
      currentGoalPosition=i;
    }
  };

  //Überprüfung des Zugs von aktueller Position bis Zielposition
  for(var i=currentGoalPosition+1; i<=currentGoalPosition+lastDice; i++){
    //Nicht frei: fehler
    if(goalArray[i] != 0){
      console.log("FALSE: CurrPos: "+currentGoalPosition+" lastDice: "+lastDice);
      res.end("false");
    }
  }
  //Figur darf nicht über Goalgrenze hinaus
  if(currentGoalPosition+lastDice > playerID*4+3){
    console.log("Figur geht über Goal hinaus");
    res.end("false");
  }
  //Bei Erfolg alte Position zurücksetzen und neue setzen
  else{
    goalArray[currentGoalPosition] = 0;
    goalArray[currentGoalPosition+lastDice] = figureID;
    res.end("true");
  }
});
//******************************************************************************
//*********************************************Anzeige der Regeln*********************************************
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
//**************************************Anzahl der Würfelwürfe ermitteln**************************************
app.put('/dice/number',bodyParser.urlencoded({extended:true}),function(req,res){
  var id = req.body.id;
  var playerID = String(id);
  homeCount = 0;
  //DEBUG:
  // for(var i = 0; i<homeArray.length; i++){
  //   console.log("An Homeposition "+i+ " steht Figur "+ homeArray[i]);
  // }
  //Sind alle 4 Figuren in der Basis des gewählten Spielers, darf er 3 Mal würfeln
  for(var i=playerID*4; i<playerID*4+4; i++) {
    if(homeArray[i] != 0) {
      console.log("Figur "+i+" in Home!");
      homeCount++;
    }
    if(homeCount == 4) {
      console.log("Dice Amount: 3 wenn Homecount == 4");
      res.end("3");
    }
  }

  console.log("Wie viele Figuren hat Spieler " + playerID + " in seinem Haus? Anzahl: " + homeCount);
    if(goalArray[(playerID+1)*4-1] != 0 && goalArray[(playerID+1)*4-2] == 0 && goalArray[(playerID+1)*4-3] == 0 && goalArray[(playerID+1)*4-4] == 0 && homeCount == 3){
          console.log("Dice Amount: 3 wenn nur das letzte Goal Feld besetzt ist");
          res.end("3");
    }else if(goalArray[(playerID+1)*4-1] != 0 && goalArray[(playerID+1)*4-2] != 0 && goalArray[(playerID+1)*4-3] == 0 && goalArray[(playerID+1)*4-4] == 0 && homeCount == 2){
          console.log("Dice Amount: 3 wennn nur die letzten beiden Felder besetzt sind");
          res.end("3")
    }else if(goalArray[(playerID+1)*4-1] != 0 && goalArray[(playerID+1)*4-2] != 0 && goalArray[(playerID+1)*4-3] != 0 && goalArray[(playerID+1)*4-4] == 0 && homeCount == 1){
          console.log("Dice Amount: 3 wenn die letzten drei Felder besetzt sind");
          res.end("3");
    //Ansonsten darf er nur 1 Mal würfeln
    }else {
      console.log("Dice Amount: 1 wenn kein Fall davor eintritt");
      res.end("1");
    }
});
//******************************************************************************
//****************************************Würfelfunktion inkl. Ausgabe****************************************
app.get('/dice',function (req,res){
    dice();
    console.log("Es wurde eine "+lastDice+" gewürfelt");
    res.end(lastDice.toString());
});

//Würfelfunktion
function dice() {
  lastDice = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
  //lastDice = 6;
}

app.post('/spielfigur',jsonParser,function (req,res) {
  console.log("Spieler "+playerCount+" verbunden");
  if(playerCount<4){
    playerCount++;
    res.end("true");
  }else{
    res.end("false"); //spiel bereits gestartet
  }
});
//******************************************************************************
//*********************************PlayerID aus Übergebenen Werten berechnen**********************************
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
//******************************************************************************
//*****************************************Zurücksetzen des Spiels********************************************
app.put('/gamefield/reset',function (req,res){
  resetGame();
  playerCount = 0;
  lastDice = 0;
  res.end();
});

function resetGame() {
  //Spielfeld Array: 0 = frei; 1-16 FigurenID
  for(var i=0; i<gamefieldArray.length; i++) {
    gamefieldArray[i] = 0;
  }
  //Goalarray auf leere Felder setzen
  for(var i=0; i<goalArray.length; i++) {
    goalArray[i] = 0;
  }
  //Homearray mit FigurenIDs füllen
  for(var i=0; i<homeArray.length; i++) {
    homeArray[i] = i+1;
  }
  console.log("Server reset");
  gamefieldArray[16] = 10;
  goalArray[9] = 11;
  lastDice = 6;

}
