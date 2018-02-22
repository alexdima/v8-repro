/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "crypto", "vs/base/common/winjs.base", "vs/base/common/functional"], function (require, exports, fs, crypto, winjs_base_1, functional_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function checksum(path, sha1hash) {
        var promise = new winjs_base_1.TPromise(function (c, e) {
            var input = fs.createReadStream(path);
            var hash = crypto.createHash('sha1');
            var hashStream = hash;
            input.pipe(hashStream);
            var done = functional_1.once(function (err, result) {
                input.removeAllListeners();
                hashStream.removeAllListeners();
                if (err) {
                    e(err);
                }
                else {
                    c(result);
                }
            });
            input.once('error', done);
            input.once('end', done);
            hashStream.once('error', done);
            hashStream.once('data', function (data) { return done(null, data.toString('hex')); });
        });
        return promise.then(function (hash) {
            if (hash !== sha1hash) {
                return winjs_base_1.TPromise.wrapError(new Error('Hash mismatch'));
            }
            return winjs_base_1.TPromise.as(null);
        });
    }
    exports.checksum = checksum;
});
