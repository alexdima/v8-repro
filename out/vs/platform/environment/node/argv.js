/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "minimist", "assert", "vs/base/common/arrays", "vs/nls", "vs/base/common/platform", "vs/platform/node/product"], function (require, exports, os, minimist, assert, arrays_1, nls_1, platform_1, product_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var options = {
        string: [
            'locale',
            'user-data-dir',
            'extensions-dir',
            'extensionDevelopmentPath',
            'extensionTestsPath',
            'install-extension',
            'uninstall-extension',
            'debugId',
            'debugPluginHost',
            'debugBrkPluginHost',
            'debugSearch',
            'debugBrkSearch',
            'enable-proposed-api',
            'export-default-configuration',
            'install-source',
            'upload-logs'
        ],
        boolean: [
            'help',
            'version',
            'wait',
            'diff',
            'add',
            'goto',
            'new-window',
            'unity-launch',
            'reuse-window',
            'open-url',
            'performance',
            'prof-startup',
            'verbose',
            'logExtensionHostCommunication',
            'disable-extensions',
            'list-extensions',
            'show-versions',
            'nolazy',
            'issue',
            'skip-getting-started',
            'skip-release-notes',
            'sticky-quickopen',
            'disable-restore-windows',
            'disable-telemetry',
            'disable-updates',
            'disable-crash-reporter',
            'skip-add-to-recently-opened',
            'status',
            'file-write',
            'file-chmod'
        ],
        alias: {
            add: 'a',
            help: 'h',
            version: 'v',
            wait: 'w',
            diff: 'd',
            goto: 'g',
            status: 's',
            'new-window': 'n',
            'reuse-window': 'r',
            performance: 'p',
            'disable-extensions': 'disableExtensions',
            'extensions-dir': 'extensionHomePath',
            'debugPluginHost': 'inspect-extensions',
            'debugBrkPluginHost': 'inspect-brk-extensions',
            'debugSearch': 'inspect-search',
            'debugBrkSearch': 'inspect-brk-search',
        }
    };
    function validate(args) {
        if (args.goto) {
            args._.forEach(function (arg) { return assert(/^(\w:)?[^:]+(:\d*){0,2}$/.test(arg), nls_1.localize('gotoValidation', "Arguments in `--goto` mode should be in the format of `FILE(:LINE(:CHARACTER))`.")); });
        }
        return args;
    }
    function stripAppPath(argv) {
        var index = arrays_1.firstIndex(argv, function (a) { return !/^-/.test(a); });
        if (index > -1) {
            return argv.slice(0, index).concat(argv.slice(index + 1));
        }
        return undefined;
    }
    /**
     * Use this to parse raw code process.argv such as: `Electron . --verbose --wait`
     */
    function parseMainProcessArgv(processArgv) {
        var args = processArgv.slice(1);
        // If dev, remove the first non-option argument: it's the app location
        if (process.env['VSCODE_DEV']) {
            args = stripAppPath(args);
        }
        return validate(parseArgs(args));
    }
    exports.parseMainProcessArgv = parseMainProcessArgv;
    /**
     * Use this to parse raw code CLI process.argv such as: `Electron cli.js . --verbose --wait`
     */
    function parseCLIProcessArgv(processArgv) {
        var args = processArgv.slice(2);
        if (process.env['VSCODE_DEV']) {
            args = stripAppPath(args);
        }
        return validate(parseArgs(args));
    }
    exports.parseCLIProcessArgv = parseCLIProcessArgv;
    /**
     * Use this to parse code arguments such as `--verbose --wait`
     */
    function parseArgs(args) {
        return minimist(args, options);
    }
    exports.parseArgs = parseArgs;
    var optionsHelp = {
        '-d, --diff <file> <file>': nls_1.localize('diff', "Compare two files with each other."),
        '-a, --add <dir>': nls_1.localize('add', "Add folder(s) to the last active window."),
        '-g, --goto <file:line[:character]>': nls_1.localize('goto', "Open a file at the path on the specified line and character position."),
        '-n, --new-window': nls_1.localize('newWindow', "Force to open a new window."),
        '-r, --reuse-window': nls_1.localize('reuseWindow', "Force to open a file or folder in the last active window."),
        '-w, --wait': nls_1.localize('wait', "Wait for the files to be closed before returning."),
        '--locale <locale>': nls_1.localize('locale', "The locale to use (e.g. en-US or zh-TW)."),
        '--user-data-dir <dir>': nls_1.localize('userDataDir', "Specifies the directory that user data is kept in. Can be used to open multiple distinct instances of Code."),
        '-v, --version': nls_1.localize('version', "Print version."),
        '-h, --help': nls_1.localize('help', "Print usage.")
    };
    var extensionsHelp = {
        '--extensions-dir <dir>': nls_1.localize('extensionHomePath', "Set the root path for extensions."),
        '--list-extensions': nls_1.localize('listExtensions', "List the installed extensions."),
        '--show-versions': nls_1.localize('showVersions', "Show versions of installed extensions, when using --list-extension."),
        '--install-extension (<extension-id> | <extension-vsix-path>)': nls_1.localize('installExtension', "Installs an extension."),
        '--uninstall-extension (<extension-id> | <extension-vsix-path>)': nls_1.localize('uninstallExtension', "Uninstalls an extension."),
        '--enable-proposed-api <extension-id>': nls_1.localize('experimentalApis', "Enables proposed api features for an extension.")
    };
    var troubleshootingHelp = {
        '--verbose': nls_1.localize('verbose', "Print verbose output (implies --wait)."),
        '--log <level>': nls_1.localize('log', "Log level to use. Default is 'info'. Allowed values are 'critical', 'error', 'warn', 'info', 'debug', 'trace', 'off'."),
        '-s, --status': nls_1.localize('status', "Print process usage and diagnostics information."),
        '-p, --performance': nls_1.localize('performance', "Start with the 'Developer: Startup Performance' command enabled."),
        '--prof-startup': nls_1.localize('prof-startup', "Run CPU profiler during startup"),
        '--disable-extensions': nls_1.localize('disableExtensions', "Disable all installed extensions."),
        '--inspect-extensions': nls_1.localize('inspect-extensions', "Allow debugging and profiling of extensions. Check the developer tools for the connection uri."),
        '--inspect-brk-extensions': nls_1.localize('inspect-brk-extensions', "Allow debugging and profiling of extensions with the extension host being paused after start. Check the developer tools for the connection uri."),
        '--disable-gpu': nls_1.localize('disableGPU', "Disable GPU hardware acceleration."),
        '--upload-logs': nls_1.localize('uploadLogs', "Uploads logs from current session to a secure endpoint."),
        '--max-memory': nls_1.localize('maxMemory', "Max memory size for a window (in Mbytes).")
    };
    function formatOptions(options, columns) {
        var keys = Object.keys(options);
        var argLength = Math.max.apply(null, keys.map(function (k) { return k.length; })) + 2 /*left padding*/ + 1 /*right padding*/;
        if (columns - argLength < 25) {
            // Use a condensed version on narrow terminals
            return keys.reduce(function (r, key) { return r.concat(["  " + key, "      " + options[key]]); }, []).join('\n');
        }
        var descriptionColumns = columns - argLength - 1;
        var result = '';
        keys.forEach(function (k) {
            var wrappedDescription = wrapText(options[k], descriptionColumns);
            var keyPadding = ' '.repeat(argLength - k.length - 2 /*left padding*/);
            if (result.length > 0) {
                result += '\n';
            }
            result += '  ' + k + keyPadding + wrappedDescription[0];
            for (var i = 1; i < wrappedDescription.length; i++) {
                result += '\n' + ' '.repeat(argLength) + wrappedDescription[i];
            }
        });
        return result;
    }
    exports.formatOptions = formatOptions;
    function wrapText(text, columns) {
        var lines = [];
        while (text.length) {
            var index = text.length < columns ? text.length : text.lastIndexOf(' ', columns);
            var line = text.slice(0, index).trim();
            text = text.slice(index);
            lines.push(line);
        }
        return lines;
    }
    function buildHelpMessage(fullName, name, version) {
        var columns = process.stdout.isTTY ? process.stdout.columns : 80;
        var executable = "" + name + (os.platform() === 'win32' ? '.exe' : '');
        return fullName + " " + version + "\n\n" + nls_1.localize('usage', "Usage") + ": " + executable + " [" + nls_1.localize('options', "options") + "] [" + nls_1.localize('paths', 'paths') + "...]\n\n" + (platform_1.isWindows ? nls_1.localize('stdinWindows', "To read output from another program, append '-' (e.g. 'echo Hello World | {0} -')", product_1.default.applicationName) : nls_1.localize('stdinUnix', "To read from stdin, append '-' (e.g. 'ps aux | grep code | {0} -')", product_1.default.applicationName)) + "\n\n" + nls_1.localize('optionsUpperCase', "Options") + ":\n" + formatOptions(optionsHelp, columns) + "\n\n" + nls_1.localize('extensionsManagement', "Extensions Management") + ":\n" + formatOptions(extensionsHelp, columns) + "\n\n" + nls_1.localize('troubleshooting', "Troubleshooting") + ":\n" + formatOptions(troubleshootingHelp, columns);
    }
    exports.buildHelpMessage = buildHelpMessage;
});
