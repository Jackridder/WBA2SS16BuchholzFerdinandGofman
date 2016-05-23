var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.listen(3000,function(){
    console.log("Server running on 3000");
});

var jsonParser = bodyParser.json();
app.use(jsonParser);

app.post('/dice',jsonParser,function(req,res){
    var id = req.body.id;
    var randNumber = Math.round(Math.random() * (6 - 1) + 1);
    res.end(randNumber.toString());
});

app.get('/gamefield',function (req,res) {
  res.sendFile(__dirname+'/gamefield/gamefield.jpg', function (err){
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
