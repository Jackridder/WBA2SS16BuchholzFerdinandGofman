var fs = require('fs');
fs.readFile('wolkenkratzer.json', 'utf-8', function(err, data) {
	if(err){
		return;
	}
	else{
		data = JSON.parse(data);
		//console.log(data);
		for (var i = 0; i < data.wolkenkratzer.length; i++) {
			console.log("Name: " + data.wolkenkratzer[i].name);
			console.log("Stadt: " + data.wolkenkratzer[i].stadt);
			console.log("Hoehe: " + data.wolkenkratzer[i].hoehe + "m");
			console.log("--------------------");
		}
	}
 });