var http = require('http');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var data;

function postFigur(){
  var optionsPOST = {
    host: 'localhost',
    port: 3000,
    path: 'leer',
    method: 'POST',
    headers: {
      accept: 'application/json'
    }
  }

  optionsPOST.path = '/spielfigur';

  var postSpielfigur = http.request(optionsPOST, function(res){
    console.log("Spieler hat sich verbunden");
    res.on('data', function(chunk){
        data = chunk;
    });
    res.on('end',function(){
      //getField();
      setInterval(getField, 1000);
    });
    console.log("Ende");
  });
  postSpielfigur.end();
}

postFigur();

function getField(){
  console.log("in GetField");
  var optionsGET = {
    host: 'localhost',
    port: 3000,
    path: 'leer',
    method: 'GET',
    headers: {
      accept: 'application/json'
    }
  }
  optionsGET.path = '/gamefield';
  http.request(optionsGET,function(res){
    console.log("getField");
    res.on('data',function(){
      console.log("getfield: "+res);
      location.reload();
    });
  });
}

function resetGame(){
  console.log("reset");
  var optionsGET = {
    host: 'localhost',
    port: 3000,
    path: 'leer',
    method: 'DELETE',
    headers: {
      accept: 'application/json'
    }
  }
  optionsGET.path = '/spielfigur';
  http.request(optionsGET,function(res){
    console.log("delete spielfigur");
    res.on('data',function(){
      console.log("getfield: "+res);
      document.getElementById("gamecontainer").innerHTML = "test";
    });
  });
}
