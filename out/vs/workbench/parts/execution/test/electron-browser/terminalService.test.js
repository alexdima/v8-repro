/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/parts/execution/electron-browser/terminalService", "vs/workbench/parts/execution/electron-browser/terminal"], function (require, exports, assert_1, terminalService_1, terminal_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Execution - TerminalService', function () {
        var mockOnExit;
        var mockOnError;
        var mockConfig;
        setup(function () {
            mockConfig = {
                terminal: {
                    explorerKind: 'external',
                    external: {
                        windowsExec: 'testWindowsShell',
                        osxExec: 'testOSXShell',
                        linuxExec: 'testLinuxShell'
                    }
                }
            };
            mockOnExit = function (s) { return s; };
            mockOnError = function (e) { return e; };
        });
        test("WinTerminalService - uses terminal from configuration", function (done) {
            var testShell = 'cmd';
            var testCwd = 'path/to/workspace';
            var mockSpawner = {
                spawn: function (command, args, opts) {
                    // assert
                    assert_1.equal(command, testShell, 'shell should equal expected');
                    assert_1.equal(args[args.length - 1], mockConfig.terminal.external.windowsExec, 'terminal should equal expected');
                    assert_1.equal(opts.cwd, testCwd, 'opts.cwd should equal expected');
                    done();
                    return {
                        on: function (evt) { return evt; }
                    };
                }
            };
            var testService = new terminalService_1.WinTerminalService(mockConfig);
            testService.spawnTerminal(mockSpawner, mockConfig, testShell, testCwd, mockOnExit, mockOnError);
        });
        test("WinTerminalService - uses default terminal when configuration.terminal.external.windowsExec is undefined", function (done) {
            var testShell = 'cmd';
            var testCwd = 'path/to/workspace';
            var mockSpawner = {
                spawn: function (command, args, opts) {
                    // assert
                    assert_1.equal(args[args.length - 1], terminal_1.getDefaultTerminalWindows(), 'terminal should equal expected');
                    done();
                    return {
                        on: function (evt) { return evt; }
                    };
                }
            };
            mockConfig.terminal.external.windowsExec = undefined;
            var testService = new terminalService_1.WinTerminalService(mockConfig);
            testService.spawnTerminal(mockSpawner, mockConfig, testShell, testCwd, mockOnExit, mockOnError);
        });
        test("WinTerminalService - uses default terminal when configuration.terminal.external.windowsExec is undefined", function (done) {
            var testShell = 'cmd';
            var testCwd = 'c:/foo';
            var mockSpawner = {
                spawn: function (command, args, opts) {
                    // assert
                    assert_1.equal(opts.cwd, 'C:/foo', 'cwd should be uppercase regardless of the case that\'s passed in');
                    done();
                    return {
                        on: function (evt) { return evt; }
                    };
                }
            };
            var testService = new terminalService_1.WinTerminalService(mockConfig);
            testService.spawnTerminal(mockSpawner, mockConfig, testShell, testCwd, mockOnExit, mockOnError);
        });
        test("WinTerminalService - cmder should be spawned differently", function (done) {
            var testShell = 'cmd';
            mockConfig.terminal.external.windowsExec = 'cmder';
            var testCwd = 'c:/foo';
            var mockSpawner = {
                spawn: function (command, args, opts) {
                    // assert
                    assert_1.deepEqual(args, ['C:/foo']);
                    assert_1.equal(opts, undefined);
                    done();
                    return { on: function (evt) { return evt; } };
                }
            };
            var testService = new terminalService_1.WinTerminalService(mockConfig);
            testService.spawnTerminal(mockSpawner, mockConfig, testShell, testCwd, mockOnExit, mockOnError);
        });
        test("MacTerminalService - uses terminal from configuration", function (done) {
            var testCwd = 'path/to/workspace';
            var mockSpawner = {
                spawn: function (command, args, opts) {
                    // assert
                    assert_1.equal(args[1], mockConfig.terminal.external.osxExec, 'terminal should equal expected');
                    done();
                    return {
                        on: function (evt) { return evt; }
                    };
                }
            };
            var testService = new terminalService_1.MacTerminalService(mockConfig);
            testService.spawnTerminal(mockSpawner, mockConfig, testCwd, mockOnExit, mockOnError);
        });
        test("MacTerminalService - uses default terminal when configuration.terminal.external.osxExec is undefined", function (done) {
            var testCwd = 'path/to/workspace';
            var mockSpawner = {
                spawn: function (command, args, opts) {
                    // assert
                    assert_1.equal(args[1], terminal_1.DEFAULT_TERMINAL_OSX, 'terminal should equal expected');
                    done();
                    return {
                        on: function (evt) { return evt; }
                    };
                }
            };
            mockConfig.terminal.external.osxExec = undefined;
            var testService = new terminalService_1.MacTerminalService(mockConfig);
            testService.spawnTerminal(mockSpawner, mockConfig, testCwd, mockOnExit, mockOnError);
        });
        test("LinuxTerminalService - uses terminal from configuration", function (done) {
            var testCwd = 'path/to/workspace';
            var mockSpawner = {
                spawn: function (command, args, opts) {
                    // assert
                    assert_1.equal(command, mockConfig.terminal.external.linuxExec, 'terminal should equal expected');
                    assert_1.equal(opts.cwd, testCwd, 'opts.cwd should equal expected');
                    done();
                    return {
                        on: function (evt) { return evt; }
                    };
                }
            };
            var testService = new terminalService_1.LinuxTerminalService(mockConfig);
            testService.spawnTerminal(mockSpawner, mockConfig, testCwd, mockOnExit, mockOnError);
        });
        test("LinuxTerminalService - uses default terminal when configuration.terminal.external.linuxExec is undefined", function (done) {
            terminal_1.getDefaultTerminalLinuxReady().then(function (defaultTerminalLinux) {
                var testCwd = 'path/to/workspace';
                var mockSpawner = {
                    spawn: function (command, args, opts) {
                        // assert
                        assert_1.equal(command, defaultTerminalLinux, 'terminal should equal expected');
                        done();
                        return {
                            on: function (evt) { return evt; }
                        };
                    }
                };
                mockConfig.terminal.external.linuxExec = undefined;
                var testService = new terminalService_1.LinuxTerminalService(mockConfig);
                testService.spawnTerminal(mockSpawner, mockConfig, testCwd, mockOnExit, mockOnError);
            });
        });
    });
});
