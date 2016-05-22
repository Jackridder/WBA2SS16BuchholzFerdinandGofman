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
        res.format({
         'image/jpeg':function(){
            res.sendFile('/gamefield.jpg');
        }   
     })    
    res.writeHead(200, "OK");
    res.end();
});

app.get('.',function (req,res) {
        res.format({
         'text/html':function(){
        }   
     })    
    res.writeHead(200, "OK");
    res.sendFile(path.join(__dirname+'./index.html'));
    //res.sendFile('./index.html', function (err){
    //   if(err) {
    //        console.log(err);
    //    }
    //    else{
    //        console.log("Datei geschickt!");
    //    }
    //    res.end();
    //});
});