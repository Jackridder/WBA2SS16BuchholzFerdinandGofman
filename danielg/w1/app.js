var fs = require('fs');
var filename = '/wolkenkratzer.json';

fs.readFile(__dirname+filename, 'utf8', function(err, data) { 
    if(err){
        console.log(err);
        return;
    }
    data = JSON.parse(data);
    
    for(var i = 0; i < data.wolkenkratzer.length; i++) {
        console.log("Name: "+data.wolkenkratzer[i].name);
        console.log("Stadt: "+data.wolkenkratzer[i].stadt);
        console.log("Höhe: "+data.wolkenkratzer[i].hoehe);
        console.log("--------------------");
    }

});