var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.listen(3000,function(){
    console.log("Server running on 3000");
});

var jsonParser = bodyParser.json();
app.use(jsonParser);

var curUserId = 0;
var lastDice = 0;
var possibleMoves = Array(40); // 40 Normal
var goal;

app.post('/dice',jsonParser,function (req,res){
    curUserId = req.body.id;
    lastDice = Math.round(Math.random() * (6 - 1) + 1);
    res.end(lastDice.toString());
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
      possibleMoves[req.body.fieldif] = 0
      res.end(true);
  }// Erlaube Spielzug und entferne aus Möglichen
  else {
    res.end(false);
  }
});

app.get('/gamefield/home',function (req,res) {
    if(req.body.dice == 6){ // Anfangsfeld überprüfen
      if(possibleMoves[req.body.id*10]){ //Falls Anfangsfeld frei
        res.send(true)
      } else {
        res.send(false);
      }
    }else{
      if(possibleMoves[req.body.fieldid]){
        res.send(true)
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

app.get('/spielfigur',function (req,res) {
  switch (req.body.id) {
    case "0":
                res.sendFile(__dirname+'/spielfigur/figure_red.jpg', function (err){
                   if(err) {
                        console.log(err);
                    }
                    else{
                        console.log("Datei geschickt!");
                    }
                    res.end();
                )};
                break;
    case "1":
                res.sendFile(__dirname+'/spielfigur/figure_blue.jpg', function (err){
                   if(err) {
                        console.log(err);
                    }
                    else{
                        console.log("Datei geschickt!");
                    }
                    res.end();
                )};
                break;
    case "2":
                res.sendFile(__dirname+'/spielfigur/figure_green.jpg', function (err){
                   if(err) {
                        console.log(err);
                    }
                    else{
                        console.log("Datei geschickt!");
                    }
                    res.end();
                )};
                break;
    case "3":
                res.sendFile(__dirname+'/spielfigur/figure_yellow.jpg', function (err){
                   if(err) {
                        console.log(err);
                    }
                    else{
                        console.log("Datei geschickt!");
                    }
                    res.end();
                )};
                break;
};

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



app.get('/',function (req,res) {
    res.sendFile(__dirname+'/index.html', function (err){
       if(err) {
            console.log(err);
        }
        else{
            console.log("Datei geschickt!");
        }
        res.end();
    });
});



var app = require('http');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

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

var clientID;

optionsPOST.path = '/Spielfigur';
var postSpielfigur = http.request(optionsPOST, function(res){
  console.log("Spieler hat sich verbunden");
  res.on('data',function(){
    ClientID = jsonParser(data);
    console.log(res);
  });
});
postSpielfigur.end();

options.path = '/gamefield';
setTimeout(http.request(optionsGET,function(res){
  res.on('data',function()){
    console.log(res);
  }
}), 10000);
end();
