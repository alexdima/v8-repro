/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/platform", "vs/workbench/parts/output/common/outputLinkComputer", "vs/workbench/test/workbenchTestServices"], function (require, exports, assert, uri_1, platform_1, outputLinkComputer_1, workbenchTestServices_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function toOSPath(p) {
        if (platform_1.isMacintosh || platform_1.isLinux) {
            return p.replace(/\\/g, '/');
        }
        return p;
    }
    suite('Workbench - OutputWorker', function () {
        test('OutputWorker - Link detection', function () {
            var patternsSlash = outputLinkComputer_1.OutputLinkComputer.createPatterns(uri_1.default.file('C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala'));
            var patternsBackSlash = outputLinkComputer_1.OutputLinkComputer.createPatterns(uri_1.default.file('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala'));
            var contextService = new workbenchTestServices_1.TestContextService();
            var line = toOSPath('Foo bar');
            var result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 0);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 0);
            // Example: at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString());
            assert.equal(result[0].range.startColumn, 5);
            assert.equal(result[0].range.endColumn, 84);
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString());
            assert.equal(result[0].range.startColumn, 5);
            assert.equal(result[0].range.endColumn, 84);
            // Example: at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336 in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#336');
            assert.equal(result[0].range.startColumn, 5);
            assert.equal(result[0].range.endColumn, 88);
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336 in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#336');
            assert.equal(result[0].range.startColumn, 5);
            assert.equal(result[0].range.endColumn, 88);
            // Example: at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336:9
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336:9 in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#336,9');
            assert.equal(result[0].range.startColumn, 5);
            assert.equal(result[0].range.endColumn, 90);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#336,9');
            assert.equal(result[0].range.startColumn, 5);
            assert.equal(result[0].range.endColumn, 90);
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336:9 in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#336,9');
            assert.equal(result[0].range.startColumn, 5);
            assert.equal(result[0].range.endColumn, 90);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#336,9');
            assert.equal(result[0].range.startColumn, 5);
            assert.equal(result[0].range.endColumn, 90);
            // Example: at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts>dir
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts>dir in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString());
            assert.equal(result[0].range.startColumn, 5);
            assert.equal(result[0].range.endColumn, 84);
            // Example: at [C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336:9]
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336:9] in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#336,9');
            assert.equal(result[0].range.startColumn, 5);
            assert.equal(result[0].range.endColumn, 90);
            // Example: at [C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts]
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts] in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString());
            // Example: C:\Users\someone\AppData\Local\Temp\_monacodata_9888\workspaces\express\server.js on line 8
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts on line 8');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#8');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 90);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#8');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 90);
            // Example: C:\Users\someone\AppData\Local\Temp\_monacodata_9888\workspaces\express\server.js on line 8, column 13
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts on line 8, column 13');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#8,13');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 101);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#8,13');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 101);
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts on LINE 8, COLUMN 13');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#8,13');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 101);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#8,13');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 101);
            // Example: C:\Users\someone\AppData\Local\Temp\_monacodata_9888\workspaces\express\server.js:line 8
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:line 8');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#8');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 87);
            // Example: at File.put (C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Game.ts)
            line = toOSPath(' at File.put (C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Game.ts)');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString());
            assert.equal(result[0].range.startColumn, 15);
            assert.equal(result[0].range.endColumn, 94);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString());
            assert.equal(result[0].range.startColumn, 15);
            assert.equal(result[0].range.endColumn, 94);
            // Example: at File.put (C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Game.ts:278)
            line = toOSPath(' at File.put (C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Game.ts:278)');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#278');
            assert.equal(result[0].range.startColumn, 15);
            assert.equal(result[0].range.endColumn, 98);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#278');
            assert.equal(result[0].range.startColumn, 15);
            assert.equal(result[0].range.endColumn, 98);
            // Example: at File.put (C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Game.ts:278:34)
            line = toOSPath(' at File.put (C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Game.ts:278:34)');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#278,34');
            assert.equal(result[0].range.startColumn, 15);
            assert.equal(result[0].range.endColumn, 101);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#278,34');
            assert.equal(result[0].range.startColumn, 15);
            assert.equal(result[0].range.endColumn, 101);
            line = toOSPath(' at File.put (C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Game.ts:278:34)');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#278,34');
            assert.equal(result[0].range.startColumn, 15);
            assert.equal(result[0].range.endColumn, 101);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString() + '#278,34');
            assert.equal(result[0].range.startColumn, 15);
            assert.equal(result[0].range.endColumn, 101);
            // Example: C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Features.ts(45): error
            line = toOSPath('C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/lib/something/Features.ts(45): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 102);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 102);
            // Example: C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Features.ts (45,18): error
            line = toOSPath('C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/lib/something/Features.ts (45): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 103);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 103);
            // Example: C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Features.ts(45,18): error
            line = toOSPath('C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/lib/something/Features.ts(45,18): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 105);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 105);
            line = toOSPath('C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/lib/something/Features.ts(45,18): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 105);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 105);
            // Example: C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Features.ts (45,18): error
            line = toOSPath('C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/lib/something/Features.ts (45,18): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 106);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 106);
            line = toOSPath('C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/lib/something/Features.ts (45,18): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 106);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 106);
            // Example: C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Features.ts(45): error
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features.ts(45): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 102);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 102);
            // Example: C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Features.ts (45,18): error
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features.ts (45): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 103);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 103);
            // Example: C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Features.ts(45,18): error
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features.ts(45,18): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 105);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 105);
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features.ts(45,18): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 105);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 105);
            // Example: C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Features.ts (45,18): error
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features.ts (45,18): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 106);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 106);
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features.ts (45,18): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 106);
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsBackSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.equal(result[0].range.startColumn, 1);
            assert.equal(result[0].range.endColumn, 106);
            // Example: at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts.
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts. in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString());
            assert.equal(result[0].range.startColumn, 5);
            assert.equal(result[0].range.endColumn, 84);
            // Example: at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            // Example: at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game\\
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game\\ in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            // Example: at "C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts"
            line = toOSPath(' at "C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts" in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString());
            assert.equal(result[0].range.startColumn, 6);
            assert.equal(result[0].range.endColumn, 85);
            // Example: at 'C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts'
            line = toOSPath(' at \'C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts\' in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patternsSlash, contextService);
            assert.equal(result.length, 1);
            assert.equal(result[0].url, contextService.toResource('/Game.ts').toString());
            assert.equal(result[0].range.startColumn, 6);
            assert.equal(result[0].range.endColumn, 85);
        });
    });
});
