/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "os", "path", "fs", "vs/base/common/uuid", "vs/base/common/strings", "vs/base/node/extfs", "vs/base/test/common/utils", "stream", "vs/base/common/platform"], function (require, exports, assert, os, path, fs, uuid, strings, extfs, utils_1, stream_1, platform_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    var ignore = function () { };
    var mkdirp = function (path, mode, callback) {
        extfs.mkdirp(path, mode).done(function () { return callback(null); }, function (error) { return callback(error); });
    };
    var chunkSize = 64 * 1024;
    var readError = 'Error while reading';
    function toReadable(value, throwError) {
        var totalChunks = Math.ceil(value.length / chunkSize);
        var stringChunks = [];
        for (var i = 0, j = 0; i < totalChunks; ++i, j += chunkSize) {
            stringChunks[i] = value.substr(j, chunkSize);
        }
        var counter = 0;
        return new stream_1.Readable({
            read: function () {
                if (throwError) {
                    this.emit('error', new Error(readError));
                }
                var res;
                var canPush = true;
                while (canPush && (res = stringChunks[counter++])) {
                    canPush = this.push(res);
                }
                // EOS
                if (!res) {
                    this.push(null);
                }
            },
            encoding: 'utf8'
        });
    }
    suite('Extfs', function () {
        test('mkdirp', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'extfs', id);
            mkdirp(newDir, 493, function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                assert.ok(fs.existsSync(newDir));
                extfs.del(parentDir, os.tmpdir(), done, ignore);
            }); // 493 = 0755
        });
        test('delSync - swallows file not found error', function () {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'extfs', id);
            extfs.delSync(newDir);
            assert.ok(!fs.existsSync(newDir));
        });
        test('delSync - simple', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'extfs', id);
            mkdirp(newDir, 493, function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                fs.writeFileSync(path.join(newDir, 'somefile.txt'), 'Contents');
                fs.writeFileSync(path.join(newDir, 'someOtherFile.txt'), 'Contents');
                extfs.delSync(newDir);
                assert.ok(!fs.existsSync(newDir));
                done();
            }); // 493 = 0755
        });
        test('delSync - recursive folder structure', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'extfs', id);
            mkdirp(newDir, 493, function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                fs.writeFileSync(path.join(newDir, 'somefile.txt'), 'Contents');
                fs.writeFileSync(path.join(newDir, 'someOtherFile.txt'), 'Contents');
                fs.mkdirSync(path.join(newDir, 'somefolder'));
                fs.writeFileSync(path.join(newDir, 'somefolder', 'somefile.txt'), 'Contents');
                extfs.delSync(newDir);
                assert.ok(!fs.existsSync(newDir));
                done();
            }); // 493 = 0755
        });
        test('copy, move and delete', function (done) {
            var id = uuid.generateUuid();
            var id2 = uuid.generateUuid();
            var sourceDir = require.toUrl('./fixtures');
            var parentDir = path.join(os.tmpdir(), 'vsctests', 'extfs');
            var targetDir = path.join(parentDir, id);
            var targetDir2 = path.join(parentDir, id2);
            extfs.copy(sourceDir, targetDir, function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                assert.ok(fs.existsSync(targetDir));
                assert.ok(fs.existsSync(path.join(targetDir, 'index.html')));
                assert.ok(fs.existsSync(path.join(targetDir, 'site.css')));
                assert.ok(fs.existsSync(path.join(targetDir, 'examples')));
                assert.ok(fs.statSync(path.join(targetDir, 'examples')).isDirectory());
                assert.ok(fs.existsSync(path.join(targetDir, 'examples', 'small.jxs')));
                extfs.mv(targetDir, targetDir2, function (error) {
                    if (error) {
                        return utils_1.onError(error, done);
                    }
                    assert.ok(!fs.existsSync(targetDir));
                    assert.ok(fs.existsSync(targetDir2));
                    assert.ok(fs.existsSync(path.join(targetDir2, 'index.html')));
                    assert.ok(fs.existsSync(path.join(targetDir2, 'site.css')));
                    assert.ok(fs.existsSync(path.join(targetDir2, 'examples')));
                    assert.ok(fs.statSync(path.join(targetDir2, 'examples')).isDirectory());
                    assert.ok(fs.existsSync(path.join(targetDir2, 'examples', 'small.jxs')));
                    extfs.mv(path.join(targetDir2, 'index.html'), path.join(targetDir2, 'index_moved.html'), function (error) {
                        if (error) {
                            return utils_1.onError(error, done);
                        }
                        assert.ok(!fs.existsSync(path.join(targetDir2, 'index.html')));
                        assert.ok(fs.existsSync(path.join(targetDir2, 'index_moved.html')));
                        extfs.del(parentDir, os.tmpdir(), function (error) {
                            if (error) {
                                return utils_1.onError(error, done);
                            }
                        }, function (error) {
                            if (error) {
                                return utils_1.onError(error, done);
                            }
                            assert.ok(!fs.existsSync(parentDir));
                            done();
                        });
                    });
                });
            });
        });
        test('readdir', function (done) {
            if (strings.canNormalize && typeof process.versions['electron'] !== 'undefined' /* needs electron */) {
                var id_1 = uuid.generateUuid();
                var parentDir_1 = path.join(os.tmpdir(), 'vsctests', id_1);
                var newDir_1 = path.join(parentDir_1, 'extfs', id_1, 'öäü');
                mkdirp(newDir_1, 493, function (error) {
                    if (error) {
                        return utils_1.onError(error, done);
                    }
                    assert.ok(fs.existsSync(newDir_1));
                    extfs.readdir(path.join(parentDir_1, 'extfs', id_1), function (error, children) {
                        assert.equal(children.some(function (n) { return n === 'öäü'; }), true); // Mac always converts to NFD, so
                        extfs.del(parentDir_1, os.tmpdir(), done, ignore);
                    });
                }); // 493 = 0755
            }
            else {
                done();
            }
        });
        test('writeFileAndFlush (string)', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'extfs', id);
            var testFile = path.join(newDir, 'flushed.txt');
            mkdirp(newDir, 493, function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                assert.ok(fs.existsSync(newDir));
                extfs.writeFileAndFlush(testFile, 'Hello World', null, function (error) {
                    if (error) {
                        return utils_1.onError(error, done);
                    }
                    assert.equal(fs.readFileSync(testFile), 'Hello World');
                    var largeString = (new Array(100 * 1024)).join('Large String\n');
                    extfs.writeFileAndFlush(testFile, largeString, null, function (error) {
                        if (error) {
                            return utils_1.onError(error, done);
                        }
                        assert.equal(fs.readFileSync(testFile), largeString);
                        extfs.del(parentDir, os.tmpdir(), done, ignore);
                    });
                });
            });
        });
        test('writeFileAndFlush (stream)', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'extfs', id);
            var testFile = path.join(newDir, 'flushed.txt');
            mkdirp(newDir, 493, function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                assert.ok(fs.existsSync(newDir));
                extfs.writeFileAndFlush(testFile, toReadable('Hello World'), null, function (error) {
                    if (error) {
                        return utils_1.onError(error, done);
                    }
                    assert.equal(fs.readFileSync(testFile), 'Hello World');
                    var largeString = (new Array(100 * 1024)).join('Large String\n');
                    extfs.writeFileAndFlush(testFile, toReadable(largeString), null, function (error) {
                        if (error) {
                            return utils_1.onError(error, done);
                        }
                        assert.equal(fs.readFileSync(testFile), largeString);
                        extfs.del(parentDir, os.tmpdir(), done, ignore);
                    });
                });
            });
        });
        test('writeFileAndFlush (file stream)', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var sourceFile = require.toUrl('./fixtures/index.html');
            var newDir = path.join(parentDir, 'extfs', id);
            var testFile = path.join(newDir, 'flushed.txt');
            mkdirp(newDir, 493, function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                assert.ok(fs.existsSync(newDir));
                extfs.writeFileAndFlush(testFile, fs.createReadStream(sourceFile), null, function (error) {
                    if (error) {
                        return utils_1.onError(error, done);
                    }
                    assert.equal(fs.readFileSync(testFile).toString(), fs.readFileSync(sourceFile).toString());
                    extfs.del(parentDir, os.tmpdir(), done, ignore);
                });
            });
        });
        test('writeFileAndFlush (string, error handling)', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'extfs', id);
            var testFile = path.join(newDir, 'flushed.txt');
            mkdirp(newDir, 493, function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                assert.ok(fs.existsSync(newDir));
                fs.mkdirSync(testFile); // this will trigger an error because testFile is now a directory!
                extfs.writeFileAndFlush(testFile, 'Hello World', null, function (error) {
                    if (!error) {
                        return utils_1.onError(new Error('Expected error for writing to readonly file'), done);
                    }
                    extfs.del(parentDir, os.tmpdir(), done, ignore);
                });
            });
        });
        test('writeFileAndFlush (stream, error handling EISDIR)', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'extfs', id);
            var testFile = path.join(newDir, 'flushed.txt');
            mkdirp(newDir, 493, function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                assert.ok(fs.existsSync(newDir));
                fs.mkdirSync(testFile); // this will trigger an error because testFile is now a directory!
                var readable = toReadable('Hello World');
                extfs.writeFileAndFlush(testFile, readable, null, function (error) {
                    if (!error || error.code !== 'EISDIR') {
                        return utils_1.onError(new Error('Expected EISDIR error for writing to folder but got: ' + (error ? error.code : 'no error')), done);
                    }
                    // verify that the stream is still consumable (for https://github.com/Microsoft/vscode/issues/42542)
                    assert.equal(readable.read(), 'Hello World');
                    extfs.del(parentDir, os.tmpdir(), done, ignore);
                });
            });
        });
        test('writeFileAndFlush (stream, error handling READERROR)', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'extfs', id);
            var testFile = path.join(newDir, 'flushed.txt');
            mkdirp(newDir, 493, function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                assert.ok(fs.existsSync(newDir));
                extfs.writeFileAndFlush(testFile, toReadable('Hello World', true /* throw error */), null, function (error) {
                    if (!error || error.message !== readError) {
                        return utils_1.onError(new Error('Expected error for writing to folder'), done);
                    }
                    extfs.del(parentDir, os.tmpdir(), done, ignore);
                });
            });
        });
        test('writeFileAndFlush (stream, error handling EACCES)', function (done) {
            if (platform_1.isLinux) {
                return done(); // somehow this test fails on Linux in our TFS builds
            }
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'extfs', id);
            var testFile = path.join(newDir, 'flushed.txt');
            mkdirp(newDir, 493, function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                assert.ok(fs.existsSync(newDir));
                fs.writeFileSync(testFile, '');
                fs.chmodSync(testFile, 33060); // make readonly
                extfs.writeFileAndFlush(testFile, toReadable('Hello World'), null, function (error) {
                    if (!error || !(error.code !== 'EACCES' || error.code !== 'EPERM')) {
                        return utils_1.onError(new Error('Expected EACCES/EPERM error for writing to folder but got: ' + (error ? error.code : 'no error')), done);
                    }
                    extfs.del(parentDir, os.tmpdir(), done, ignore);
                });
            });
        });
        test('writeFileAndFlush (file stream, error handling)', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var sourceFile = require.toUrl('./fixtures/index.html');
            var newDir = path.join(parentDir, 'extfs', id);
            var testFile = path.join(newDir, 'flushed.txt');
            mkdirp(newDir, 493, function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                assert.ok(fs.existsSync(newDir));
                fs.mkdirSync(testFile); // this will trigger an error because testFile is now a directory!
                extfs.writeFileAndFlush(testFile, fs.createReadStream(sourceFile), null, function (error) {
                    if (!error) {
                        return utils_1.onError(new Error('Expected error for writing to folder'), done);
                    }
                    extfs.del(parentDir, os.tmpdir(), done, ignore);
                });
            });
        });
        test('writeFileAndFlushSync', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'extfs', id);
            var testFile = path.join(newDir, 'flushed.txt');
            mkdirp(newDir, 493, function (error) {
                if (error) {
                    return utils_1.onError(error, done);
                }
                assert.ok(fs.existsSync(newDir));
                extfs.writeFileAndFlushSync(testFile, 'Hello World', null);
                assert.equal(fs.readFileSync(testFile), 'Hello World');
                var largeString = (new Array(100 * 1024)).join('Large String\n');
                extfs.writeFileAndFlushSync(testFile, largeString, null);
                assert.equal(fs.readFileSync(testFile), largeString);
                extfs.del(parentDir, os.tmpdir(), done, ignore);
            });
        });
        test('realcase', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'extfs', id);
            mkdirp(newDir, 493, function (error) {
                // assume case insensitive file system
                if (process.platform === 'win32' || process.platform === 'darwin') {
                    var upper = newDir.toUpperCase();
                    var real = extfs.realcaseSync(upper);
                    if (real) {
                        assert.notEqual(real, upper);
                        assert.equal(real.toUpperCase(), upper);
                        assert.equal(real, newDir);
                    }
                }
                else {
                    var real = extfs.realcaseSync(newDir);
                    assert.equal(real, newDir);
                }
                extfs.del(parentDir, os.tmpdir(), done, ignore);
            });
        });
        test('realpath', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'extfs', id);
            mkdirp(newDir, 493, function (error) {
                extfs.realpath(newDir, function (error, realpath) {
                    assert.ok(realpath);
                    assert.ok(!error);
                    extfs.del(parentDir, os.tmpdir(), done, ignore);
                });
            });
        });
        test('realpathSync', function (done) {
            var id = uuid.generateUuid();
            var parentDir = path.join(os.tmpdir(), 'vsctests', id);
            var newDir = path.join(parentDir, 'extfs', id);
            mkdirp(newDir, 493, function (error) {
                var realpath;
                try {
                    realpath = extfs.realpathSync(newDir);
                }
                catch (error) {
                    assert.ok(!error);
                }
                assert.ok(realpath);
                extfs.del(parentDir, os.tmpdir(), done, ignore);
            });
        });
    });
});
