var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.listen(3000,function(){
    console.log("Server running on 3000");
});

var jsonParser = bodyParser.json();
app.use(jsonParser);

var lastDice = 0;
var possibleMoves = Array(40); // 40 Normal
var goal;
var playerCount = 0;

app.get('/dice',function (req,res){
    lastDice = Math.round(Math.random() * (6 - 1) + 1);
    res.end(lastDice.toString());
});

app.get('/client',function (req,res) {
  res.sendFile(__dirname+'/client/browser.js', function (err){
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
    if(req.body.dice == 6){ // Anfangsfeld überprüfen
      if(possibleMoves[req.body.id*10]){ //Falls Anfangsfeld frei
        res.send(true);
      } else {
        res.send(false);
      }
    }else{
      if(possibleMoves[req.body.fieldid]){
        res.send(true);
      } else {
        res.send(false);
      }
    }
});

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
  res.write(playerCount.toString());
  res.end();
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
