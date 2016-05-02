//Einbinden von "chalk" (Farbe) und "fs" (FileSystem
var chalk = require('chalk');
var fs = require('fs');

//Datei einlesen und anonyme Funktion mit Error-funktion und einer Datei aufrufen
var file = fs.readFile(__dirname+"/wolkenkratzer.json",'utf-8', function (err, data) {
	//Fehler abfangen (Datei nicht lesbar)
	if(err) {
		console.log(err);
		return;
	} else {
		//data in einen JSON String wandeln
		data = JSON.parse(data);
		
		//Automatisches sortieren ASC
		data.wolkenkratzer.sort(function (a,b) {
			if (a.hoehe < b.hoehe) {
				return 1;
			}
			if (a.hoehe > b.hoehe) {
				return -1;
			}
			return 0;
		});
		//strinify als String in Datei (synchron)
		fs.writeFileSync(__dirname+"/wolkenkratzer_sortiert.json", JSON.stringify(data));
		
		//Formatierte Ausgabe der Wolkenkratzer-Daten
		for (var i=0; i<data.wolkenkratzer.length; i++) {
			console.log("Name: " + chalk.blue(data.wolkenkratzer[i].name));
			console.log("Stadt: " + chalk.red(data.wolkenkratzer[i].stadt));
			console.log("Höhe: " + chalk.green(data.wolkenkratzer[i].hoehe + "m"));
			console.log("--------------------");
		}
	}
});
