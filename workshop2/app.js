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
var possibleMoves = Array(56); // 40 Normal + 16 Ende

app.post('/dice',jsonParser,function (req,res){
    curUserId = req.body.id;
    lastDice = Math.round(Math.random() * (6 - 1) + 1);
    res.end(lastDice.toString());
});

app.post('/move',jsonParser,function (req,res){
    if(possibleMoves.contains(req.body.fieldid)) //Falls Spielzug möglich
      possibleMoves.splice(req.body.fieldid,1) // Erlaube Spielzug und entferne aus Möglichen

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

app.get('/spielfigur',function (req,res) {
  switch (req.body.id) {
    case "1":
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
    case "2":
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
    case "3":
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
    case "4":
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
