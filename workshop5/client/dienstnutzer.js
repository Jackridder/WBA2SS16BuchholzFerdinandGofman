var http = require('http');
var express = require('express');
var app = express();

//var io = require('socket.io').listen(3000);
var socketDienstnutzer = require('socket.io-client')('http://localhost:3000');
//var socketDienstnutzer = io.connect('http://localhost');

socketDienstnutzer.on('gameStart',function(data){
  console.log(data);
  socketDienstnutzer.emit('my other event', {my: 'data'});
});


app.listen(3001,function(){
    console.log("Server is running on 3001");
});
