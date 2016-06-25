alert("test"); /*
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

optionsPOST.path = '/spielfigur';
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
end();*/
