var express = require('express');
var bodyParser = require('body-parser');
var clients = io.sockets.clients().length;
var app = express();-
app.listen(3000,function(){
    console.log("Server running on 3000");
});

var jsonParser = bodyParser.json();
app.use(jsonParser);

if(clients==4){
  app.get('/gamefield', function(req,res)){
    res.sendFile(__dirname+'/gamefield/gamefield.jpg', function(err){
      if(err){
        console.log(err);
        res.status(404).end("Datei nicht gefunden");
      }
      else{
        console.log("Datei geschickt!");
      }
      res.end();
    });
  });
}
else{
  console.log("Es sind bisher nur " + clients + " verbunden!");
  console.log("Spiel startet erst bei genau 4 verbundenen Spielern!");
}
