/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "child_process", "vs/base/common/winjs.base", "vs/base/common/objects", "vs/platform/environment/node/argv", "vs/platform/node/product", "vs/platform/node/package", "path", "os", "fs", "vs/base/node/pfs", "vs/base/node/ports", "vs/base/node/encoding", "iconv-lite", "vs/base/node/extfs", "vs/base/common/platform"], function (require, exports, child_process_1, winjs_base_1, objects_1, argv_1, product_1, package_1, paths, os, fs, pfs_1, ports_1, encoding_1, iconv, extfs_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function shouldSpawnCliProcess(argv) {
        return !!argv['install-source']
            || !!argv['list-extensions']
            || !!argv['install-extension']
            || !!argv['uninstall-extension'];
    }
    function main(argv) {
        return __awaiter(this, void 0, winjs_base_1.TPromise, function () {
            var _this = this;
            var args, mainCli, source, target, targetMode, restoreMode, data, env, processCallbacks, verbose, stdinWithoutTty, readFromStdin, stdinFilePath_1, stdinFileError, stdinFileStream_1, waitMarkerFilePath_1, waitMarkerError, randomTmpFile, portMain_1, portRenderer_1, portExthost_1, filenamePrefix_1, match, options, child_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        try {
                            args = argv_1.parseCLIProcessArgv(argv);
                        }
                        catch (err) {
                            console.error(err.message);
                            return [2 /*return*/, winjs_base_1.TPromise.as(null)];
                        }
                        if (!args.help) return [3 /*break*/, 1];
                        console.log(argv_1.buildHelpMessage(product_1.default.nameLong, product_1.default.applicationName, package_1.default.version));
                        return [3 /*break*/, 9];
                    case 1:
                        if (!args.version) return [3 /*break*/, 2];
                        console.log(package_1.default.version + "\n" + product_1.default.commit + "\n" + process.arch);
                        return [3 /*break*/, 9];
                    case 2:
                        if (!shouldSpawnCliProcess(args)) return [3 /*break*/, 3];
                        mainCli = new winjs_base_1.TPromise(function (c) { return require(['vs/code/node/cliProcessMain'], c); });
                        return [2 /*return*/, mainCli.then(function (cli) { return cli.main(args); })];
                    case 3:
                        if (!args['file-write']) return [3 /*break*/, 4];
                        source = args._[0];
                        target = args._[1];
                        // Validate
                        if (!source || !target || source === target || // make sure source and target are provided and are not the same
                            !paths.isAbsolute(source) || !paths.isAbsolute(target) || // make sure both source and target are absolute paths
                            !fs.existsSync(source) || !fs.statSync(source).isFile() || // make sure source exists as file
                            !fs.existsSync(target) || !fs.statSync(target).isFile() // make sure target exists as file
                        ) {
                            return [2 /*return*/, winjs_base_1.TPromise.wrapError(new Error('Using --file-write with invalid arguments.'))];
                        }
                        try {
                            targetMode = void 0;
                            restoreMode = false;
                            if (!!args['file-chmod']) {
                                targetMode = fs.statSync(target).mode;
                                if (!(targetMode & 128) /* readonly */) {
                                    fs.chmodSync(target, targetMode | 128);
                                    restoreMode = true;
                                }
                            }
                            data = fs.readFileSync(source);
                            try {
                                extfs_1.writeFileAndFlushSync(target, data);
                            }
                            catch (error) {
                                // On Windows and if the file exists with an EPERM error, we try a different strategy of saving the file
                                // by first truncating the file and then writing with r+ mode. This helps to save hidden files on Windows
                                // (see https://github.com/Microsoft/vscode/issues/931)
                                if (platform_1.isWindows && error.code === 'EPERM') {
                                    fs.truncateSync(target, 0);
                                    extfs_1.writeFileAndFlushSync(target, data, { flag: 'r+' });
                                }
                                else {
                                    throw error;
                                }
                            }
                            // Restore previous mode as needed
                            if (restoreMode) {
                                fs.chmodSync(target, targetMode);
                            }
                        }
                        catch (error) {
                            return [2 /*return*/, winjs_base_1.TPromise.wrapError(new Error("Using --file-write resulted in an error: " + error))];
                        }
                        return [2 /*return*/, winjs_base_1.TPromise.as(null)];
                    case 4:
                        env = objects_1.assign({}, process.env, {
                            'VSCODE_CLI': '1',
                            'ELECTRON_NO_ATTACH_CONSOLE': '1'
                        });
                        delete env['ELECTRON_RUN_AS_NODE'];
                        processCallbacks = [];
                        verbose = args.verbose || args.status || typeof args['upload-logs'] !== 'undefined';
                        if (verbose) {
                            env['ELECTRON_ENABLE_LOGGING'] = '1';
                            processCallbacks.push(function (child) {
                                child.stdout.on('data', function (data) { return console.log(data.toString('utf8').trim()); });
                                child.stderr.on('data', function (data) { return console.log(data.toString('utf8').trim()); });
                                return new winjs_base_1.TPromise(function (c) { return child.once('exit', function () { return c(null); }); });
                            });
                        }
                        stdinWithoutTty = void 0;
                        try {
                            stdinWithoutTty = !process.stdin.isTTY; // Via https://twitter.com/MylesBorins/status/782009479382626304
                        }
                        catch (error) {
                            // Windows workaround for https://github.com/nodejs/node/issues/11656
                        }
                        readFromStdin = args._.some(function (a) { return a === '-'; });
                        if (readFromStdin) {
                            // remove the "-" argument when we read from stdin
                            args._ = args._.filter(function (a) { return a !== '-'; });
                            argv = argv.filter(function (a) { return a !== '-'; });
                        }
                        if (stdinWithoutTty) {
                            // Read from stdin: we require a single "-" argument to be passed in order to start reading from
                            // stdin. We do this because there is no reliable way to find out if data is piped to stdin. Just
                            // checking for stdin being connected to a TTY is not enough (https://github.com/Microsoft/vscode/issues/40351)
                            if (args._.length === 0 && readFromStdin) {
                                // prepare temp file to read stdin to
                                stdinFilePath_1 = paths.join(os.tmpdir(), "code-stdin-" + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 3) + ".txt");
                                stdinFileError = void 0;
                                try {
                                    stdinFileStream_1 = fs.createWriteStream(stdinFilePath_1);
                                }
                                catch (error) {
                                    stdinFileError = error;
                                }
                                if (!stdinFileError) {
                                    // Pipe into tmp file using terminals encoding
                                    encoding_1.resolveTerminalEncoding(verbose).done(function (encoding) {
                                        var converterStream = iconv.decodeStream(encoding);
                                        process.stdin.pipe(converterStream).pipe(stdinFileStream_1);
                                    });
                                    // Make sure to open tmp file
                                    argv.push(stdinFilePath_1);
                                    // Enable --wait to get all data and ignore adding this to history
                                    argv.push('--wait');
                                    argv.push('--skip-add-to-recently-opened');
                                    args.wait = true;
                                }
                                if (verbose) {
                                    if (stdinFileError) {
                                        console.error("Failed to create file to read via stdin: " + stdinFileError.toString());
                                    }
                                    else {
                                        console.log("Reading from stdin via: " + stdinFilePath_1);
                                    }
                                }
                            }
                            else if (args._.length === 0) {
                                processCallbacks.push(function (child) { return new winjs_base_1.TPromise(function (c) {
                                    var dataListener = function () {
                                        if (platform_1.isWindows) {
                                            console.log("Run with '" + product_1.default.applicationName + " -' to read output from another program (e.g. 'echo Hello World | " + product_1.default.applicationName + " -').");
                                        }
                                        else {
                                            console.log("Run with '" + product_1.default.applicationName + " -' to read from stdin (e.g. 'ps aux | grep code | " + product_1.default.applicationName + " -').");
                                        }
                                        c(void 0);
                                    };
                                    // wait for 1s maximum...
                                    setTimeout(function () {
                                        process.stdin.removeListener('data', dataListener);
                                        c(void 0);
                                    }, 1000);
                                    // ...but finish early if we detect data
                                    process.stdin.once('data', dataListener);
                                }); });
                            }
                        }
                        if (args.wait) {
                            waitMarkerError = void 0;
                            randomTmpFile = paths.join(os.tmpdir(), Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10));
                            try {
                                fs.writeFileSync(randomTmpFile, '');
                                waitMarkerFilePath_1 = randomTmpFile;
                                argv.push('--waitMarkerFilePath', waitMarkerFilePath_1);
                            }
                            catch (error) {
                                waitMarkerError = error;
                            }
                            if (verbose) {
                                if (waitMarkerError) {
                                    console.error("Failed to create marker file for --wait: " + waitMarkerError.toString());
                                }
                                else {
                                    console.log("Marker file for --wait created: " + waitMarkerFilePath_1);
                                }
                            }
                        }
                        if (!args['prof-startup']) return [3 /*break*/, 8];
                        return [4 /*yield*/, ports_1.findFreePort(9222, 10, 6000)];
                    case 5:
                        portMain_1 = _a.sent();
                        return [4 /*yield*/, ports_1.findFreePort(portMain_1 + 1, 10, 6000)];
                    case 6:
                        portRenderer_1 = _a.sent();
                        return [4 /*yield*/, ports_1.findFreePort(portRenderer_1 + 1, 10, 6000)];
                    case 7:
                        portExthost_1 = _a.sent();
                        if (!portMain_1 || !portRenderer_1 || !portExthost_1) {
                            console.error('Failed to find free ports for profiler to connect to do.');
                            return [2 /*return*/];
                        }
                        filenamePrefix_1 = paths.join(os.homedir(), Math.random().toString(16).slice(-4));
                        argv.push("--inspect-brk=" + portMain_1);
                        argv.push("--remote-debugging-port=" + portRenderer_1);
                        argv.push("--inspect-brk-extensions=" + portExthost_1);
                        argv.push("--prof-startup-prefix", filenamePrefix_1);
                        argv.push("--no-cached-data");
                        fs.writeFileSync(filenamePrefix_1, argv.slice(-6).join('|'));
                        processCallbacks.push(function (child) { return __awaiter(_this, void 0, void 0, function () {
                            var profiler, main, renderer, extHost, profileMain, profileRenderer, profileExtHost, suffix;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, new Promise(function (resolve_1, reject_1) { require(['v8-inspect-profiler'], resolve_1, reject_1); })];
                                    case 1:
                                        profiler = _a.sent();
                                        return [4 /*yield*/, profiler.startProfiling({ port: portMain_1 })];
                                    case 2:
                                        main = _a.sent();
                                        return [4 /*yield*/, profiler.startProfiling({ port: portRenderer_1, tries: 200 })];
                                    case 3:
                                        renderer = _a.sent();
                                        return [4 /*yield*/, profiler.startProfiling({ port: portExthost_1, tries: 300 })];
                                    case 4:
                                        extHost = _a.sent();
                                        // wait for the renderer to delete the
                                        // marker file
                                        pfs_1.whenDeleted(filenamePrefix_1);
                                        return [4 /*yield*/, main.stop()];
                                    case 5:
                                        profileMain = _a.sent();
                                        return [4 /*yield*/, renderer.stop()];
                                    case 6:
                                        profileRenderer = _a.sent();
                                        return [4 /*yield*/, extHost.stop()];
                                    case 7:
                                        profileExtHost = _a.sent();
                                        suffix = '';
                                        if (!process.env['VSCODE_DEV']) {
                                            // when running from a not-development-build we remove
                                            // absolute filenames because we don't want to reveal anything
                                            // about users. We also append the `.txt` suffix to make it
                                            // easier to attach these files to GH issues
                                            profileMain = profiler.rewriteAbsolutePaths(profileMain, 'piiRemoved');
                                            profileRenderer = profiler.rewriteAbsolutePaths(profileRenderer, 'piiRemoved');
                                            profileExtHost = profiler.rewriteAbsolutePaths(profileExtHost, 'piiRemoved');
                                            suffix = '.txt';
                                        }
                                        // finally stop profiling and save profiles to disk
                                        return [4 /*yield*/, profiler.writeProfile(profileMain, filenamePrefix_1 + "-main.cpuprofile" + suffix)];
                                    case 8:
                                        // finally stop profiling and save profiles to disk
                                        _a.sent();
                                        return [4 /*yield*/, profiler.writeProfile(profileRenderer, filenamePrefix_1 + "-renderer.cpuprofile" + suffix)];
                                    case 9:
                                        _a.sent();
                                        return [4 /*yield*/, profiler.writeProfile(profileExtHost, filenamePrefix_1 + "-exthost.cpuprofile" + suffix)];
                                    case 10:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        _a.label = 8;
                    case 8:
                        if (args['js-flags']) {
                            match = /max_old_space_size=(\d+)/g.exec(args['js-flags']);
                            if (match && !args['max-memory']) {
                                argv.push("--max-memory=" + match[1]);
                            }
                        }
                        options = {
                            detached: true,
                            env: env
                        };
                        if (typeof args['upload-logs'] !== undefined) {
                            options['stdio'] = ['pipe', 'pipe', 'pipe'];
                        }
                        else if (!verbose) {
                            options['stdio'] = 'ignore';
                        }
                        child_1 = child_process_1.spawn(process.execPath, argv.slice(2), options);
                        if (args.wait && waitMarkerFilePath_1) {
                            return [2 /*return*/, new winjs_base_1.TPromise(function (c) {
                                    // Complete when process exits
                                    child_1.once('exit', function () { return c(null); });
                                    // Complete when wait marker file is deleted
                                    pfs_1.whenDeleted(waitMarkerFilePath_1).done(c, c);
                                }).then(function () {
                                    // Make sure to delete the tmp stdin file if we have any
                                    if (stdinFilePath_1) {
                                        fs.unlinkSync(stdinFilePath_1);
                                    }
                                })];
                        }
                        return [2 /*return*/, winjs_base_1.TPromise.join(processCallbacks.map(function (callback) { return callback(child_1); }))];
                    case 9: return [2 /*return*/, winjs_base_1.TPromise.as(null)];
                }
            });
        });
    }
    exports.main = main;
    function eventuallyExit(code) {
        setTimeout(function () { return process.exit(code); }, 0);
    }
    main(process.argv)
        .then(function () { return eventuallyExit(0); })
        .then(null, function (err) {
        console.error(err.message || err.stack || err);
        eventuallyExit(1);
    });
});
