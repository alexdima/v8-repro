/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/platform", "vs/base/browser/dom", "vs/css!./aria"], function (require, exports, nls, platform_1, dom) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ariaContainer;
    var alertContainer;
    var statusContainer;
    function setARIAContainer(parent) {
        ariaContainer = document.createElement('div');
        ariaContainer.className = 'monaco-aria-container';
        alertContainer = document.createElement('div');
        alertContainer.className = 'monaco-alert';
        alertContainer.setAttribute('role', 'alert');
        alertContainer.setAttribute('aria-atomic', 'true');
        ariaContainer.appendChild(alertContainer);
        statusContainer = document.createElement('div');
        statusContainer.className = 'monaco-status';
        statusContainer.setAttribute('role', 'status');
        statusContainer.setAttribute('aria-atomic', 'true');
        ariaContainer.appendChild(statusContainer);
        parent.appendChild(ariaContainer);
    }
    exports.setARIAContainer = setARIAContainer;
    /**
     * Given the provided message, will make sure that it is read as alert to screen readers.
     */
    function alert(msg) {
        insertMessage(alertContainer, msg);
    }
    exports.alert = alert;
    /**
     * Given the provided message, will make sure that it is read as status to screen readers.
     */
    function status(msg) {
        if (platform_1.isMacintosh) {
            alert(msg); // VoiceOver does not seem to support status role
        }
        else {
            insertMessage(statusContainer, msg);
        }
    }
    exports.status = status;
    function insertMessage(target, msg) {
        if (!ariaContainer) {
            // console.warn('ARIA support needs a container. Call setARIAContainer() first.');
            return;
        }
        if (target.textContent === msg) {
            msg = nls.localize('repeated', "{0} (occurred again)", msg);
        }
        dom.clearNode(target);
        target.textContent = msg;
        // See https://www.paciellogroup.com/blog/2012/06/html5-accessibility-chops-aria-rolealert-browser-support/
        target.style.visibility = 'hidden';
        target.style.visibility = 'visible';
    }
});
