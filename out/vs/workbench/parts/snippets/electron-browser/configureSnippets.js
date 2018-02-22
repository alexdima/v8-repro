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
define(["require", "exports", "vs/nls", "vs/platform/commands/common/commands", "vs/base/node/pfs", "vs/platform/environment/common/environment", "vs/editor/common/services/modeService", "vs/platform/quickOpen/common/quickOpen", "vs/platform/windows/common/windows", "path", "vs/platform/actions/common/actions", "vs/base/common/async", "vs/platform/opener/common/opener", "vs/base/common/uri", "vs/workbench/parts/snippets/electron-browser/snippets.contribution", "vs/base/common/map"], function (require, exports, nls, commands_1, pfs_1, environment_1, modeService_1, quickOpen_1, windows_1, path_1, actions_1, async_1, opener_1, uri_1, snippets_contribution_1, map_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    var id = 'workbench.action.openSnippets';
    var ISnippetPick;
    (function (ISnippetPick) {
        function is(thing) {
            return thing && typeof thing.filepath === 'string';
        }
        ISnippetPick.is = is;
    })(ISnippetPick || (ISnippetPick = {}));
    function computePicks(snippetService, envService, modeService) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, future, seen, _i, _a, file, names, _b, _c, snippet, _d, _e, scope, name_1, mode, dir, _f, _g, mode, label;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        existing = [];
                        future = [];
                        seen = new Set();
                        _i = 0;
                        return [4 /*yield*/, snippetService.getSnippetFiles()];
                    case 1:
                        _a = _h.sent();
                        _h.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        file = _a[_i];
                        if (!file.isUserSnippets) {
                            // skip extension snippets
                            return [3 /*break*/, 5];
                        }
                        if (!file.isGlobalSnippets) return [3 /*break*/, 4];
                        return [4 /*yield*/, file.load()];
                    case 3:
                        _h.sent();
                        names = new Set();
                        outer: for (_b = 0, _c = file.data; _b < _c.length; _b++) {
                            snippet = _c[_b];
                            for (_d = 0, _e = snippet.scopes; _d < _e.length; _d++) {
                                scope = _e[_d];
                                name_1 = modeService.getLanguageName(scope);
                                if (names.size >= 4) {
                                    names.add(name_1 + "...");
                                    break outer;
                                }
                                else {
                                    names.add(name_1);
                                }
                            }
                        }
                        existing.push({
                            label: path_1.basename(file.filepath),
                            filepath: file.filepath,
                            description: names.size === 0
                                ? nls.localize('global.scope', "(global)")
                                : nls.localize('global.1', "({0})", map_1.values(names).join(', '))
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        mode = path_1.basename(file.filepath, '.json');
                        existing.push({
                            label: path_1.basename(file.filepath),
                            description: "(" + modeService.getLanguageName(mode) + ")",
                            filepath: file.filepath
                        });
                        seen.add(mode);
                        _h.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 2];
                    case 6:
                        dir = path_1.join(envService.appSettingsHome, 'snippets');
                        for (_f = 0, _g = modeService.getRegisteredModes(); _f < _g.length; _f++) {
                            mode = _g[_f];
                            label = modeService.getLanguageName(mode);
                            if (label && !seen.has(mode)) {
                                future.push({
                                    label: mode,
                                    description: "(" + label + ")",
                                    filepath: path_1.join(dir, mode + ".json"),
                                    hint: true
                                });
                            }
                        }
                        existing.sort(function (a, b) {
                            var a_ext = path_1.extname(a.filepath);
                            var b_ext = path_1.extname(b.filepath);
                            if (a_ext === b_ext) {
                                return a.label.localeCompare(b.label);
                            }
                            else if (a_ext === '.code-snippets') {
                                return -1;
                            }
                            else {
                                return 1;
                            }
                        });
                        future.sort(function (a, b) {
                            return a.label.localeCompare(b.label);
                        });
                        return [2 /*return*/, { existing: existing, future: future }];
                }
            });
        });
    }
    function createGlobalSnippetFile(envService, windowService, opener) {
        return __awaiter(this, void 0, void 0, function () {
            var defaultPath, path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, async_1.timeout(100)];
                    case 1:
                        _a.sent(); // ensure quick pick closes...
                        defaultPath = path_1.join(envService.appSettingsHome, 'snippets');
                        return [4 /*yield*/, windowService.showSaveDialog({
                                defaultPath: defaultPath,
                                filters: [{ name: 'Code Snippets', extensions: ['code-snippets'] }]
                            })];
                    case 2:
                        path = _a.sent();
                        if (!path || path_1.dirname(path) !== defaultPath) {
                            return [2 /*return*/, undefined];
                        }
                        return [4 /*yield*/, pfs_1.writeFile(path, [
                                '{',
                                '\t// Place your global snippets here. Each snippet is defined under a snippet name and has a scope, prefix, body and ',
                                '\t// description. Add comma separated ids of the languages where the snippet is applicable in the scope field. If scope ',
                                '\t// is left empty or omitted, the snippet gets applied to all languages. The prefix is what is ',
                                '\t// used to trigger the snippet and the body will be expanded and inserted. Possible variables are: ',
                                '\t// $1, $2 for tab stops, $0 for the final cursor position, and ${1:label}, ${2:another} for placeholders. ',
                                '\t// Placeholders with the same ids are connected.',
                                '\t// Example:',
                                '\t// "Print to console": {',
                                '\t// \t"scope": "javascript,typescript",',
                                '\t// \t"prefix": "log",',
                                '\t// \t"body": [',
                                '\t// \t\t"console.log(\'$1\');",',
                                '\t// \t\t"$2"',
                                '\t// \t],',
                                '\t// \t"description": "Log output to console"',
                                '\t// }',
                                '}'
                            ].join('\n'))];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, opener.open(uri_1.default.file(path))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function createLanguageSnippetFile(pick) {
        return __awaiter(this, void 0, void 0, function () {
            var contents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, pfs_1.exists(pick.filepath)];
                    case 1:
                        if (_a.sent()) {
                            return [2 /*return*/];
                        }
                        contents = [
                            '{',
                            '\t// Place your snippets for ' + pick.label + ' here. Each snippet is defined under a snippet name and has a prefix, body and ',
                            '\t// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted. Possible variables are:',
                            '\t// $1, $2 for tab stops, $0 for the final cursor position, and ${1:label}, ${2:another} for placeholders. Placeholders with the ',
                            '\t// same ids are connected.',
                            '\t// Example:',
                            '\t// "Print to console": {',
                            '\t// \t"prefix": "log",',
                            '\t// \t"body": [',
                            '\t// \t\t"console.log(\'$1\');",',
                            '\t// \t\t"$2"',
                            '\t// \t],',
                            '\t// \t"description": "Log output to console"',
                            '\t// }',
                            '}'
                        ].join('\n');
                        return [4 /*yield*/, pfs_1.writeFile(pick.filepath, contents)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    commands_1.CommandsRegistry.registerCommand(id, function (accessor) { return __awaiter(_this, void 0, void 0, function () {
        var snippetService, quickOpenService, opener, windowService, modeService, envService, _a, existing, future, newGlobalPick, pick;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    snippetService = accessor.get(snippets_contribution_1.ISnippetsService);
                    quickOpenService = accessor.get(quickOpen_1.IQuickOpenService);
                    opener = accessor.get(opener_1.IOpenerService);
                    windowService = accessor.get(windows_1.IWindowService);
                    modeService = accessor.get(modeService_1.IModeService);
                    envService = accessor.get(environment_1.IEnvironmentService);
                    return [4 /*yield*/, computePicks(snippetService, envService, modeService)];
                case 1:
                    _a = _b.sent(), existing = _a.existing, future = _a.future;
                    newGlobalPick = { label: nls.localize('new.global', "New Global Snippets file...") };
                    if (existing.length > 0) {
                        existing[0].separator = { label: nls.localize('group.global', "Existing Snippets") };
                        newGlobalPick.separator = { border: true, label: nls.localize('new.global.sep', "New Snippets") };
                    }
                    else {
                        newGlobalPick.separator = { label: nls.localize('new.global.sep', "New Snippets") };
                    }
                    return [4 /*yield*/, quickOpenService.pick([].concat(existing, newGlobalPick, future), {
                            placeHolder: nls.localize('openSnippet.pickLanguage', "Select Snippets File or Create Snippets"),
                            matchOnDescription: true
                        })];
                case 2:
                    pick = _b.sent();
                    if (!(pick === newGlobalPick)) return [3 /*break*/, 3];
                    return [2 /*return*/, createGlobalSnippetFile(envService, windowService, opener)];
                case 3:
                    if (!ISnippetPick.is(pick)) return [3 /*break*/, 6];
                    if (!pick.hint) return [3 /*break*/, 5];
                    return [4 /*yield*/, createLanguageSnippetFile(pick)];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5: return [2 /*return*/, opener.open(uri_1.default.file(pick.filepath))];
                case 6: return [2 /*return*/];
            }
        });
    }); });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: id,
            title: { value: nls.localize('openSnippet.label', "Configure User Snippets"), original: 'Preferences: Configure User Snippets' },
            category: nls.localize('preferences', "Preferences")
        }
    });
});
