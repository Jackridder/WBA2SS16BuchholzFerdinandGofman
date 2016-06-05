var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var jsonParser = bodyParser.json;

var blubb = {"gamerules":[
    {"rule": "Es gibt eine Basis wo alle 4 Figuren (je Spieler) versammelt sind"},
    {"rule": "Jeder Spieler hat eine eigene Farbe (wird automatisch zugewiesen im Uhrzeigersinn"}
]};
var fs = require('fs');
app.listen(3000, function(){
	console.log("Server running on 3000");
});

app.get('/', function(req,res){
	res.send("Hallo Welt");
});

app.get('/rules', function(req,res){
	res.setHeader('Content-Type', 'application/json');
 	fs.readFile('rules.json', 'utf-8', function(err, data) {
		if(err){
			return;
		}
		else{
			data = JSON.parse(data);
			for (var i = 0; i < data.gamerules.length; i++) {
				console.log("Regel: " + data.gamerules[i].rule);
				console.log("--------------------");
			}
		}
 	}); 
    res.writeHead(200, "Successful");
    res.end();
 });