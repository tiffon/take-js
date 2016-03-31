// @flow

import ScanError from './errors/ScanError';
import Token from './Token';
import TokenType from './TokenType';


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


export default class Scanner {
    _lines: Array<string>;
    _numLines: number;
    _line: ?string;
    _lineNum: number;
    _start: number;
    _pos: number;
    _nextScan: Array<?Function>;
    _isDone: bool;

    constructor(lines: Array<string>) {
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

    isDone(): bool {
        return this._isDone;
    }

    _getC(): ?string {
        return this._line ? this._line[this._pos] : undefined;
    }

    _getEol(): bool {
        return !this._line || this._pos >= this._line.length;
    }

    _getToEolContent(): string {
        if (this._line == null) {
            throw new ScanError('Unexpected empty line', this._line, this._lineNum, this._pos);
        }
        return this._line.slice(this._start);
    }

    _getTokenContent(): string {
        if (this._line == null) {
            throw new ScanError('Unexpected empty line', this._line, this._lineNum, this._pos);
        }
        return this._line.slice(this._start, this._pos);
    }

    getToken(): ?Token {
        var scanFn: ?Function,
            hasNextLine: bool;
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

    _nextLine(): bool {
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

    _ignore(): void {
        this._start = this._pos;
    }

    _makeToken(type: string): Token {
        // let flow detect `== null` guard
        const line = this._line;
        if (line == null) {
            throw new ScanError('Unexpected `== null` line', line, this._lineNum, this._pos);
        }
        var tok = new Token(
            type,
            this._getTokenContent(),
            line,
            this._lineNum,
            this._start,
            this._pos);
        this._start = this._pos;
        return tok;
    }

    // Make a token that has no content
    _makeMarkerToken(type: string): Token {
        if (this._line == null) {
            throw new ScanError('Unexpected `== null` line', this._line, this._lineNum, this._pos);
        }
        return new Token(
            type,
            '',
            this._line,
            this._lineNum,
            this._start,
            this._start
        );
    }

    _accept(valid?: string, alpha?: bool): bool {
        var c: ?string;
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

    _acceptRun(valid: string): number {
        var count = 0,
            c = this._getC();
        while (!this._getEol() && c && valid.indexOf(c) > -1) {
            count += 1;
            this._pos += 1;
            c = this._getC();
        }
        return count;
    }

    _acceptUntil(oneOf: string): number {
        var count = 0,
            c = this._getC();
        while (!this._getEol() && c && oneOf.indexOf(c) < 0) {
            count += 1;
            this._pos += 1;
            c = this._getC();
        }
        return count;
    }

    _consume(value: string): bool {
        const line = this._line;
        if (line == null) {
            throw new ScanError('Unexpected `== null` line', line, this._lineNum, this._pos);
        }
        if (this._getEol()) {
            return false;
        }
        const nextPos = this._pos + value.length;
        if (line.slice(this._pos, nextPos) === value) {
            this._pos = nextPos;
            return true;
        }
        return false;
    }

    _consumeRegex(testRx: RegExp): bool {
        if (!testRx.global) {
            throw new Error('testRx parameter should have the global flag');
        }
        if (this._getEol()) {
            return false;
        }
        const match = testRx.exec(this._getToEolContent());
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

    _scanContext(): Token {
        if (this._line == null) {
            throw new ScanError(
                'Invalid state: error parsing context',
                this._line,
                this._lineNum,
                this._pos
            );
        }
        this._pos = this._line.search(rx.CONTEXT_WS);
        if (this._pos < 0) {
            throw new ScanError(
                'Invalid state: error parsing context',
                this._line,
                this._lineNum,
                this._pos
            );
        }
        this._nextScan[0] = this._scanStatement;
        return this._makeToken(TokenType.CONTEXT);
    }

    _scanStatement(): Token {
        const c = this._getC();
        if (c == null) {
            throw new ScanError(
                'Error scanning statement',
                this._line,
                this._lineNum,
                this._pos,
                c
            );
        }
        const isQuery = keywordSets.QUERY_START.indexOf(c) > -1;
        if (isQuery) {
            this._nextScan[0] = this._scanQuery;
            return this._makeMarkerToken(TokenType.QUERY_STATEMENT);
        } else {
            this._nextScan[0] = this._scanDirective;
            return this._makeMarkerToken(TokenType.DIRECTIVE_STATEMENT);
        }
    }

    _scanDirective(): Token {
        // a directive with just ":" is the "save" alias, use ":" as the directive ID
        if (this._accept(keywords.PARAMS_START)) {
            this._nextScan[0] = this._scanDirectiveBody;
            return this._makeToken(TokenType.DIRECTIVE_IDENTIFIER);
        }
        if (this._acceptUntil(keywordSets.DIRECTIVE_ID_END) < 1) {
            throw new ScanError(
                'Invalid directive, 0 length: ' + JSON.stringify(this._getToEolContent()),
                this._line,
                this._lineNum,
                this._pos);
        }
        const
            tok = this._makeToken(TokenType.DIRECTIVE_IDENTIFIER),
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
        throw new ScanError(
            `Invalid directive identifier terminator: ${JSON.stringify(c)}. Either "${keywords.PARAMS_START}", "${keywords.STATEMENT_END}" or end of line required.`,
            this._line,
            this._lineNum,
            this._pos);
    }

    _scanDirectiveBody(): Token {
        this._acceptRun(' ');
        this._ignore();
        const c = this._getC();
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
                throw new ScanError(
                    'Unexpected EOF, directive parameter expected.',
                    this._line,
                    this._lineNum,
                    this._pos);
            }
            this._consumeRegex(/\s+/);
        }
        // scane the directive body item
        if (this._acceptUntil(keywordSets.PARAM_END) < 1) {
            throw new ScanError(
                'Invalid directive body item, 0 length',
                this._line,
                this._lineNum,
                this._pos);
        }
        this._nextScan[0] = this._scanDirectiveBody;
        return this._makeToken(TokenType.DIRECTIVE_BODY_ITEM);
    }

    _endDirective(): Token {
        var tok = this._makeMarkerToken(TokenType.DIRECTIVE_STATEMENT_END);
        if (this._getEol()) {
            return tok;
        }
        if (this._getC() === keywords.STATEMENT_END) {
            this._nextScan[0] = this._scanInlineSubContext;
            return tok;
        }
        throw new ScanError(
            'Invalid end of directive statement: ' + JSON.stringify(this._getToEolContent()),
            this._line,
            this._lineNum,
            this._pos);
    }

    _scanQuery(): Token {
        const c = this._getC();
        if (c === keywords.CSS_START) {
            return this._scanCSSSelector();
        }
        if (c === keywords.ACCESSOR_START) {
            return this._scanAccessorSequence();
        }
        throw new ScanError(
            `Invalid query statement: ${JSON.stringify(this._getToEolContent())}`,
            this._line,
            this._lineNum,
            this._pos);
    }

    _scanCSSSelector(): Token {
        this._accept(keywords.CSS_START);
        this._acceptRun(' ');
        this._ignore();
        if (this._acceptUntil(keywordSets.CSS_STATEMENT_END) < 1) {
            throw new ScanError(
                `Invalid CSS Selector: ${JSON.stringify(this._getToEolContent())}`,
                this._line,
                this._lineNum,
                this._pos);
        }
        const
            tok = this._makeToken(TokenType.CSS_SELECTOR),
            c = this._getC();

        if (this._getEol() || c === keywords.STATEMENT_END) {
            this._nextScan[0] = this._endQueryStatement;

        } else if (c === keywords.ACCESSOR_START) {
            this._nextScan[0] = this._scanAccessorSequence;

        } else {
            throw new ScanError(
                `EOL or accessor sequence expected, instead found ${JSON.stringify(this._getToEolContent())}`,
                this._line,
                this._lineNum,
                this._pos);
        }
        return tok;
    }

    _endQueryStatement(): Token {
        const tok = this._makeMarkerToken(TokenType.QUERY_STATEMENT_END);
        if (this._getEol()) {
            return tok;
        } else if (this._getC() === keywords.STATEMENT_END) {
            this._nextScan[0] = this._scanInlineSubContext;
            return tok;
        } else {
            throw new ScanError(
                'Invalid end of query statement ' + JSON.stringify(this._getToEolContent()),
                this._line,
                this._lineNum,
                this._pos);
        }
    }

    _scanAccessorSequence(): Token {
        const tok = this._makeMarkerToken(TokenType.ACCESSOR_SEQUENCE);
        this._accept(keywords.ACCESSOR_START);
        this._ignore();
        this._nextScan[0] = this._scanAccessor;
        return tok;
    }


    // the scanner doesn't enforce rules around the sequence of attr, index or text accessors,
    // that's left to the parser, so the scanner will scan as many accessors as there are.
    _scanAccessor(): Token {
        this._acceptRun(' ');
        this._ignore();
        const c = this._getC();
        if (this._getEol() || c === keywords.STATEMENT_END) {
            // the sequence has ended
            return this._endQueryStatement();
        }
        // attr accesor
        if (c === keywords.ATTR_ACCESSOR_START) {
            // make sure it has the right format
            let invalid = this._acceptUntil(keywords.ATTR_ACCESSOR_END) < 1;
            invalid = invalid || !this._accept(keywords.ATTR_ACCESSOR_END);
            if (invalid) {
                throw new ScanError(
                    'Invalid attribute selector: ' + JSON.stringify(this._getToEolContent()),
                    this._line,
                    this._lineNum,
                    this._pos);
            }
            this._nextScan[0] = this._scanAccessor;
            return this._makeToken(TokenType.ATTR_ACCESSOR);
        }
        // text accesor
        if (this._consume(keywords.TEXT_ACCESSOR)) {
            this._nextScan[0] = this._scanAccessor;
            return this._makeToken(TokenType.TEXT_ACCESSOR);
        }
        // index accessor
        if (this._consumeRegex(rx.INT)) {
            this._nextScan[0] = this._scanAccessor;
            return this._makeToken(TokenType.INDEX_ACCESSOR);
        }
        throw new ScanError(
            'Expected an accessor, instead found: ' + JSON.stringify(this._getToEolContent()),
            this._line,
            this._lineNum,
            this._pos);
    }

    _scanInlineSubContext(): Token {
        this._accept(';');
        const tok = this._makeToken(TokenType.INLINE_SUB_CONTEXT);
        this._acceptRun(' ');
        this._ignore();
        this._nextScan[0] = this._scanStatement;
        return tok;
    }
}
