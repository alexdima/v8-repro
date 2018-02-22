/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "electron", "vs/nls", "vs/base/browser/dom", "vs/base/common/collections", "vs/base/browser/browser", "vs/base/common/strings", "vs/platform/node/product", "vs/platform/node/package", "os", "vs/base/common/decorators", "vs/base/common/platform", "vs/base/common/lifecycle", "vs/base/parts/ipc/electron-browser/ipc.electron-browser", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/node/ipc.net", "vs/platform/instantiation/common/serviceCollection", "vs/platform/windows/common/windows", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/common/telemetryIpc", "vs/platform/instantiation/common/instantiationService", "vs/platform/telemetry/node/commonProperties", "vs/platform/windows/common/windowsIpc", "vs/platform/environment/node/environmentService", "vs/code/electron-browser/issue/issueReporterModel", "vs/platform/issue/common/issue", "vs/code/electron-browser/issue/issueReporterPage", "vs/platform/log/node/spdlogService", "vs/platform/log/common/logIpc", "vs/platform/log/common/log", "vs/base/browser/ui/octiconLabel/octiconLabel", "vs/css!./media/issueReporter"], function (require, exports, electron_1, nls_1, dom_1, collections, browser, strings_1, product_1, package_1, os, decorators_1, platform, lifecycle_1, ipc_electron_browser_1, ipc_1, ipc_net_1, serviceCollection_1, windows_1, telemetryUtils_1, telemetryService_1, telemetryIpc_1, instantiationService_1, commonProperties_1, windowsIpc_1, environmentService_1, issueReporterModel_1, issue_1, issueReporterPage_1, spdlogService_1, logIpc_1, log_1, octiconLabel_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var MAX_URL_LENGTH = 5400;
    function startup(configuration) {
        document.body.innerHTML = issueReporterPage_1.default();
        var issueReporter = new IssueReporter(configuration);
        issueReporter.render();
        document.body.style.display = 'block';
    }
    exports.startup = startup;
    var IssueReporter = /** @class */ (function (_super) {
        __extends(IssueReporter, _super);
        function IssueReporter(configuration) {
            var _this = _super.call(this) || this;
            _this.shouldQueueSearch = true;
            _this.numberOfSearchResultsDisplayed = 0;
            _this.receivedSystemInfo = false;
            _this.receivedPerformanceInfo = false;
            _this.updateSystemInfo = function (state) {
                var target = document.querySelector('.block-system .block-info');
                var tableHtml = '';
                Object.keys(state.systemInfo).forEach(function (k) {
                    tableHtml += "\n\t\t\t\t<tr>\n\t\t\t\t\t<td>" + k + "</td>\n\t\t\t\t\t<td>" + state.systemInfo[k] + "</td>\n\t\t\t\t</tr>";
                });
                target.innerHTML = "<table>" + tableHtml + "</table>";
            };
            _this.updateProcessInfo = function (state) {
                var target = document.querySelector('.block-process .block-info');
                var tableHtml = "\n\t\t\t<tr>\n\t\t\t\t<th>pid</th>\n\t\t\t\t<th>CPU %</th>\n\t\t\t\t<th>Memory (MB)</th>\n\t\t\t\t<th>Name</th>\n\t\t\t</tr>";
                state.processInfo.forEach(function (p) {
                    tableHtml += "\n\t\t\t\t<tr>\n\t\t\t\t\t<td>" + p.pid + "</td>\n\t\t\t\t\t<td>" + p.cpu + "</td>\n\t\t\t\t\t<td>" + p.memory + "</td>\n\t\t\t\t\t<td>" + p.name + "</td>\n\t\t\t\t</tr>";
                });
                target.innerHTML = "<table>" + tableHtml + "</table>";
            };
            _this.updateWorkspaceInfo = function (state) {
                document.querySelector('.block-workspace .block-info code').textContent = '\n' + state.workspaceInfo;
            };
            _this.initServices(configuration);
            _this.issueReporterModel = new issueReporterModel_1.IssueReporterModel({
                issueType: configuration.data.issueType || issue_1.IssueType.Bug,
                versionInfo: {
                    vscodeVersion: package_1.default.name + " " + package_1.default.version + " (" + (product_1.default.commit || 'Commit unknown') + ", " + (product_1.default.date || 'Date unknown') + ")",
                    os: os.type() + " " + os.arch() + " " + os.release()
                },
                extensionsDisabled: _this.environmentService.disableExtensions,
            });
            _this.features = configuration.features;
            electron_1.ipcRenderer.on('issuePerformanceInfoResponse', function (event, info) {
                _this.logService.trace('issueReporter: Received performance data');
                _this.issueReporterModel.update(info);
                _this.receivedPerformanceInfo = true;
                var state = _this.issueReporterModel.getData();
                _this.updateProcessInfo(state);
                _this.updateWorkspaceInfo(state);
                _this.updatePreviewButtonState();
            });
            electron_1.ipcRenderer.on('issueSystemInfoResponse', function (event, info) {
                _this.logService.trace('issueReporter: Received system data');
                _this.issueReporterModel.update({ systemInfo: info });
                _this.receivedSystemInfo = true;
                _this.updateSystemInfo(_this.issueReporterModel.getData());
                _this.updatePreviewButtonState();
            });
            electron_1.ipcRenderer.send('issueSystemInfoRequest');
            electron_1.ipcRenderer.send('issuePerformanceInfoRequest');
            _this.logService.trace('issueReporter: Sent data requests');
            if (window.document.documentElement.lang !== 'en') {
                show(document.getElementById('english'));
            }
            _this.setUpTypes();
            _this.setEventHandlers();
            _this.applyZoom(configuration.data.zoomLevel);
            _this.applyStyles(configuration.data.styles);
            _this.handleExtensionData(configuration.data.enabledExtensions);
            if (configuration.data.issueType === issue_1.IssueType.SettingsSearchIssue) {
                _this.handleSettingsSearchData(configuration.data);
            }
            return _this;
        }
        IssueReporter.prototype.render = function () {
            this.renderBlocks();
        };
        IssueReporter.prototype.applyZoom = function (zoomLevel) {
            electron_1.webFrame.setZoomLevel(zoomLevel);
            browser.setZoomFactor(electron_1.webFrame.getZoomFactor());
            // See https://github.com/Microsoft/vscode/issues/26151
            // Cannot be trusted because the webFrame might take some time
            // until it really applies the new zoom level
            browser.setZoomLevel(electron_1.webFrame.getZoomLevel(), /*isTrusted*/ false);
        };
        IssueReporter.prototype.applyStyles = function (styles) {
            var styleTag = document.createElement('style');
            var content = [];
            if (styles.inputBackground) {
                content.push("input[type=\"text\"], textarea, select, .issues-container > .issue > .issue-state { background-color: " + styles.inputBackground + "; }");
            }
            if (styles.inputBorder) {
                content.push("input[type=\"text\"], textarea, select { border: 1px solid " + styles.inputBorder + "; }");
            }
            else {
                content.push("input[type=\"text\"], textarea, select { border: 1px solid transparent; }");
            }
            if (styles.inputForeground) {
                content.push("input[type=\"text\"], textarea, select, .issues-container > .issue > .issue-state { color: " + styles.inputForeground + "; }");
            }
            if (styles.inputErrorBorder) {
                content.push(".invalid-input, .invalid-input:focus { border: 1px solid " + styles.inputErrorBorder + " !important; }");
                content.push(".validation-error, .required-input { color: " + styles.inputErrorBorder + "; }");
            }
            if (styles.inputActiveBorder) {
                content.push("input[type='text']:focus, textarea:focus, select:focus, summary:focus, button:focus  { border: 1px solid " + styles.inputActiveBorder + "; outline-style: none; }");
            }
            if (styles.textLinkColor) {
                content.push("a, .workbenchCommand { color: " + styles.textLinkColor + "; }");
            }
            if (styles.buttonBackground) {
                content.push("button { background-color: " + styles.buttonBackground + "; }");
            }
            if (styles.buttonForeground) {
                content.push("button { color: " + styles.buttonForeground + "; }");
            }
            if (styles.buttonHoverBackground) {
                content.push("#github-submit-btn:hover:enabled, #github-submit-btn:focus:enabled { background-color: " + styles.buttonHoverBackground + "; }");
            }
            if (styles.textLinkColor) {
                content.push("a { color: " + styles.textLinkColor + "; }");
            }
            if (styles.sliderBackgroundColor) {
                content.push("::-webkit-scrollbar-thumb { background-color: " + styles.sliderBackgroundColor + "; }");
            }
            if (styles.sliderActiveColor) {
                content.push("::-webkit-scrollbar-thumb:active { background-color: " + styles.sliderActiveColor + "; }");
            }
            if (styles.sliderHoverColor) {
                content.push("::--webkit-scrollbar-thumb:hover { background-color: " + styles.sliderHoverColor + "; }");
            }
            styleTag.innerHTML = content.join('\n');
            document.head.appendChild(styleTag);
            document.body.style.color = styles.color;
        };
        IssueReporter.prototype.handleExtensionData = function (extensions) {
            var _a = collections.groupBy(extensions, function (ext) {
                var manifestKeys = ext.manifest.contributes ? Object.keys(ext.manifest.contributes) : [];
                var onlyTheme = !ext.manifest.activationEvents && manifestKeys.length === 1 && manifestKeys[0] === 'themes';
                return onlyTheme ? 'themes' : 'nonThemes';
            }), nonThemes = _a.nonThemes, themes = _a.themes;
            var numberOfThemeExtesions = themes && themes.length;
            this.issueReporterModel.update({ numberOfThemeExtesions: numberOfThemeExtesions, enabledNonThemeExtesions: nonThemes });
            this.updateExtensionTable(nonThemes, numberOfThemeExtesions);
            if (this.environmentService.disableExtensions || extensions.length === 0) {
                document.getElementById('disableExtensions').disabled = true;
                document.getElementById('reproducesWithoutExtensions').checked = true;
                this.issueReporterModel.update({ reprosWithoutExtensions: true });
            }
        };
        IssueReporter.prototype.handleSettingsSearchData = function (data) {
            this.issueReporterModel.update({
                actualSearchResults: data.actualSearchResults,
                query: data.query,
                filterResultCount: data.filterResultCount
            });
            this.updateSearchedExtensionTable(data.enabledExtensions);
            this.updateSettingsSearchDetails(data);
        };
        IssueReporter.prototype.updateSettingsSearchDetails = function (data) {
            var target = document.querySelector('.block-settingsSearchResults .block-info');
            var details = "\n\t\t\t<div class='block-settingsSearchResults-details'>\n\t\t\t\t<div>Query: \"" + data.query + "\"</div>\n\t\t\t\t<div>Literal match count: " + data.filterResultCount + "</div>\n\t\t\t</div>\n\t\t";
            var table = "\n\t\t\t<tr>\n\t\t\t\t<th>Setting</th>\n\t\t\t\t<th>Extension</th>\n\t\t\t\t<th>Score</th>\n\t\t\t</tr>";
            data.actualSearchResults
                .forEach(function (setting) {
                table += "\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td>" + setting.key + "</td>\n\t\t\t\t\t\t<td>" + setting.extensionId + "</td>\n\t\t\t\t\t\t<td>" + String(setting.score).slice(0, 5) + "</td>\n\t\t\t\t\t</tr>";
            });
            target.innerHTML = details + "<table>" + table + "</table>";
        };
        IssueReporter.prototype.initServices = function (configuration) {
            var _this = this;
            var serviceCollection = new serviceCollection_1.ServiceCollection();
            var mainProcessClient = new ipc_electron_browser_1.Client(String("window" + configuration.windowId));
            var windowsChannel = mainProcessClient.getChannel('windows');
            serviceCollection.set(windows_1.IWindowsService, new windowsIpc_1.WindowsChannelClient(windowsChannel));
            this.environmentService = new environmentService_1.EnvironmentService(configuration, configuration.execPath);
            var logService = spdlogService_1.createSpdLogService("issuereporter" + configuration.windowId, log_1.getLogLevel(this.environmentService), this.environmentService.logsPath);
            var logLevelClient = new logIpc_1.LogLevelSetterChannelClient(mainProcessClient.getChannel('loglevel'));
            this.logService = new logIpc_1.FollowerLogService(logLevelClient, logService);
            var sharedProcess = serviceCollection.get(windows_1.IWindowsService).whenSharedProcessReady()
                .then(function () { return ipc_net_1.connect(_this.environmentService.sharedIPCHandle, "window:" + configuration.windowId); });
            var instantiationService = new instantiationService_1.InstantiationService(serviceCollection, true);
            if (this.environmentService.isBuilt && !this.environmentService.isExtensionDevelopment && !this.environmentService.args['disable-telemetry'] && !!product_1.default.enableTelemetry) {
                var channel = ipc_1.getDelayedChannel(sharedProcess.then(function (c) { return c.getChannel('telemetryAppender'); }));
                var appender = new telemetryIpc_1.TelemetryAppenderClient(channel);
                var commonProperties = commonProperties_1.resolveCommonProperties(product_1.default.commit, package_1.default.version, configuration.machineId, this.environmentService.installSourcePath);
                var piiPaths = [this.environmentService.appRoot, this.environmentService.extensionsPath];
                var config = { appender: appender, commonProperties: commonProperties, piiPaths: piiPaths };
                var telemetryService = instantiationService.createInstance(telemetryService_1.TelemetryService, config);
                this._register(telemetryService);
                this.telemetryService = telemetryService;
            }
            else {
                this.telemetryService = telemetryUtils_1.NullTelemetryService;
            }
        };
        IssueReporter.prototype.setEventHandlers = function () {
            var _this = this;
            document.getElementById('issue-type').addEventListener('change', function (event) {
                _this.issueReporterModel.update({ issueType: parseInt(event.target.value) });
                _this.updatePreviewButtonState();
                _this.render();
            });
            ['includeSystemInfo', 'includeProcessInfo', 'includeWorkspaceInfo', 'includeExtensions', 'includeSearchedExtensions', 'includeSettingsSearchDetails'].forEach(function (elementId) {
                document.getElementById(elementId).addEventListener('click', function (event) {
                    event.stopPropagation();
                    _this.issueReporterModel.update((_a = {}, _a[elementId] = !_this.issueReporterModel.getData()[elementId], _a));
                    var _a;
                });
            });
            var labelElements = document.getElementsByClassName('caption');
            for (var i = 0; i < labelElements.length; i++) {
                var label = labelElements.item(i);
                label.addEventListener('click', function (e) {
                    e.stopPropagation();
                    // Stop propgagation not working as expected in this case https://bugs.chromium.org/p/chromium/issues/detail?id=809801
                    // preventDefault does prevent outer details tag from toggling, so use that and manually toggle the checkbox
                    e.preventDefault();
                    var containingDiv = e.target.parentElement;
                    var checkbox = containingDiv.firstElementChild;
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                        _this.issueReporterModel.update((_a = {}, _a[checkbox.id] = !_this.issueReporterModel.getData()[checkbox.id], _a));
                    }
                    var _a;
                });
            }
            document.getElementById('reproducesWithoutExtensions').addEventListener('click', function (e) {
                _this.issueReporterModel.update({ reprosWithoutExtensions: true });
            });
            document.getElementById('reproducesWithExtensions').addEventListener('click', function (e) {
                _this.issueReporterModel.update({ reprosWithoutExtensions: false });
            });
            document.getElementById('description').addEventListener('input', function (event) {
                var issueDescription = event.target.value;
                _this.issueReporterModel.update({ issueDescription: issueDescription });
                if (_this.features.useDuplicateSearch) {
                    var title = document.getElementById('issue-title').value;
                    _this.searchDuplicates(title, issueDescription);
                }
            });
            document.getElementById('issue-title').addEventListener('input', function (e) { _this.searchIssues(e); });
            document.getElementById('github-submit-btn').addEventListener('click', function () { return _this.createIssue(); });
            var disableExtensions = document.getElementById('disableExtensions');
            disableExtensions.addEventListener('click', function () {
                electron_1.ipcRenderer.send('workbenchCommand', 'workbench.extensions.action.disableAll');
                electron_1.ipcRenderer.send('workbenchCommand', 'workbench.action.reloadWindow');
            });
            disableExtensions.addEventListener('keydown', function (e) {
                if (e.keyCode === 13 || e.keyCode === 32) {
                    electron_1.ipcRenderer.send('workbenchCommand', 'workbench.extensions.action.disableAll');
                    electron_1.ipcRenderer.send('workbenchCommand', 'workbench.action.reloadWindow');
                }
            });
            var showRunning = document.getElementById('showRunning');
            showRunning.addEventListener('click', function () {
                electron_1.ipcRenderer.send('workbenchCommand', 'workbench.action.showRuntimeExtensions');
            });
            showRunning.addEventListener('keydown', function (e) {
                if (e.keyCode === 13 || e.keyCode === 32) {
                    electron_1.ipcRenderer.send('workbenchCommand', 'workbench.action.showRuntimeExtensions');
                }
            });
            // Cmd+Enter or Mac or Ctrl+Enter on other platforms previews issue and closes window
            if (platform.isMacintosh) {
                var prevKeyWasCommand_1 = false;
                document.onkeydown = function (e) {
                    if (prevKeyWasCommand_1 && e.keyCode === 13) {
                        if (_this.createIssue()) {
                            electron_1.remote.getCurrentWindow().close();
                        }
                    }
                    prevKeyWasCommand_1 = e.keyCode === 91 || e.keyCode === 93;
                };
            }
            else {
                document.onkeydown = function (e) {
                    if (e.ctrlKey && e.keyCode === 13) {
                        if (_this.createIssue()) {
                            electron_1.remote.getCurrentWindow().close();
                        }
                    }
                };
            }
        };
        IssueReporter.prototype.updatePreviewButtonState = function () {
            var submitButton = document.getElementById('github-submit-btn');
            if (this.isPreviewEnabled()) {
                submitButton.disabled = false;
                submitButton.textContent = nls_1.localize('previewOnGitHub', "Preview on GitHub");
            }
            else {
                submitButton.disabled = true;
                submitButton.textContent = nls_1.localize('loadingData', "Loading data...");
            }
        };
        IssueReporter.prototype.isPreviewEnabled = function () {
            var issueType = this.issueReporterModel.getData().issueType;
            if (issueType === issue_1.IssueType.Bug && this.receivedSystemInfo) {
                return true;
            }
            if (issueType === issue_1.IssueType.PerformanceIssue && this.receivedSystemInfo && this.receivedPerformanceInfo) {
                return true;
            }
            if (issueType === issue_1.IssueType.FeatureRequest) {
                return true;
            }
            if (issueType === issue_1.IssueType.SettingsSearchIssue) {
                return true;
            }
            return false;
        };
        IssueReporter.prototype.searchIssues = function (event) {
            var title = event.target.value;
            if (title) {
                if (this.features.useDuplicateSearch) {
                    var description = this.issueReporterModel.getData().issueDescription;
                    this.searchDuplicates(title, description);
                }
                else {
                    this.searchGitHub(title);
                }
            }
            else {
                this.clearSearchResults();
            }
        };
        IssueReporter.prototype.clearSearchResults = function () {
            var similarIssues = document.getElementById('similar-issues');
            similarIssues.innerHTML = '';
            this.numberOfSearchResultsDisplayed = 0;
        };
        IssueReporter.prototype.searchDuplicates = function (title, body) {
            var _this = this;
            var url = 'https://vscode-probot.westus.cloudapp.azure.com:7890/duplicate_candidates';
            var init = {
                method: 'POST',
                body: JSON.stringify({
                    title: title,
                    body: body
                }),
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            };
            window.fetch(url, init).then(function (response) {
                response.json().then(function (result) {
                    _this.clearSearchResults();
                    if (result && result.candidates) {
                        _this.displaySearchResults(result.candidates);
                    }
                    else {
                        throw new Error('Unexpected response, no candidates property');
                    }
                }).catch(function (error) {
                    _this.logSearchError(error);
                });
            }).catch(function (error) {
                _this.logSearchError(error);
            });
        };
        IssueReporter.prototype.searchGitHub = function (title) {
            var _this = this;
            var query = "is:issue+repo:microsoft/vscode+" + title;
            var similarIssues = document.getElementById('similar-issues');
            window.fetch("https://api.github.com/search/issues?q=" + query).then(function (response) {
                response.json().then(function (result) {
                    similarIssues.innerHTML = '';
                    if (result && result.items) {
                        _this.displaySearchResults(result.items);
                    }
                    else {
                        // If the items property isn't present, the rate limit has been hit
                        var message = dom_1.$('div.list-title');
                        message.textContent = nls_1.localize('rateLimited', "GitHub query limit exceeded. Please wait.");
                        similarIssues.appendChild(message);
                        var resetTime = response.headers.get('X-RateLimit-Reset');
                        var timeToWait = parseInt(resetTime) - Math.floor(Date.now() / 1000);
                        if (_this.shouldQueueSearch) {
                            _this.shouldQueueSearch = false;
                            setTimeout(function () {
                                _this.searchGitHub(title);
                                _this.shouldQueueSearch = true;
                            }, timeToWait * 1000);
                        }
                        throw new Error(result.message);
                    }
                }).catch(function (error) {
                    _this.logSearchError(error);
                });
            }).catch(function (error) {
                _this.logSearchError(error);
            });
        };
        IssueReporter.prototype.displaySearchResults = function (results) {
            var _this = this;
            var similarIssues = document.getElementById('similar-issues');
            if (results.length) {
                var hasIssueState = results.every(function (result) { return !!result.state; });
                var issues = hasIssueState ? dom_1.$('div.issues-container') : dom_1.$('ul.issues-container');
                var issuesText = dom_1.$('div.list-title');
                issuesText.textContent = nls_1.localize('similarIssues', "Similar issues");
                this.numberOfSearchResultsDisplayed = results.length < 5 ? results.length : 5;
                for (var i = 0; i < this.numberOfSearchResultsDisplayed; i++) {
                    var issue = results[i];
                    var link = issue.state ? dom_1.$('a.issue-link', { href: issue.html_url }) : dom_1.$('a', { href: issue.html_url });
                    link.textContent = issue.title;
                    link.title = issue.title;
                    link.addEventListener('click', function (e) { return _this.openLink(e); });
                    link.addEventListener('auxclick', function (e) { return _this.openLink(e); });
                    var issueState = void 0;
                    if (issue.state) {
                        issueState = dom_1.$('span.issue-state');
                        var issueIcon = dom_1.$('span.issue-icon');
                        var octicon = new octiconLabel_1.OcticonLabel(issueIcon);
                        octicon.text = issue.state === 'open' ? '$(issue-opened)' : '$(issue-closed)';
                        var issueStateLabel = dom_1.$('span.issue-state.label');
                        issueStateLabel.textContent = issue.state === 'open' ? nls_1.localize('open', "Open") : nls_1.localize('closed', "Closed");
                        issueState.title = issue.state === 'open' ? nls_1.localize('open', "Open") : nls_1.localize('closed', "Closed");
                        issueState.appendChild(issueIcon);
                        issueState.appendChild(issueStateLabel);
                    }
                    var item = issue.state ? dom_1.$('div.issue', {}, issueState, link) : dom_1.$('li.issue', {}, link);
                    issues.appendChild(item);
                }
                similarIssues.appendChild(issuesText);
                similarIssues.appendChild(issues);
            }
            else {
                var message = dom_1.$('div.list-title');
                message.textContent = nls_1.localize('noResults', "No results found");
                similarIssues.appendChild(message);
            }
        };
        IssueReporter.prototype.logSearchError = function (error) {
            this.logService.warn('issueReporter#search ', error.message);
            /* __GDPR__
            "issueReporterSearchError" : {
                    "message" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth" }
                }
            */
            this.telemetryService.publicLog('issueReporterSearchError', { message: error.message });
        };
        IssueReporter.prototype.setUpTypes = function () {
            var makeOption = function (issueType, description) { return "<option value=\"" + issueType.valueOf() + "\">" + strings_1.escape(description) + "</option>"; };
            var typeSelect = document.getElementById('issue-type');
            var issueType = this.issueReporterModel.getData().issueType;
            if (issueType === issue_1.IssueType.SettingsSearchIssue) {
                typeSelect.innerHTML = makeOption(issue_1.IssueType.SettingsSearchIssue, nls_1.localize('settingsSearchIssue', "Settings Search Issue"));
                typeSelect.disabled = true;
            }
            else {
                typeSelect.innerHTML = [
                    makeOption(issue_1.IssueType.Bug, nls_1.localize('bugReporter', "Bug Report")),
                    makeOption(issue_1.IssueType.PerformanceIssue, nls_1.localize('performanceIssue', "Performance Issue")),
                    makeOption(issue_1.IssueType.FeatureRequest, nls_1.localize('featureRequest', "Feature Request"))
                ].join('\n');
            }
            typeSelect.value = issueType.toString();
        };
        IssueReporter.prototype.renderBlocks = function () {
            // Depending on Issue Type, we render different blocks and text
            var issueType = this.issueReporterModel.getData().issueType;
            var systemBlock = document.querySelector('.block-system');
            var processBlock = document.querySelector('.block-process');
            var workspaceBlock = document.querySelector('.block-workspace');
            var extensionsBlock = document.querySelector('.block-extensions');
            var searchedExtensionsBlock = document.querySelector('.block-searchedExtensions');
            var settingsSearchResultsBlock = document.querySelector('.block-settingsSearchResults');
            var disabledExtensions = document.getElementById('disabledExtensions');
            var descriptionTitle = document.getElementById('issue-description-label');
            var descriptionSubtitle = document.getElementById('issue-description-subtitle');
            // Hide all by default
            hide(systemBlock);
            hide(processBlock);
            hide(workspaceBlock);
            hide(extensionsBlock);
            hide(searchedExtensionsBlock);
            hide(settingsSearchResultsBlock);
            hide(disabledExtensions);
            if (issueType === issue_1.IssueType.Bug) {
                show(systemBlock);
                show(extensionsBlock);
                show(disabledExtensions);
                descriptionTitle.innerHTML = nls_1.localize('stepsToReproduce', "Steps to Reproduce") + " <span class=\"required-input\">*</span>";
                descriptionSubtitle.innerHTML = nls_1.localize('bugDescription', "Share the steps needed to reliably reproduce the problem. Please include actual and expected results. We support GitHub-flavored Markdown. You will be able to edit your issue and add screenshots when we preview it on GitHub.");
            }
            else if (issueType === issue_1.IssueType.PerformanceIssue) {
                show(systemBlock);
                show(processBlock);
                show(workspaceBlock);
                show(extensionsBlock);
                show(disabledExtensions);
                descriptionTitle.innerHTML = nls_1.localize('stepsToReproduce', "Steps to Reproduce") + " <span class=\"required-input\">*</span>";
                descriptionSubtitle.innerHTML = nls_1.localize('performanceIssueDesciption', "When did this performance issue happen? Does it occur on startup or after a specific series of actions? We support GitHub-flavored Markdown. You will be able to edit your issue and add screenshots when we preview it on GitHub.");
            }
            else if (issueType === issue_1.IssueType.FeatureRequest) {
                descriptionTitle.innerHTML = nls_1.localize('description', "Description") + " <span class=\"required-input\">*</span>";
                descriptionSubtitle.innerHTML = nls_1.localize('featureRequestDescription', "Please describe the feature you would like to see. We support GitHub-flavored Markdown. You will be able to edit your issue and add screenshots when we preview it on GitHub.");
            }
            else if (issueType === issue_1.IssueType.SettingsSearchIssue) {
                show(searchedExtensionsBlock);
                show(settingsSearchResultsBlock);
                descriptionTitle.innerHTML = nls_1.localize('expectedResults', "Expected Results") + " <span class=\"required-input\">*</span>";
                descriptionSubtitle.innerHTML = nls_1.localize('settingsSearchResultsDescription', "Please list the results that you were expecting to see when you searched with this query. We support GitHub-flavored Markdown. You will be able to edit your issue and add screenshots when we preview it on GitHub.");
            }
        };
        IssueReporter.prototype.validateInput = function (inputId) {
            var inputElement = document.getElementById(inputId);
            if (!inputElement.value) {
                inputElement.classList.add('invalid-input');
                return false;
            }
            else {
                inputElement.classList.remove('invalid-input');
                return true;
            }
        };
        IssueReporter.prototype.validateInputs = function () {
            var _this = this;
            var isValid = true;
            ['issue-title', 'description'].forEach(function (elementId) {
                isValid = _this.validateInput(elementId) && isValid;
            });
            return isValid;
        };
        IssueReporter.prototype.createIssue = function () {
            var _this = this;
            if (!this.validateInputs()) {
                // If inputs are invalid, set focus to the first one and add listeners on them
                // to detect further changes
                document.getElementsByClassName('invalid-input')[0].focus();
                document.getElementById('issue-title').addEventListener('input', function (event) {
                    _this.validateInput('issue-title');
                });
                document.getElementById('description').addEventListener('input', function (event) {
                    _this.validateInput('description');
                });
                return false;
            }
            /* __GDPR__
                "issueReporterSubmit" : {
                    "issueType" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "numSimilarIssuesDisplayed" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this.telemetryService.publicLog('issueReporterSubmit', { issueType: this.issueReporterModel.getData().issueType, numSimilarIssuesDisplayed: this.numberOfSearchResultsDisplayed });
            var issueTitle = encodeURIComponent(document.getElementById('issue-title').value);
            var queryStringPrefix = product_1.default.reportIssueUrl.indexOf('?') === -1 ? '?' : '&';
            var baseUrl = "" + product_1.default.reportIssueUrl + queryStringPrefix + "title=" + issueTitle + "&body=";
            var issueBody = this.issueReporterModel.serialize();
            var url = baseUrl + encodeURIComponent(issueBody);
            var lengthValidationElement = document.getElementById('url-length-validation-error');
            if (url.length > MAX_URL_LENGTH) {
                lengthValidationElement.textContent = nls_1.localize('urlLengthError', "The data exceeds the length limit of {0} characters. The data is length {1}.", MAX_URL_LENGTH, url.length);
                show(lengthValidationElement);
                return false;
            }
            else {
                hide(lengthValidationElement);
            }
            electron_1.shell.openExternal(url);
            return true;
        };
        IssueReporter.prototype.updateExtensionTable = function (extensions, numThemeExtensions) {
            var target = document.querySelector('.block-extensions .block-info');
            if (this.environmentService.disableExtensions) {
                target.innerHTML = nls_1.localize('disabledExtensions', "Extensions are disabled");
                return;
            }
            var themeExclusionStr = numThemeExtensions ? "\n(" + numThemeExtensions + " theme extensions excluded)" : '';
            extensions = extensions || [];
            if (!extensions.length) {
                target.innerHTML = 'Extensions: none' + themeExclusionStr;
                return;
            }
            var table = this.getExtensionTableHtml(extensions);
            target.innerHTML = "<table>" + table + "</table>" + themeExclusionStr;
        };
        IssueReporter.prototype.updateSearchedExtensionTable = function (extensions) {
            var target = document.querySelector('.block-searchedExtensions .block-info');
            if (!extensions.length) {
                target.innerHTML = 'Extensions: none';
                return;
            }
            var table = this.getExtensionTableHtml(extensions);
            target.innerHTML = "<table>" + table + "</table>";
        };
        IssueReporter.prototype.getExtensionTableHtml = function (extensions) {
            var table = "\n\t\t\t<tr>\n\t\t\t\t<th>Extension</th>\n\t\t\t\t<th>Author (truncated)</th>\n\t\t\t\t<th>Version</th>\n\t\t\t</tr>";
            table += extensions.map(function (extension) {
                return "\n\t\t\t\t<tr>\n\t\t\t\t\t<td>" + extension.manifest.name + "</td>\n\t\t\t\t\t<td>" + extension.manifest.publisher.substr(0, 3) + "</td>\n\t\t\t\t\t<td>" + extension.manifest.version + "</td>\n\t\t\t\t</tr>";
            }).join('');
            return table;
        };
        IssueReporter.prototype.openLink = function (event) {
            event.preventDefault();
            event.stopPropagation();
            // Exclude right click
            if (event.which < 3) {
                electron_1.shell.openExternal(event.target.href);
                /* __GDPR__
                    "issueReporterViewSimilarIssue" : {
                        "usingDuplicatesAPI" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                    }
                */
                this.telemetryService.publicLog('issueReporterViewSimilarIssue', { usingDuplicatesAPI: this.features.useDuplicateSearch });
            }
        };
        __decorate([
            decorators_1.debounce(300)
        ], IssueReporter.prototype, "searchIssues", null);
        __decorate([
            decorators_1.debounce(300)
        ], IssueReporter.prototype, "searchDuplicates", null);
        return IssueReporter;
    }(lifecycle_1.Disposable));
    exports.IssueReporter = IssueReporter;
    // helper functions
    function hide(el) {
        el.classList.add('hidden');
    }
    function show(el) {
        el.classList.remove('hidden');
    }
});
