define(["require", "exports", "vs/editor/browser/controller/textAreaInput", "vs/editor/browser/controller/textAreaState", "vs/editor/common/core/range", "vs/base/browser/fastDomNode", "vs/base/browser/browser"], function (require, exports, textAreaInput_1, textAreaState_1, range_1, fastDomNode_1, browser) {
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    // To run this test, open imeTester.html
    var SingleLineTestModel = /** @class */ (function () {
        function SingleLineTestModel(line) {
            this._line = line;
        }
        SingleLineTestModel.prototype._setText = function (text) {
            this._line = text;
        };
        SingleLineTestModel.prototype.getLineMaxColumn = function (lineNumber) {
            return this._line.length + 1;
        };
        SingleLineTestModel.prototype.getValueInRange = function (range, eol) {
            return this._line.substring(range.startColumn - 1, range.endColumn - 1);
        };
        SingleLineTestModel.prototype.getModelLineContent = function (lineNumber) {
            return this._line;
        };
        SingleLineTestModel.prototype.getLineCount = function () {
            return 1;
        };
        return SingleLineTestModel;
    }());
    var TestView = /** @class */ (function () {
        function TestView(model) {
            this._model = model;
        }
        TestView.prototype.paint = function (output) {
            var r = '';
            for (var i = 1; i <= this._model.getLineCount(); i++) {
                var content = this._model.getModelLineContent(i);
                r += content + '<br/>';
            }
            output.innerHTML = r;
        };
        return TestView;
    }());
    function doCreateTest(description, inputStr, expectedStr) {
        var cursorOffset = 0;
        var cursorLength = 0;
        var container = document.createElement('div');
        container.className = 'container';
        var title = document.createElement('div');
        title.className = 'title';
        title.innerHTML = description + '. Type <strong>' + inputStr + '</strong>';
        container.appendChild(title);
        var startBtn = document.createElement('button');
        startBtn.innerHTML = 'Start';
        container.appendChild(startBtn);
        var input = document.createElement('textarea');
        input.setAttribute('rows', '10');
        input.setAttribute('cols', '40');
        container.appendChild(input);
        var model = new SingleLineTestModel('some  text');
        var textAreaInputHost = {
            getPlainTextToCopy: function () { return ''; },
            getHTMLToCopy: function () { return ''; },
            getScreenReaderContent: function (currentState) {
                if (browser.isIPad) {
                    // Do not place anything in the textarea for the iPad
                    return textAreaState_1.TextAreaState.EMPTY;
                }
                var selection = new range_1.Range(1, 1 + cursorOffset, 1, 1 + cursorOffset + cursorLength);
                return textAreaState_1.PagedScreenReaderStrategy.fromEditorSelection(currentState, model, selection, true);
            },
            deduceModelPosition: function (viewAnchorPosition, deltaOffset, lineFeedCnt) {
                return null;
            }
        };
        var handler = new textAreaInput_1.TextAreaInput(textAreaInputHost, fastDomNode_1.createFastDomNode(input));
        var output = document.createElement('pre');
        output.className = 'output';
        container.appendChild(output);
        var check = document.createElement('pre');
        check.className = 'check';
        container.appendChild(check);
        var br = document.createElement('br');
        br.style.clear = 'both';
        container.appendChild(br);
        var view = new TestView(model);
        var updatePosition = function (off, len) {
            cursorOffset = off;
            cursorLength = len;
            handler.writeScreenReaderContent('selection changed');
            handler.focusTextArea();
        };
        var updateModelAndPosition = function (text, off, len) {
            model._setText(text);
            updatePosition(off, len);
            view.paint(output);
            var expected = 'some ' + expectedStr + ' text';
            if (text === expected) {
                check.innerHTML = '[GOOD]';
                check.className = 'check good';
            }
            else {
                check.innerHTML = '[BAD]';
                check.className = 'check bad';
            }
            check.innerHTML += expected;
        };
        handler.onType(function (e) {
            console.log('type text: ' + e.text + ', replaceCharCnt: ' + e.replaceCharCnt);
            var text = model.getModelLineContent(1);
            var preText = text.substring(0, cursorOffset - e.replaceCharCnt);
            var postText = text.substring(cursorOffset + cursorLength);
            var midText = e.text;
            updateModelAndPosition(preText + midText + postText, (preText + midText).length, 0);
        });
        view.paint(output);
        startBtn.onclick = function () {
            updateModelAndPosition('some  text', 5, 0);
            input.focus();
        };
        return container;
    }
    var TESTS = [
        { description: 'Japanese IME 1', in: 'sennsei [Enter]', out: 'せんせい' },
        { description: 'Japanese IME 2', in: 'konnichiha [Enter]', out: 'こんいちは' },
        { description: 'Japanese IME 3', in: 'mikann [Enter]', out: 'みかん' },
        { description: 'Korean IME 1', in: 'gksrmf [Space]', out: '한글 ' },
        { description: 'Chinese IME 1', in: '.,', out: '。，' },
        { description: 'Chinese IME 2', in: 'ni [Space] hao [Space]', out: '你好' },
        { description: 'Chinese IME 3', in: 'hazni [Space]', out: '哈祝你' },
        { description: 'Mac dead key 1', in: '`.', out: '`.' },
        { description: 'Mac hold key 1', in: 'e long press and 1', out: 'é' }
    ];
    TESTS.forEach(function (t) {
        document.body.appendChild(doCreateTest(t.description, t.in, t.out));
    });
});
