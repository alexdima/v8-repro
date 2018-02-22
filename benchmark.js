const fs = require('fs');

exports.benchmark = function(nodeRequire, amdRequire) {

	const configuration = {

	};

	// Perf Counters
	global.MonacoEnvironment = {
		onNodeCachedData: [],
		timers: {
			isInitialStartup: false,
			hasAccessibilitySupport: false,
			start: Date.now(),
			windowLoad: Date.now()
		}
	};

	const perf = nodeRequire('./out/vs/base/common/performance');
	perf.mark('renderer/started');
	perf.mark('willLoadWorkbenchMain');
	perf.mark('didLoadWorkbenchMain');
	perf.mark('main/startup');

	let start = Date.now();
	
	amdRequire(['vs/workbench/electron-browser/main'], function() {
		amdRequire('vs/workbench/electron-browser/main')
			.startup(configuration)
			.done(function () {
				let end = Date.now();
				console.log(`STARTUP TOOK ${end - start} ms.`);
			}, function (error) {
				console.error(error);
			});
	});
}
