const electronDownload = require('electron-download');
const extract = require('extract-zip');
const path = require('path');

console.log(`Beginning Electron download...`);
electronDownload({
	version: '1.7.9',
	cache: './tmp/zips'
}, function(err, zipPath) {
	console.log(`Electron downloaded at ${zipPath}`);
	console.log(`Extracting Electron...`);
	extract(zipPath, { dir: path.join(__dirname, './tmp/electron-original') }, function(err) {
		if (err) {
			console.log(err);
			return;
		}
		extract(zipPath, { dir: path.join(__dirname, './tmp/electron-snapshot') }, function(err) {
			if (err) {
				console.log(err);
				return;
			}
			console.log(`Electron extracted.`);
		});
	});
});
