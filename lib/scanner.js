
var tokenType = require('./token-type'),
    ScanError = require('./errors').ScanError;


var rx = Object.freeze({
    COMMENT_TEST: /^\s*#.*$/,
    CONTEXT_WS: /\S/,
    INT: /^-?\d+/g,
    ALPHA: /[a-zA-Z]/
});


var keywords = Object.freeze({
    CSS_START_DELIM: '$',
    ACCESSOR_START_DELIM: '|',
    ATTR_ACCESSOR_START: '[',
    ATTR_ACCESSOR_END: ']',
    TEXT_ACCESSOR: 'text'
});


function Token(type, content, line, lineNum, start, end) {
    this.type = type;
    this.content = content;
    this.line = line;
    this.lineNum = lineNum;
    this.start = start;
    this.end = end;
}

Token.prototype.toString = function toString(offset) {
    var parts = [
            'Token: {',
            '         type: ' + this.type,
            '      content: ' + JSON.stringify(this.content),
            '     line num: ' + this.lineNum,
            '   start, end: ' + this.start + ', ' + this.end,
            '         line: ' + JSON.stringify(this.line),
            '}'
        ];
    offset = offset || '';
    return offset + parts.join('\n' + offset);
};


function Scanner(lines) {
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

module.exports = Scanner;

Object.defineProperties(Scanner.prototype, {
    isDone: {
        get: function() {
            return this._isDone;
        }
    },
    _c: {
        get: function() {
            return this._line[this._pos];
        }
    },
    _eol: {
        get: function() {
            return this._pos >= this._line.length;
        }
    },
    _toEolContent: {
        get: function() {
            return this._line.slice(this._start);
        }
    },
    _tokenContent: {
        get: function() {
            return this._line.slice(this._start, this._pos);
        }
    }
});

Scanner.prototype.getToken = function getToken() {
    var scanFn,
        hasNextLine;
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
};

Scanner.prototype._nextLine = function _nextLine() {
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
};

Scanner.prototype._ignore = function _ignore() {
    this._start = this._pos;
};

Scanner.prototype._makeToken = function _makeToken(type) {
    var tok = new Token(
        type,
        this._tokenContent,
        this._line,
        this._lineNum,
        this._start,
        this._pos);
    this._start = this._pos;
    return tok;
};

// Make a token that has no content
Scanner.prototype._makeMarkerToken = function _makeMarkerToken(type) {
    return new Token(
        type,
        '',
        this._line,
        this._lineNum,
        this._start,
        this._start);
};

Scanner.prototype._accept = function _accept(valid, alpha) {
    var c;
    if (this._eol) {
        return false;
    }
    c = this._c;
    if (valid && valid.indexOf(c) > -1) {
        this._pos += 1;
        return true;
    }
    if (alpha && rx.ALPHA.test(c)) {
        this._pos += 1;
        return true;
    }
};

Scanner.prototype._acceptRun = function _acceptRun(valid) {
    var count = 0;
    while (!this._eol && valid.indexOf(this._c) > -1) {
        count += 1;
        this._pos += 1;
    }
    return count;
};

Scanner.prototype._acceptUntil = function _acceptUntil(oneOf) {
    var count = 0;
    while (!this._eol && oneOf.indexOf(this._c) < 0) {
        count += 1;
        this._pos += 1;
    }
    return count;
};

Scanner.prototype._consume = function _consume(value) {
    var nextPos;
    if (this._eol) {
        return false;
    }
    nextPos = this._pos + value.length;
    if (this._line.slice(this._pos, nextPos) === value) {
        this._pos = nextPos;
        return true;
    }
};

Scanner.prototype._consumeRegex = function _consumeRegex(testRx) {
    var match;
    if (!testRx.global) {
        throw new Error('testRx parameter should have the global flag');
    }
    if (this._eol) {
        return false;
    }
    match = testRx.exec(this._toEolContent);
    if (!match) {
        return false;
    }
    if (match.index !== 0) {
        // reset the regex (bc they retain some state)
        testRx.exec(undefined);
        return false;
    }
    this._pos += testRx.lastIndex;
    // reset the regex (bc they retain some state)
    testRx.exec(undefined);
    return true;
};

Scanner.prototype._scanContext = function _scanContext() {
    // var tok;
    this._pos = this._line.search(rx.CONTEXT_WS);
    if (this._pos < 0) {
        throw new ScanError(
            'Invalid state: error parsing context',
            this._line,
            this._lineNum,
            this._pos);
    }
    this._nextScan[0] = this._scanStatement;
    return this._makeToken(tokenType.CONTEXT);
};

Scanner.prototype._scanStatement = function _scanStatement() {
    // var tok;
    if (rx.ALPHA.test(this._c)) {
        this._nextScan[0] = this._scanDirective;
        return this._makeMarkerToken(tokenType.DIRECTIVE_STATEMENT);
    } else {
        this._nextScan[0] = this._scanQuery;
        return this._makeMarkerToken(tokenType.QUERY_STATEMENT);
    }
};

Scanner.prototype._scanDirective = function _scanDirective() {
    // accept an alpha
    var ok = this._accept(undefined, true),
        tok;
    if (!ok) {
        throw new ScanError(
            'Invalid directive, must start with an alpha, not: ' + JSON.stringify(this._c),
            this._line,
            this._lineNum,
            this._pos);
    }
    this._acceptUntil(':');

    tok = this._makeToken(tokenType.DIRECTIVE_IDENTIFIER);
    if (!this._accept(':')) {
        throw new ScanError(
            'Invalid directive identifier terminator: ":" required, found: ' + JSON.stringify(this._c),
            this._line,
            this._lineNum,
            this._pos);
    }
    this._ignore();
    this._nextScan[0] = this._scanDirectiveBody;
    return tok;
};

Scanner.prototype._scanDirectiveBody = function _scanDirectiveBody() {
    var tok;
    this._acceptRun(' ');
    this._ignore();
    if (this._acceptUntil(' ') < 1) {
        throw new ScanError(
            'Invalid directive body item, 0 length',
            this._line,
            this._lineNum,
            this._pos);
    }
    tok = this._makeToken(tokenType.DIRECTIVE_BODY_ITEM);
    if (!this._eol) {
        this._nextScan[0] = this._scanDirectiveBody;
    }
    return tok;
};

Scanner.prototype._scanQuery = function _scanQuery() {
    if (this._c === keywords.CSS_START_DELIM) {
        return this._scanCSSSelector();
    }
    if (this._c === keywords.ACCESSOR_START_DELIM) {
        return this._scanAccessorSequence();
    }

    throw new ScanError(
        'Invalid query statement: ' + JSON.stringify(this._toEolContent),
        this._line,
        this._lineNum,
        this._pos);
};

Scanner.prototype._scanCSSSelector = function _scanCSSSelector() {
    var tok;
    this._acceptRun(keywords.CSS_START_DELIM);
    this._acceptRun(' ');
    this._ignore();
    if (this._acceptUntil(keywords.ACCESSOR_START_DELIM) < 1) {
        throw new ScanError(
            'Invalid CSS Selector: ' + JSON.stringify(this._toEolContent),
            this._line,
            this._lineNum,
            this._pos);
    }
    tok = this._makeToken(tokenType.CSS_SELECTOR);
    if (this._eol) {
        this._nextScan[0] = this._endQueryStatement;
    } else if (this._c === keywords.ACCESSOR_START_DELIM) {
        this._nextScan[0] = this._scanAccessorSequence;
    } else {
        throw new ScanError(
            'EOL or accessor sequence expected, instead found ' + JSON.stringify(this._toEolContent),
            this._line,
            this._lineNum,
            this._pos);
    }
    return tok;
};

Scanner.prototype._endQueryStatement = function _endQueryStatement() {
    return this._makeMarkerToken(tokenType.QUERY_STATEMENT_END);
};

Scanner.prototype._scanAccessorSequence = function _scanAccessorSequence() {
    var tok = this._makeMarkerToken(tokenType.ACCESSOR_SEQUENCE);
    this._accept(keywords.ACCESSOR_START_DELIM);
    this._ignore();
    this._nextScan[0] = this._scanAccessor;
    return tok;
};


// the scanner doesn't enforce rules around the sequence of attr, index or text accessors,
// that's left to the parser, so the scanner will scan as many accessors as there are.
Scanner.prototype._scanAccessor = function _scanAccessor() {
    var invalid,
        tok;
    this._acceptRun(' ');
    this._ignore();
    if (this._eol) {
        // the sequence has ended
        return this._endQueryStatement();
    }
    // attr accesor
    if (this._c === keywords.ATTR_ACCESSOR_START) {
        // make sure it has the right format
        invalid = this._acceptUntil(keywords.ATTR_ACCESSOR_END) < 1;
        invalid = invalid || !this._accept(keywords.ATTR_ACCESSOR_END);
        if (invalid) {
            throw new ScanError(
                'Invalid attribute selector: ' + JSON.stringify(this._toEolContent),
                this._line,
                this._lineNum,
                this._pos);
        }
        this._nextScan[0] = this._scanAccessor;
        return this._makeToken(tokenType.ATTR_ACCESSOR);
    }
    // text accesor
    if (this._consume(keywords.TEXT_ACCESSOR)) {
        this._nextScan[0] = this._scanAccessor;
        return this._makeToken(tokenType.TEXT_ACCESSOR);
    }
    // index accessor
    if (this._consumeRegex(rx.INT)) {
        this._nextScan[0] = this._scanAccessor;
        return this._makeToken(tokenType.INDEX_ACCESSOR);
    }
    throw new ScanError(
        'Expected an accessor, instead found: ' + JSON.stringify(this._toEolContent),
        this._line,
        this._lineNum,
        this._pos);
};
