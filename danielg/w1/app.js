var chalk = require('chalk');
var fs = require('fs');
var filename = '/wolkenkratzer.json';

fs.readFile(__dirname+filename, 'utf8', function(err, data) { 
    if(err){
        console.log(err);
        return;
    }
    data = JSON.parse(data);
    
    data.wolkenkratzer.sort(function (a, b) {
      if (a.hoehe > b.hoehe) {
        return 1;
      }
      if (a.hoehe < b.hoehe) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });
    
    fs.writeFileSync(__dirname+"/wolkenkratzer_sortiert.json",JSON.stringify(data));
    
    for(var i = 0; i < data.wolkenkratzer.length; i++) {
        console.log("Name: "+chalk.blue(data.wolkenkratzer[i].name));
        console.log("Stadt: "+chalk.green(data.wolkenkratzer[i].stadt));
        console.log("Höhe: "+chalk.red(data.wolkenkratzer[i].hoehe));
        console.log("--------------------");
    }
    
});