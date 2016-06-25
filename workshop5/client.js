var clientID;
var app = require('http');
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

optionsPOST.path = '/Spielfigur';
var postSpielfigur = http.request(options, function(res){
  console.log("Spieler hat sich verbunden");
  res.on('data',function(){
    console.log(res);
  });
});
postSpielfigur.end();

options.path = '/gamefield';
setTimeout(http.request(options,function(res){

}), 10000);
end();
