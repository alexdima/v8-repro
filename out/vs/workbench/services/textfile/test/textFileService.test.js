var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "assert", "vs/base/common/platform", "vs/platform/lifecycle/common/lifecycle", "vs/workbench/test/workbenchTestServices", "vs/base/test/common/utils", "vs/platform/windows/common/windows", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/common/editor", "vs/workbench/services/untitled/common/untitledEditorService", "vs/platform/files/common/files", "vs/platform/workspace/common/workspace"], function (require, exports, assert, platform, lifecycle_1, workbenchTestServices_1, utils_1, windows_1, textFileEditorModel_1, textfiles_1, editor_1, untitledEditorService_1, files_1, workspace_1) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ServiceAccessor = /** @class */ (function () {
        function ServiceAccessor(lifecycleService, textFileService, untitledEditorService, windowsService, contextService) {
            this.lifecycleService = lifecycleService;
            this.textFileService = textFileService;
            this.untitledEditorService = untitledEditorService;
            this.windowsService = windowsService;
            this.contextService = contextService;
        }
        ServiceAccessor = __decorate([
            __param(0, lifecycle_1.ILifecycleService),
            __param(1, textfiles_1.ITextFileService),
            __param(2, untitledEditorService_1.IUntitledEditorService),
            __param(3, windows_1.IWindowsService),
            __param(4, workspace_1.IWorkspaceContextService)
        ], ServiceAccessor);
        return ServiceAccessor;
    }());
    var ShutdownEventImpl = /** @class */ (function () {
        function ShutdownEventImpl() {
            this.reason = lifecycle_1.ShutdownReason.CLOSE;
        }
        ShutdownEventImpl.prototype.veto = function (value) {
            this.value = value;
        };
        return ShutdownEventImpl;
    }());
    suite('Files - TextFileService', function () {
        var instantiationService;
        var model;
        var accessor;
        setup(function () {
            instantiationService = workbenchTestServices_1.workbenchInstantiationService();
            accessor = instantiationService.createInstance(ServiceAccessor);
        });
        teardown(function () {
            model.dispose();
            accessor.textFileService.models.clear();
            accessor.textFileService.models.dispose();
            accessor.untitledEditorService.revertAll();
        });
        test('confirm onWillShutdown - no veto', function () {
            model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/file.txt'), 'utf8');
            accessor.textFileService.models.add(model.getResource(), model);
            var event = new ShutdownEventImpl();
            accessor.lifecycleService.fireWillShutdown(event);
            var veto = event.value;
            if (typeof veto === 'boolean') {
                assert.ok(!veto);
            }
            else {
                veto.then(function (veto) {
                    assert.ok(!veto);
                });
            }
        });
        test('confirm onWillShutdown - veto if user cancels', function (done) {
            model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/file.txt'), 'utf8');
            accessor.textFileService.models.add(model.getResource(), model);
            var service = accessor.textFileService;
            service.setConfirmResult(editor_1.ConfirmResult.CANCEL);
            model.load().done(function () {
                model.textEditorModel.setValue('foo');
                assert.equal(service.getDirty().length, 1);
                var event = new ShutdownEventImpl();
                accessor.lifecycleService.fireWillShutdown(event);
                assert.ok(event.value);
                done();
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('confirm onWillShutdown - no veto and backups cleaned up if user does not want to save (hot.exit: off)', function (done) {
            model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/file.txt'), 'utf8');
            accessor.textFileService.models.add(model.getResource(), model);
            var service = accessor.textFileService;
            service.setConfirmResult(editor_1.ConfirmResult.DONT_SAVE);
            service.onFilesConfigurationChange({ files: { hotExit: 'off' } });
            model.load().done(function () {
                model.textEditorModel.setValue('foo');
                assert.equal(service.getDirty().length, 1);
                var event = new ShutdownEventImpl();
                accessor.lifecycleService.fireWillShutdown(event);
                var veto = event.value;
                if (typeof veto === 'boolean') {
                    assert.ok(service.cleanupBackupsBeforeShutdownCalled);
                    assert.ok(!veto);
                    done();
                }
                else {
                    veto.then(function (veto) {
                        assert.ok(service.cleanupBackupsBeforeShutdownCalled);
                        assert.ok(!veto);
                        done();
                    });
                }
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('confirm onWillShutdown - save (hot.exit: off)', function (done) {
            model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/file.txt'), 'utf8');
            accessor.textFileService.models.add(model.getResource(), model);
            var service = accessor.textFileService;
            service.setConfirmResult(editor_1.ConfirmResult.SAVE);
            service.onFilesConfigurationChange({ files: { hotExit: 'off' } });
            model.load().done(function () {
                model.textEditorModel.setValue('foo');
                assert.equal(service.getDirty().length, 1);
                var event = new ShutdownEventImpl();
                accessor.lifecycleService.fireWillShutdown(event);
                return event.value.then(function (veto) {
                    assert.ok(!veto);
                    assert.ok(!model.isDirty());
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('isDirty/getDirty - files and untitled', function (done) {
            model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/file.txt'), 'utf8');
            accessor.textFileService.models.add(model.getResource(), model);
            var service = accessor.textFileService;
            model.load().done(function () {
                assert.ok(!service.isDirty(model.getResource()));
                model.textEditorModel.setValue('foo');
                assert.ok(service.isDirty(model.getResource()));
                assert.equal(service.getDirty().length, 1);
                assert.equal(service.getDirty([model.getResource()])[0].toString(), model.getResource().toString());
                var untitled = accessor.untitledEditorService.createOrGet();
                return untitled.resolve().then(function (model) {
                    assert.ok(!service.isDirty(untitled.getResource()));
                    assert.equal(service.getDirty().length, 1);
                    model.textEditorModel.setValue('changed');
                    assert.ok(service.isDirty(untitled.getResource()));
                    assert.equal(service.getDirty().length, 2);
                    assert.equal(service.getDirty([untitled.getResource()])[0].toString(), untitled.getResource().toString());
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('save - file', function (done) {
            model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/file.txt'), 'utf8');
            accessor.textFileService.models.add(model.getResource(), model);
            var service = accessor.textFileService;
            model.load().done(function () {
                model.textEditorModel.setValue('foo');
                assert.ok(service.isDirty(model.getResource()));
                return service.save(model.getResource()).then(function (res) {
                    assert.ok(res);
                    assert.ok(!service.isDirty(model.getResource()));
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('saveAll - file', function (done) {
            model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/file.txt'), 'utf8');
            accessor.textFileService.models.add(model.getResource(), model);
            var service = accessor.textFileService;
            model.load().done(function () {
                model.textEditorModel.setValue('foo');
                assert.ok(service.isDirty(model.getResource()));
                return service.saveAll([model.getResource()]).then(function (res) {
                    assert.ok(res);
                    assert.ok(!service.isDirty(model.getResource()));
                    assert.equal(res.results.length, 1);
                    assert.equal(res.results[0].source.toString(), model.getResource().toString());
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('saveAs - file', function (done) {
            model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/file.txt'), 'utf8');
            accessor.textFileService.models.add(model.getResource(), model);
            var service = accessor.textFileService;
            service.setPromptPath(model.getResource().fsPath);
            model.load().done(function () {
                model.textEditorModel.setValue('foo');
                assert.ok(service.isDirty(model.getResource()));
                return service.saveAs(model.getResource()).then(function (res) {
                    assert.equal(res.toString(), model.getResource().toString());
                    assert.ok(!service.isDirty(model.getResource()));
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        test('revert - file', function (done) {
            model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/file.txt'), 'utf8');
            accessor.textFileService.models.add(model.getResource(), model);
            var service = accessor.textFileService;
            service.setPromptPath(model.getResource().fsPath);
            model.load().done(function () {
                model.textEditorModel.setValue('foo');
                assert.ok(service.isDirty(model.getResource()));
                return service.revert(model.getResource()).then(function (res) {
                    assert.ok(res);
                    assert.ok(!service.isDirty(model.getResource()));
                    done();
                });
            }, function (error) { return utils_1.onError(error, done); });
        });
        suite('Hot Exit', function () {
            suite('"onExit" setting', function () {
                test('should hot exit on non-Mac (reason: CLOSE, windows: single, workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, lifecycle_1.ShutdownReason.CLOSE, false, true, !!platform.isMacintosh, done);
                });
                test('should hot exit on non-Mac (reason: CLOSE, windows: single, empty workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, lifecycle_1.ShutdownReason.CLOSE, false, false, !!platform.isMacintosh, done);
                });
                test('should NOT hot exit (reason: CLOSE, windows: multiple, workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, lifecycle_1.ShutdownReason.CLOSE, true, true, true, done);
                });
                test('should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, lifecycle_1.ShutdownReason.CLOSE, true, false, true, done);
                });
                test('should hot exit (reason: QUIT, windows: single, workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, lifecycle_1.ShutdownReason.QUIT, false, true, false, done);
                });
                test('should hot exit (reason: QUIT, windows: single, empty workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, lifecycle_1.ShutdownReason.QUIT, false, false, false, done);
                });
                test('should hot exit (reason: QUIT, windows: multiple, workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, lifecycle_1.ShutdownReason.QUIT, true, true, false, done);
                });
                test('should hot exit (reason: QUIT, windows: multiple, empty workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, lifecycle_1.ShutdownReason.QUIT, true, false, false, done);
                });
                test('should hot exit (reason: RELOAD, windows: single, workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, lifecycle_1.ShutdownReason.RELOAD, false, true, false, done);
                });
                test('should hot exit (reason: RELOAD, windows: single, empty workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, lifecycle_1.ShutdownReason.RELOAD, false, false, false, done);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, lifecycle_1.ShutdownReason.RELOAD, true, true, false, done);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, empty workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, lifecycle_1.ShutdownReason.RELOAD, true, false, false, done);
                });
                test('should NOT hot exit (reason: LOAD, windows: single, workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, lifecycle_1.ShutdownReason.LOAD, false, true, true, done);
                });
                test('should NOT hot exit (reason: LOAD, windows: single, empty workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, lifecycle_1.ShutdownReason.LOAD, false, false, true, done);
                });
                test('should NOT hot exit (reason: LOAD, windows: multiple, workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, lifecycle_1.ShutdownReason.LOAD, true, true, true, done);
                });
                test('should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, lifecycle_1.ShutdownReason.LOAD, true, false, true, done);
                });
            });
            suite('"onExitAndWindowClose" setting', function () {
                test('should hot exit (reason: CLOSE, windows: single, workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, lifecycle_1.ShutdownReason.CLOSE, false, true, false, done);
                });
                test('should hot exit (reason: CLOSE, windows: single, empty workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, lifecycle_1.ShutdownReason.CLOSE, false, false, !!platform.isMacintosh, done);
                });
                test('should hot exit (reason: CLOSE, windows: multiple, workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, lifecycle_1.ShutdownReason.CLOSE, true, true, false, done);
                });
                test('should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, lifecycle_1.ShutdownReason.CLOSE, true, false, true, done);
                });
                test('should hot exit (reason: QUIT, windows: single, workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, lifecycle_1.ShutdownReason.QUIT, false, true, false, done);
                });
                test('should hot exit (reason: QUIT, windows: single, empty workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, lifecycle_1.ShutdownReason.QUIT, false, false, false, done);
                });
                test('should hot exit (reason: QUIT, windows: multiple, workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, lifecycle_1.ShutdownReason.QUIT, true, true, false, done);
                });
                test('should hot exit (reason: QUIT, windows: multiple, empty workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, lifecycle_1.ShutdownReason.QUIT, true, false, false, done);
                });
                test('should hot exit (reason: RELOAD, windows: single, workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, lifecycle_1.ShutdownReason.RELOAD, false, true, false, done);
                });
                test('should hot exit (reason: RELOAD, windows: single, empty workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, lifecycle_1.ShutdownReason.RELOAD, false, false, false, done);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, lifecycle_1.ShutdownReason.RELOAD, true, true, false, done);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, empty workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, lifecycle_1.ShutdownReason.RELOAD, true, false, false, done);
                });
                test('should hot exit (reason: LOAD, windows: single, workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, lifecycle_1.ShutdownReason.LOAD, false, true, false, done);
                });
                test('should NOT hot exit (reason: LOAD, windows: single, empty workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, lifecycle_1.ShutdownReason.LOAD, false, false, true, done);
                });
                test('should hot exit (reason: LOAD, windows: multiple, workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, lifecycle_1.ShutdownReason.LOAD, true, true, false, done);
                });
                test('should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)', function (done) {
                    hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, lifecycle_1.ShutdownReason.LOAD, true, false, true, done);
                });
            });
            function hotExitTest(setting, shutdownReason, multipleWindows, workspace, shouldVeto, done) {
                model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/file.txt'), 'utf8');
                accessor.textFileService.models.add(model.getResource(), model);
                var service = accessor.textFileService;
                // Set hot exit config
                service.onFilesConfigurationChange({ files: { hotExit: setting } });
                // Set empty workspace if required
                if (!workspace) {
                    accessor.contextService.setWorkspace(new workspace_1.Workspace('empty:1508317022751'));
                }
                // Set multiple windows if required
                if (multipleWindows) {
                    accessor.windowsService.windowCount = 2;
                }
                // Set cancel to force a veto if hot exit does not trigger
                service.setConfirmResult(editor_1.ConfirmResult.CANCEL);
                model.load().done(function () {
                    model.textEditorModel.setValue('foo');
                    assert.equal(service.getDirty().length, 1);
                    var event = new ShutdownEventImpl();
                    event.reason = shutdownReason;
                    accessor.lifecycleService.fireWillShutdown(event);
                    return event.value.then(function (veto) {
                        // When hot exit is set, backups should never be cleaned since the confirm result is cancel
                        assert.ok(!service.cleanupBackupsBeforeShutdownCalled);
                        assert.equal(veto, shouldVeto);
                        done();
                    });
                }, function (error) { return utils_1.onError(error, done); });
            }
        });
    });
});
