var chalk = require('chalk');
var fs = require('fs');

var file = fs.readFile(__dirname+"/wolkenkratzer.json",'utf-8', function (err, data) {
	if(err) {
		console.log(err);
		return;
	} else {
		data = JSON.parse(data);
		for (var i=0; i<data.wolkenkratzer.length; i++) {
			console.log("Name: " + chalk.blue(data.wolkenkratzer[i].name));
			console.log("Stadt: " + chalk.red(data.wolkenkratzer[i].stadt));
			console.log("Höhe: " + chalk.green(data.wolkenkratzer[i].hoehe + "m"));
			console.log("--------------------");
		}
	}
});
