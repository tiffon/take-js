'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ScanError = require('./errors/ScanError');

var _ScanError2 = _interopRequireDefault(_ScanError);

var _Token = require('./Token');

var _Token2 = _interopRequireDefault(_Token);

var _TokenType = require('./TokenType');

var _TokenType2 = _interopRequireDefault(_TokenType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var rx = Object.freeze({
    COMMENT_TEST: /^\s*#.*$/,
    CONTEXT_WS: /\S/,
    INT: /^-?\d+/g,
    ALPHA: /[a-zA-Z]/
});

var keywords = Object.freeze({
    CSS_START: '$',
    ACCESSOR_START: '|',
    ATTR_ACCESSOR_START: '[',
    ATTR_ACCESSOR_END: ']',
    TEXT_ACCESSOR: 'text',
    OWN_TEXT_ACCESSOR: 'text',
    FIELD_ACCESSOR_START: '.',
    STATEMENT_END: ';',
    PARAMS_START: ':',
    CONTINUATION: ','
});

var keywordSets = Object.freeze({
    QUERY_START: keywords.CSS_START + keywords.ACCESSOR_START,
    CSS_STATEMENT_END: keywords.ACCESSOR_START + keywords.STATEMENT_END,
    DIRECTIVE_ID_END: keywords.PARAMS_START + keywords.STATEMENT_END,
    PARAM_END: ' ' + keywords.STATEMENT_END + keywords.CONTINUATION
});

var Scanner = function () {
    function Scanner(lines) {
        _classCallCheck(this, Scanner);

        this._lines = lines;
        this._numLines = lines.length;
        this._line = undefined;
        this._lineNum = 0;
        this._start = 0;
        this._pos = 0;
        // Pointer to the next scan function. Use an Array to avoid the optimization of creating
        // a hidden class based on the function value:
        //      http://stackoverflow.com/a/28202612/1888292
        this._nextScan = [];
        this._isDone = false;
    }

    _createClass(Scanner, [{
        key: 'isDone',
        value: function isDone() {
            return this._isDone;
        }
    }, {
        key: '_getC',
        value: function _getC() {
            return this._line ? this._line[this._pos] : undefined;
        }
    }, {
        key: '_getEol',
        value: function _getEol() {
            return !this._line || this._pos >= this._line.length;
        }
    }, {
        key: '_getToEolContent',
        value: function _getToEolContent() {
            if (this._line == null) {
                throw new _ScanError2.default('Unexpected empty line', this._line, this._lineNum, this._pos);
            }
            return this._line.slice(this._start);
        }
    }, {
        key: '_getTokenContent',
        value: function _getTokenContent() {
            if (this._line == null) {
                throw new _ScanError2.default('Unexpected empty line', this._line, this._lineNum, this._pos);
            }
            return this._line.slice(this._start, this._pos);
        }
    }, {
        key: 'getToken',
        value: function getToken() {
            var scanFn, hasNextLine;
            if (this._isDone) {
                return;
            }
            scanFn = this._nextScan[0];
            this._nextScan[0] = undefined;
            if (!scanFn) {
                hasNextLine = this._nextLine();
                if (!hasNextLine) {
                    this._isDone = true;
                    return;
                }
                scanFn = this._scanContext;
            }
            return scanFn.call(this);
        }
    }, {
        key: '_nextLine',
        value: function _nextLine() {
            if (this._lineNum >= this._numLines) {
                return false;
            }
            while (this._lineNum < this._numLines) {
                this._line = this._lines[this._lineNum].replace(/\s+$/, '');
                this._lineNum += 1;
                this._start = this._pos = 0;
                if (!this._line.length || rx.COMMENT_TEST.test(this._line)) {
                    this._line = undefined;
                    continue;
                }
                break;
            }
            return !!this._line;
        }
    }, {
        key: '_ignore',
        value: function _ignore() {
            this._start = this._pos;
        }
    }, {
        key: '_makeToken',
        value: function _makeToken(type) {
            // let flow detect `== null` guard
            var line = this._line;
            if (line == null) {
                throw new _ScanError2.default('Unexpected `== null` line', line, this._lineNum, this._pos);
            }
            var tok = new _Token2.default(type, this._getTokenContent(), line, this._lineNum, this._start, this._pos);
            this._start = this._pos;
            return tok;
        }

        // Make a token that has no content

    }, {
        key: '_makeMarkerToken',
        value: function _makeMarkerToken(type) {
            if (this._line == null) {
                throw new _ScanError2.default('Unexpected `== null` line', this._line, this._lineNum, this._pos);
            }
            return new _Token2.default(type, '', this._line, this._lineNum, this._start, this._start);
        }
    }, {
        key: '_accept',
        value: function _accept(valid, alpha) {
            var c;
            if (this._getEol()) {
                return false;
            }
            c = this._getC();
            if (valid && c && valid.indexOf(c) > -1) {
                this._pos += 1;
                return true;
            }
            if (alpha && c && rx.ALPHA.test(c)) {
                this._pos += 1;
                return true;
            }
            return false;
        }
    }, {
        key: '_acceptRun',
        value: function _acceptRun(valid) {
            var count = 0,
                c = this._getC();
            while (!this._getEol() && c && valid.indexOf(c) > -1) {
                count += 1;
                this._pos += 1;
                c = this._getC();
            }
            return count;
        }
    }, {
        key: '_acceptUntil',
        value: function _acceptUntil(oneOf) {
            var count = 0,
                c = this._getC();
            while (!this._getEol() && c && oneOf.indexOf(c) < 0) {
                count += 1;
                this._pos += 1;
                c = this._getC();
            }
            return count;
        }
    }, {
        key: '_consume',
        value: function _consume(value) {
            var line = this._line;
            if (line == null) {
                throw new _ScanError2.default('Unexpected `== null` line', line, this._lineNum, this._pos);
            }
            if (this._getEol()) {
                return false;
            }
            var nextPos = this._pos + value.length;
            if (line.slice(this._pos, nextPos) === value) {
                this._pos = nextPos;
                return true;
            }
            return false;
        }
    }, {
        key: '_consumeRegex',
        value: function _consumeRegex(testRx) {
            if (!testRx.global) {
                throw new Error('testRx parameter should have the global flag');
            }
            if (this._getEol()) {
                return false;
            }
            var match = testRx.exec(this._getToEolContent());
            if (!match) {
                return false;
            }
            if (match.index !== 0) {
                // reset the regex (bc they retain some state)
                testRx.lastIndex = 0;
                return false;
            }
            this._pos += testRx.lastIndex;
            // reset the regex (bc they retain some state)
            testRx.lastIndex = 0;
            return true;
        }
    }, {
        key: '_scanContext',
        value: function _scanContext() {
            if (this._line == null) {
                throw new _ScanError2.default('Invalid state: error parsing context', this._line, this._lineNum, this._pos);
            }
            this._pos = this._line.search(rx.CONTEXT_WS);
            if (this._pos < 0) {
                throw new _ScanError2.default('Invalid state: error parsing context', this._line, this._lineNum, this._pos);
            }
            this._nextScan[0] = this._scanStatement;
            return this._makeToken(_TokenType2.default.CONTEXT);
        }
    }, {
        key: '_scanStatement',
        value: function _scanStatement() {
            var c = this._getC();
            if (c == null) {
                throw new _ScanError2.default('Error scanning statement', this._line, this._lineNum, this._pos, c);
            }
            var isQuery = keywordSets.QUERY_START.indexOf(c) > -1;
            if (isQuery) {
                this._nextScan[0] = this._scanQuery;
                return this._makeMarkerToken(_TokenType2.default.QUERY_STATEMENT);
            } else {
                this._nextScan[0] = this._scanDirective;
                return this._makeMarkerToken(_TokenType2.default.DIRECTIVE_STATEMENT);
            }
        }
    }, {
        key: '_scanDirective',
        value: function _scanDirective() {
            // a directive with just ":" is the "save" alias, use ":" as the directive ID
            if (this._accept(keywords.PARAMS_START)) {
                this._nextScan[0] = this._scanDirectiveBody;
                return this._makeToken(_TokenType2.default.DIRECTIVE_IDENTIFIER);
            }
            if (this._acceptUntil(keywordSets.DIRECTIVE_ID_END) < 1) {
                throw new _ScanError2.default('Invalid directive, 0 length: ' + JSON.stringify(this._getToEolContent()), this._line, this._lineNum, this._pos);
            }
            var tok = this._makeToken(_TokenType2.default.DIRECTIVE_IDENTIFIER),
                c = this._getC();
            if (this._getEol() || c === keywords.STATEMENT_END) {
                this._nextScan[0] = this._endDirective;
                return tok;
            }
            if (this._accept(':')) {
                this._ignore();
                this._nextScan[0] = this._scanDirectiveBody;
                return tok;
            }
            throw new _ScanError2.default('Invalid directive identifier terminator: ' + JSON.stringify(c) + '. Either "' + keywords.PARAMS_START + '", "' + keywords.STATEMENT_END + '" or end of line required.', this._line, this._lineNum, this._pos);
        }
    }, {
        key: '_scanDirectiveBody',
        value: function _scanDirectiveBody() {
            this._acceptRun(' ');
            this._ignore();
            var c = this._getC();
            if (this._getEol() || c === keywords.STATEMENT_END) {
                return this._endDirective();
            }
            if (c === keywords.CONTINUATION) {
                // consume the line continuation character, any trailing whitespace
                // and then possibly continue to the next line
                this._accept(keywords.CONTINUATION);
                this._acceptRun(' ');
                this._ignore();
                if (this._getEol() && !this._nextLine()) {
                    throw new _ScanError2.default('Unexpected EOF, directive parameter expected.', this._line, this._lineNum, this._pos);
                }
                this._consumeRegex(/\s+/);
            }
            // scane the directive body item
            if (this._acceptUntil(keywordSets.PARAM_END) < 1) {
                throw new _ScanError2.default('Invalid directive body item, 0 length', this._line, this._lineNum, this._pos);
            }
            this._nextScan[0] = this._scanDirectiveBody;
            return this._makeToken(_TokenType2.default.DIRECTIVE_BODY_ITEM);
        }
    }, {
        key: '_endDirective',
        value: function _endDirective() {
            var tok = this._makeMarkerToken(_TokenType2.default.DIRECTIVE_STATEMENT_END);
            if (this._getEol()) {
                return tok;
            }
            if (this._getC() === keywords.STATEMENT_END) {
                this._nextScan[0] = this._scanInlineSubContext;
                return tok;
            }
            throw new _ScanError2.default('Invalid end of directive statement: ' + JSON.stringify(this._getToEolContent()), this._line, this._lineNum, this._pos);
        }
    }, {
        key: '_scanQuery',
        value: function _scanQuery() {
            var c = this._getC();
            if (c === keywords.CSS_START) {
                return this._scanCSSSelector();
            }
            if (c === keywords.ACCESSOR_START) {
                return this._scanAccessorSequence();
            }
            throw new _ScanError2.default('Invalid query statement: ' + JSON.stringify(this._getToEolContent()), this._line, this._lineNum, this._pos);
        }
    }, {
        key: '_scanCSSSelector',
        value: function _scanCSSSelector() {
            this._accept(keywords.CSS_START);
            this._acceptRun(' ');
            this._ignore();
            if (this._acceptUntil(keywordSets.CSS_STATEMENT_END) < 1) {
                throw new _ScanError2.default('Invalid CSS Selector: ' + JSON.stringify(this._getToEolContent()), this._line, this._lineNum, this._pos);
            }
            var tok = this._makeToken(_TokenType2.default.CSS_SELECTOR),
                c = this._getC();

            if (this._getEol() || c === keywords.STATEMENT_END) {
                this._nextScan[0] = this._endQueryStatement;
            } else if (c === keywords.ACCESSOR_START) {
                this._nextScan[0] = this._scanAccessorSequence;
            } else {
                throw new _ScanError2.default('EOL or accessor sequence expected, instead found ' + JSON.stringify(this._getToEolContent()), this._line, this._lineNum, this._pos);
            }
            return tok;
        }
    }, {
        key: '_endQueryStatement',
        value: function _endQueryStatement() {
            var tok = this._makeMarkerToken(_TokenType2.default.QUERY_STATEMENT_END);
            if (this._getEol()) {
                return tok;
            } else if (this._getC() === keywords.STATEMENT_END) {
                this._nextScan[0] = this._scanInlineSubContext;
                return tok;
            } else {
                throw new _ScanError2.default('Invalid end of query statement ' + JSON.stringify(this._getToEolContent()), this._line, this._lineNum, this._pos);
            }
        }
    }, {
        key: '_scanAccessorSequence',
        value: function _scanAccessorSequence() {
            var tok = this._makeMarkerToken(_TokenType2.default.ACCESSOR_SEQUENCE);
            this._accept(keywords.ACCESSOR_START);
            this._ignore();
            this._nextScan[0] = this._scanAccessor;
            return tok;
        }

        // the scanner doesn't enforce rules around the sequence of attr, index or text accessors,
        // that's left to the parser, so the scanner will scan as many accessors as there are.

    }, {
        key: '_scanAccessor',
        value: function _scanAccessor() {
            this._acceptRun(' ');
            this._ignore();
            var c = this._getC();
            if (this._getEol() || c === keywords.STATEMENT_END) {
                // the sequence has ended
                return this._endQueryStatement();
            }
            // attr accesor
            if (c === keywords.ATTR_ACCESSOR_START) {
                // make sure it has the right format
                var invalid = this._acceptUntil(keywords.ATTR_ACCESSOR_END) < 1;
                invalid = invalid || !this._accept(keywords.ATTR_ACCESSOR_END);
                if (invalid) {
                    throw new _ScanError2.default('Invalid attribute selector: ' + JSON.stringify(this._getToEolContent()), this._line, this._lineNum, this._pos);
                }
                this._nextScan[0] = this._scanAccessor;
                return this._makeToken(_TokenType2.default.ATTR_ACCESSOR);
            }
            // text accesor
            if (this._consume(keywords.TEXT_ACCESSOR)) {
                this._nextScan[0] = this._scanAccessor;
                return this._makeToken(_TokenType2.default.TEXT_ACCESSOR);
            }
            // index accessor
            if (this._consumeRegex(rx.INT)) {
                this._nextScan[0] = this._scanAccessor;
                return this._makeToken(_TokenType2.default.INDEX_ACCESSOR);
            }
            throw new _ScanError2.default('Expected an accessor, instead found: ' + JSON.stringify(this._getToEolContent()), this._line, this._lineNum, this._pos);
        }
    }, {
        key: '_scanInlineSubContext',
        value: function _scanInlineSubContext() {
            this._accept(';');
            var tok = this._makeToken(_TokenType2.default.INLINE_SUB_CONTEXT);
            this._acceptRun(' ');
            this._ignore();
            this._nextScan[0] = this._scanStatement;
            return tok;
        }
    }]);

    return Scanner;
}();

exports.default = Scanner;