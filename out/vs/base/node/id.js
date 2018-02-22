/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/winjs.base", "vs/base/common/errors", "vs/base/common/uuid", "os", "vs/base/common/map"], function (require, exports, winjs_base_1, errors, uuid, os_1, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // http://www.techrepublic.com/blog/data-center/mac-address-scorecard-for-common-virtual-machine-platforms/
    // VMware ESX 3, Server, Workstation, Player	00-50-56, 00-0C-29, 00-05-69
    // Microsoft Hyper-V, Virtual Server, Virtual PC	00-03-FF
    // Parallells Desktop, Workstation, Server, Virtuozzo	00-1C-42
    // Virtual Iron 4	00-0F-4B
    // Red Hat Xen	00-16-3E
    // Oracle VM	00-16-3E
    // XenSource	00-16-3E
    // Novell Xen	00-16-3E
    // Sun xVM VirtualBox	08-00-27
    exports.virtualMachineHint = new /** @class */ (function () {
        function class_1() {
        }
        class_1.prototype._isVirtualMachineMacAdress = function (mac) {
            if (!this._virtualMachineOUIs) {
                this._virtualMachineOUIs = map_1.TernarySearchTree.forStrings();
                // dash-separated
                this._virtualMachineOUIs.set('00-50-56', true);
                this._virtualMachineOUIs.set('00-0C-29', true);
                this._virtualMachineOUIs.set('00-05-69', true);
                this._virtualMachineOUIs.set('00-03-FF', true);
                this._virtualMachineOUIs.set('00-1C-42', true);
                this._virtualMachineOUIs.set('00-16-3E', true);
                this._virtualMachineOUIs.set('08-00-27', true);
                // colon-separated
                this._virtualMachineOUIs.set('00:50:56', true);
                this._virtualMachineOUIs.set('00:0C:29', true);
                this._virtualMachineOUIs.set('00:05:69', true);
                this._virtualMachineOUIs.set('00:03:FF', true);
                this._virtualMachineOUIs.set('00:1C:42', true);
                this._virtualMachineOUIs.set('00:16:3E', true);
                this._virtualMachineOUIs.set('08:00:27', true);
            }
            return this._virtualMachineOUIs.findSubstr(mac);
        };
        class_1.prototype.value = function () {
            if (this._value === undefined) {
                var vmOui = 0;
                var interfaceCount = 0;
                var interfaces = os_1.networkInterfaces();
                for (var name_1 in interfaces) {
                    if (Object.prototype.hasOwnProperty.call(interfaces, name_1)) {
                        for (var _i = 0, _a = interfaces[name_1]; _i < _a.length; _i++) {
                            var _b = _a[_i], mac = _b.mac, internal = _b.internal;
                            if (!internal) {
                                interfaceCount += 1;
                                if (this._isVirtualMachineMacAdress(mac.toUpperCase())) {
                                    vmOui += 1;
                                }
                            }
                        }
                    }
                }
                this._value = interfaceCount > 0
                    ? vmOui / interfaceCount
                    : 0;
            }
            return this._value;
        };
        return class_1;
    }());
    var machineId;
    function getMachineId() {
        return machineId || (machineId = getMacMachineId()
            .then(function (id) { return id || uuid.generateUuid(); })); // fallback, generate a UUID
    }
    exports.getMachineId = getMachineId;
    function getMacMachineId() {
        return new winjs_base_1.TPromise(function (resolve) {
            winjs_base_1.TPromise.join([new Promise(function (resolve_1, reject_1) { require(['crypto'], resolve_1, reject_1); }), new Promise(function (resolve_2, reject_2) { require(['getmac'], resolve_2, reject_2); })]).then(function (_a) {
                var crypto = _a[0], getmac = _a[1];
                try {
                    getmac.getMac(function (error, macAddress) {
                        if (!error) {
                            resolve(crypto.createHash('sha256').update(macAddress, 'utf8').digest('hex'));
                        }
                        else {
                            resolve(undefined);
                        }
                    });
                }
                catch (err) {
                    errors.onUnexpectedError(err);
                    resolve(undefined);
                }
            }, function (err) {
                errors.onUnexpectedError(err);
                resolve(undefined);
            });
        });
    }
});
