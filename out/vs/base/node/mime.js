/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/mime", "vs/base/node/encoding"], function (require, exports, mime, encoding) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Lots of binary file types exists where the type can be determined by matching the first few bytes against some "magic patterns".
     * E.g. PDF files always start with %PDF- and the rest of the file contains mostly text, but sometimes binary data (for fonts and images).
     * In order to detect these types correctly (and independently from the file's extension), the content base mime type detection must be performed
     * on any file, not only on text files.
     *
     * Here is the original mime type detection in pseudocode:
     *
     * let mimes = [];
     *
     * read file extension
     *
     * if (file extension matches) {
     * 	if (file extension is bogus) {
     * 		// ignore.
     * 		// this covers *.manifest files which can contain arbitrary content, so the extension is of no value.
     * 		// a consequence of this is that the content based mime type becomes the most specific type in the array
     * 	} else {
     * 		mimes.push(associated mime type)	  // first element: most specific
     * 	}
     * }
     *
     * read file contents
     *
     * if (content based match found) {	// this is independent from text or binary
     * 	mimes.push(associated mime type)
     * 	if (a second mime exists for the match) {   // should be rare; text/plain should never be included here
     * 		// e.g. for svg: ['image/svg+xml', 'application/xml']
     * 		mimes.push(second mime)
     * 	}
     * }
     *
     * if (content == text)
     * 	mimes.push('text/plain')   // last element: least specific
     * else
     * 	mimes.push('application/octet-stream')    // last element: least specific
     */
    var ZERO_BYTE_DETECTION_BUFFER_MAX_LEN = 512; // number of bytes to look at to decide about a file being binary or not
    var NO_GUESS_BUFFER_MAX_LEN = 512; // when not auto guessing the encoding, small number of bytes are enough
    var AUTO_GUESS_BUFFER_MAX_LEN = 512 * 8; // with auto guessing we want a lot more content to be read for guessing
    function maxBufferLen(arg1) {
        var autoGuessEncoding;
        if (typeof arg1 === 'boolean') {
            autoGuessEncoding = arg1;
        }
        else {
            autoGuessEncoding = arg1 && arg1.autoGuessEncoding;
        }
        return autoGuessEncoding ? AUTO_GUESS_BUFFER_MAX_LEN : NO_GUESS_BUFFER_MAX_LEN;
    }
    exports.maxBufferLen = maxBufferLen;
    function detectMimeAndEncodingFromBuffer(_a, autoGuessEncoding) {
        var buffer = _a.buffer, bytesRead = _a.bytesRead;
        var enc = encoding.detectEncodingByBOMFromBuffer(buffer, bytesRead);
        // Detect 0 bytes to see if file is binary (ignore for UTF 16 though)
        var isText = true;
        if (enc !== encoding.UTF16be && enc !== encoding.UTF16le) {
            for (var i = 0; i < bytesRead && i < ZERO_BYTE_DETECTION_BUFFER_MAX_LEN; i++) {
                if (buffer.readInt8(i) === 0) {
                    isText = false;
                    break;
                }
            }
        }
        if (autoGuessEncoding && isText && !enc) {
            return encoding.guessEncodingByBuffer(buffer.slice(0, bytesRead)).then(function (enc) {
                return {
                    mimes: isText ? [mime.MIME_TEXT] : [mime.MIME_BINARY],
                    encoding: enc
                };
            });
        }
        return {
            mimes: isText ? [mime.MIME_TEXT] : [mime.MIME_BINARY],
            encoding: enc
        };
    }
    exports.detectMimeAndEncodingFromBuffer = detectMimeAndEncodingFromBuffer;
});
