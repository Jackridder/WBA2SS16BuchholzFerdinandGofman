var chalk = require('chalk');

var fs = require('fs');
fs.readFile('wolkenkratzer.json', 'utf-8', function(err, data) {
	if(err){
		return;
	}
	else{
		//Aus data wird ein JSON String
		data = JSON.parse(data);
		//console.log(data);
		for (var i = 0; i < data.wolkenkratzer.length; i++) {
			console.log("Name: " + chalk.green(data.wolkenkratzer[i].name));
			console.log("Stadt: " + chalk.yellow(data.wolkenkratzer[i].stadt));
			console.log("Hoehe: " + chalk.blue(data.wolkenkratzer[i].hoehe + "m"));
			console.log("--------------------");
		}
	}
 });