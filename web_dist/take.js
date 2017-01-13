(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["take"] = factory();
	else
		root["take"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	(function webpackMissingModule() { throw new Error("Cannot find module \"umd/take.js\""); }());


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	exports.TakeTemplate = __webpack_require__(2).TakeTemplate;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	
	var jqProvider = __webpack_require__(3),
	    parse = __webpack_require__(4).parse;


	function TakeTemplate(lines) {
	    this.node = parse(lines);
	}
	exports.TakeTemplate = TakeTemplate;

	TakeTemplate.prototype.take = function(doc) {
	    var $doc = jqProvider(doc),
	        rv = {};
	    this.node.exec(undefined, rv, $doc, $doc);
	    return rv;
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	
	// weak test for a browser environment
	if (typeof window !== 'undefined') {
	    // use jQuery
	    module.exports = jQuery;
	} else {
	    // use cheerio in node (avoid webpack's sniffing via `eval`)
	    module.exports = eval('require')('cheerio');
	}


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	
	// var jqProvider = require('./jq-provider');

	var errors = __webpack_require__(5),
	    UnexpectedTokenError = errors.UnexpectedTokenError,
	    InvalidDirectiveError = errors.InvalidDirectiveError,
	    TakeSyntaxError = errors.TakeSyntaxError;

	var tokenType = __webpack_require__(6),
	    Scanner = __webpack_require__(7),
	    parseQuery = __webpack_require__(8).parse,
	    directives = __webpack_require__(9);


	function ContextNode(depth, nodes) {
	    this._depth = depth;
	    this._nodes = nodes;
	    this._rv = undefined;
	    this._value = undefined;
	    this.lastValue = undefined;
	}

	Object.defineProperties(ContextNode.prototype, {
	    rv: {
	        get: function() {
	            return this._rv;
	        }
	    },
	    value: {
	        get: function() {
	            return this._value;
	        }
	    }
	});

	ContextNode.prototype.exec = function exec(context, rv, value, lastValue) {
	    var len = this._nodes.length,
	        i = 0;
	    this._rv = rv != null ? rv : context.rv;
	    // value in a sub-context is derived from the parent context's lastValue
	    this._value = value != null ? value : context.lastValue;
	    this.lastValue = lastValue != null ? lastValue : this._value;
	    for (; i < len; i++) {
	        this._nodes[i].exec(this);
	    }
	};


	function ContextParser(depth, getToken, defs, fromInline) {
	    this._depth = depth;
	    this._tokenGetter = [getToken];
	    this._defs = defs || {};
	    this._fromInline = fromInline;
	    this._nodes = undefined;
	    this._tok = undefined;
	    this._isDone = false;
	}

	Object.defineProperties(ContextParser.prototype, {
	    defs: {
	        get: function() {
	            return this._defs;
	        }
	    },
	    depth: {
	        get: function() {
	            return this._depth;
	        }
	    }
	});

	ContextParser.prototype.destroy = function destroy() {
	    this._depth = undefined;
	    this._tokenGetter = undefined;
	    this._defs = undefined;
	    this._nodes = undefined;
	    this._tok = undefined;
	    this._isDone = undefined;
	};

	ContextParser.prototype.parse = function parse() {
	    var tok;
	    if (this._isDone) {
	        throw new Error('Already parsed.');
	    }
	    this._nodes = [];
	    tok = this._parse();
	    return {
	        node: new ContextNode(this._depth, this._nodes),
	        endTok: tok
	    };
	};

	ContextParser.prototype.spawnContextParser = function spawnContextParser(depth, fromInline) {
	    var defs = Object.create(this._defs);
	    if (depth == null) {
	        depth = this._tok.end;
	    }
	    // TODO: prototype chain for defs
	    return new ContextParser(depth, this._tokenGetter[0], defs, fromInline);
	};

	ContextParser.prototype.nextToken = function nextToken(acceptEOF) {
	    this._tok = this._tokenGetter[0]();
	    if (!this._tok) {
	        this._isDone = true;
	        if (!acceptEOF) {
	            throw new Error('Unexpected end of input');
	        }
	    }
	    return this._tok;
	};

	ContextParser.prototype._parse = function _parse() {
	    var tok,
	        endSubTok;
	    while (true) {
	        tok = this.nextToken();
	        if (tok.type === tokenType.QUERY_STATEMENT) {
	            this._parseQuery();
	            tok = undefined;
	        } else if (tok.type === tokenType.DIRECTIVE_STATEMENT) {
	            tok = this._parseDirective();
	        } else {
	            throw new UnexpectedTokenError(
	                tok.type,
	                [tokenType.QUERY_STATEMENT, tokenType.DIRECTIVE_STATEMENT],
	                tok);
	        }
	        if (!tok) {
	            // get the next token, EOF is ok
	            tok = this.nextToken(true);
	        }
	        if (this._isDone) {
	            return;
	        }
	        if (tok.type !== tokenType.CONTEXT && tok.type !== tokenType.INLINE_SUB_CONTEXT) {
	            throw new UnexpectedTokenError(
	                tok.type,
	                [tokenType.CONTEXT, tokenType.INLINE_SUB_CONTEXT],
	                tok);
	        }
	        if (tok.type === tokenType.INLINE_SUB_CONTEXT) {
	            endSubTok = this._parseInlineSubContext();
	            if (!endSubTok) {
	                // TODO(joe): check to see if i can get rid of this last request for a token
	                // get the next token, EOF is ok
	                tok = this.nextToken(true);
	                if (!tok) {
	                    return;
	                }
	            } else {
	                // should be a context token (context from the next line)
	                if (endSubTok.type !== tokenType.CONTEXT) {
	                    throw new UnexpectedTokenError(endSubTok.type, tokenType.CONTEXT, endSubTok);
	                }
	                // should be treated like any other context token, the following conditions will check
	                // to see if it's a sub-context, the current context or an ancestor context (inline sub
	                // contexts are a one-off, so the `endSubTok` is from the next line)
	                tok = endSubTok;
	            }
	        }
	        if (tok.end > this._depth) {
	            endSubTok = this._parseContext();
	            if (!endSubTok) {
	                // `endSubTok` is either the last token parsed in the sub-context or
	                // `undefined`, if it's `undefined` then we've reached EOF
	                return;
	            }
	            // If `endSubTok` is defined, then it's a context token. It's possible the
	            // depth is less than this context's depth, so use `endSubTok` as `tok` to
	            // see if this context should end.
	            tok = endSubTok;
	            // TODO: consider detecting scenario where entered a sub-context with
	            // indent+4 but exited that sub-context with indent+2... possibly do not
	            // allow this type of thing / detect and error
	        }
	        if (tok.end < this._depth) {
	            // exit this context because the context token is more shallow than this
	            // context's indent
	            return tok;
	        }
	        // context token has the same depth, so continue this parse loop
	        // exit if the current context parser was created from an inline
	        // context - they only persist if the context is deeper
	        if (this._fromInline) {
	            return tok;
	        }
	    }
	};

	ContextParser.prototype._parseContext = function _parseContext() {
	    var subCtx = this.spawnContextParser(),
	        result = subCtx.parse();
	    subCtx.destroy();
	    this._nodes.push(result.node);
	    return result.endTok;
	};

	ContextParser.prototype._parseInlineSubContext = function _parseInlineSubContext() {
	    var subCtx = this.spawnContextParser(this._depth, true),
	        result = subCtx.parse();
	    subCtx.destroy();
	    this._nodes.push(result.node);
	    return result.endTok;
	};

	ContextParser.prototype._parseQuery = function _parseQuery() {
	    this._nodes.push(parseQuery(this));
	};

	ContextParser.prototype._parseCssSelector = function _parseCssSelector() {
	    var selector = this._tok.content.trim(),
	        query = makeCssQuery(selector),
	        tok = this.nextToken();
	    if (tok.type === tokenType.QUERY_STATEMENT_END) {
	        return [query];
	    } else if (tok.type === tokenType.ACCESSOR_SEQUENCE) {
	        return [query].concat(this._parseAccessorSeq());
	    } else {
	        throw new UnexpectedTokenError(
	            tok.type,
	            [tokenType.QUERY_STATEMENT_END, tokenType.ACCESSOR_SEQUENCE],
	            tok);
	    }
	};

	ContextParser.prototype._parseAccessorSeq = function _parseAccessorSeq() {
	    var queries = [],
	        tok = this.nextToken(),
	        attr,
	        expected;
	    if (tok.type === tokenType.INDEX_ACCESSOR) {
	        queries.push(makeIndexQuery(tok.content));
	        tok = this.nextToken();
	        // index accessor might be the only accessor
	        if (tok.type === tokenType.QUERY_STATEMENT_END) {
	            return queries;
	        }
	    }
	    // can only have one of text or attr accessors
	    if (tok.type === tokenType.TEXT_ACCESSOR) {
	        queries.push(makeTextQuery());
	    } else if (tok.type === tokenType.ATTR_ACCESSOR) {
	        // strip spaces and the brackets, ex: "[href]"
	        attr = tok.content.trim().slice(1, -1);
	        queries.push(makeAttrQuery(attr));
	    } else {
	        // if it got here, something is wrong, either the query should have ended after
	        // an index accessor (if there was one) or a text or attr accessor should have
	        // been encountered
	        expected = [tokenType.TEXT_ACCESSOR, tokenType.ATTR_ACCESSOR];
	        if (!queries.length) {
	            expected.push(tokenType.INDEX_ACCESSOR);
	        }
	        throw new UnexpectedTokenError(tok.type, expected, tok);
	    }
	    tok = this.nextToken();
	    if (tok.type !== tokenType.QUERY_STATEMENT_END) {
	        throw new UnexpectedTokenError(tok.type, tokenType.QUERY_STATEMENT_END, tok);
	    }
	    return queries;
	};

	// directives return their last token because they can parse sub-contexts
	ContextParser.prototype._parseDirective = function _parseDirective() {
	    var tok = this.nextToken(),
	        ident,
	        defNode,
	        result;
	    if (tok.type !== tokenType.DIRECTIVE_IDENTIFIER) {
	        throw new UnexpectedTokenError(tok.type, tokenType.DIRECTIVE_IDENTIFIER, tok);
	    }
	    ident = tok.content.trim();
	    if (directives[ident]) {
	        result = directives[ident](this);
	        if (result.node) {
	            // `result.node` is undefined for `def` directives bc they add the node to `this.defs` instead
	            this._nodes.push(result.node);
	        }
	        return result.endTok;
	    } else if (this._defs[ident]) {
	        this._parseCallUserDirective(this._defs[ident]);
	    } else {
	        throw new InvalidDirectiveError(
	            ident,
	            'Unknown directive: ' + JSON.stringify(ident),
	            tok);
	    }
	};

	ContextParser.prototype._parseCallUserDirective = function _parseCallUserDirective(defNode) {
	    var tok = this.nextToken();
	    if (tok.type !== tokenType.DIRECTIVE_STATEMENT_END) {
	        throw new UnexpectedTokenError(tok.type, tokenType.DIRECTIVE_STATEMENT_END, tok);
	    }
	    this._nodes.push(defNode);
	};




	function parse(lines) {
	    var scanner = new Scanner(lines),
	        tok = scanner.getToken(),
	        ctx,
	        result;
	    if (tok.type !== tokenType.CONTEXT) {
	        throw new UnexpectedTokenError(tok.type, tokenType.CONTEXT, 'Leading context token not found.');
	    }
	    ctx = new ContextParser(tok.end, scanner.getToken.bind(scanner));
	    result = ctx.parse();
	    ctx.destroy();
	    if (result.endTok) {
	        throw new UnexpectedTokenError(tok, 'EOF');
	    }
	    return result.node;
	}

	exports.parse = parse;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	
	var spaces = __webpack_require__(10).charRepeater(' ');


	function ScanError(message, line, lineNum, pos, extra) {
	    this.message = message;
	    this.line = line;
	    this.lineNum = lineNum;
	    this.pos = pos;
	    this.extra = extra;
	    this.stack = Error.call(this, '' + this).stack;
	}
	exports.ScanError = ScanError;

	ScanError.prototype = Object.create(Error.prototype);
	ScanError.prototype.constructor = ScanError;
	ScanError.prototype.name = 'ScanError';

	ScanError.prototype.toString = function toString(offset) {
	    var parts = [
	            'ScanError: {',
	            '      message: ' + this.message,
	            '         line: ' + JSON.stringify(this.line),
	            '                ' + spaces(this.pos) + '^',
	            '     line num: ' + this.lineNum,
	            '          pos: ' + this.pos,
	            '        extra: ' + JSON.stringify(this.extra),
	            '}'
	        ];
	    offset = offset || '';
	    return offset + parts.join('\n' + offset);
	};


	function UnexpectedTokenError(found, expected, token, message) {
	    this.found = found;
	    this.expected = expected;
	    this.token = token;
	    this.message = message;
	    this.stack = Error.call(this, '' + this).stack;
	}
	exports.UnexpectedTokenError = UnexpectedTokenError;

	UnexpectedTokenError.prototype = Object.create(Error.prototype);
	UnexpectedTokenError.prototype.constructor = UnexpectedTokenError;
	UnexpectedTokenError.prototype.name = 'UnexpectedTokenError';

	UnexpectedTokenError.prototype.toString = function toString(offset) {
	    var parts = [
	            'UnexpectedTokenError: {',
	            '        found: ' + this.found,
	            '     expected: ' + this.expected,
	            '      message: ' + this.message,
	            '        token: ' + (this.token
	                                    ? '\n' + this.token.toString('               ')
	                                    : this.token),
	            '}'
	        ];
	    offset = offset || '';
	    return offset + parts.join('\n' + offset);
	};


	function InvalidDirectiveError(ident, message, extra) {
	    this.ident = ident;
	    this.message = message;
	    this.extra = extra;
	    this.stack = Error.call(this, '' + this).stack;
	}
	exports.InvalidDirectiveError = InvalidDirectiveError;

	InvalidDirectiveError.prototype = Object.create(Error.prototype);
	InvalidDirectiveError.prototype.constructor = InvalidDirectiveError;
	InvalidDirectiveError.prototype.name = 'InvalidDirectiveError';

	InvalidDirectiveError.prototype.toString = function toString(offset) {
	    var parts = [
	            'InvalidDirectiveError: {',
	            '        ident: ' + JSON.stringify(this.ident),
	            '      message: ' + this.message,
	            '        extra: ' + this.extra,
	            '}'
	        ];
	    offset = offset || '';
	    return offset + parts.join('\n' + offset);
	};


	function TakeSyntaxError(message, extra) {
	    this.message = message;
	    this.extra = extra;
	    this.stack = Error.call(this, '' + this).stack;
	}
	exports.TakeSyntaxError = TakeSyntaxError;

	TakeSyntaxError.prototype = Object.create(Error.prototype);
	TakeSyntaxError.prototype.constructor = TakeSyntaxError;
	TakeSyntaxError.prototype.name = 'TakeSyntaxError';

	TakeSyntaxError.prototype.toString = function toString(offset) {
	    var parts = [
	            'TakeSyntaxError: {',
	            '      message: ' + this.message,
	            '        extra: ' + this.extra,
	            '}'
	        ];
	    offset = offset || '';
	    return offset + parts.join('\n' + offset);
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	
	module.exports = Object.freeze({
	    CONTEXT: 'TokenType{ Context }',
	    QUERY_STATEMENT: 'TokenType{ QueryStatement }',
	    QUERY_STATEMENT_END: 'TokenType{ QueryStatementend }',
	    CSS_SELECTOR: 'TokenType{ CSSSelector }',
	    ACCESSOR_SEQUENCE: 'TokenType{ AccessorSequence }',
	    INDEX_ACCESSOR: 'TokenType{ IndexAccessor }',
	    TEXT_ACCESSOR: 'TokenType{ TextAccessor }',
	    OWN_TEXT_ACCESSOR: 'TokenType{ OwnTextAccessor }',
	    ATTR_ACCESSOR: 'TokenType{ AttrAccessor }',
	    FIELD_ACCESSOR: 'TokenType{ FieldAccessor }',
	    DIRECTIVE_STATEMENT: 'TokenType{ DirectiveStatement }',
	    DIRECTIVE_STATEMENT_END: 'TokenType{ DirectiveStatementEnd }',
	    DIRECTIVE_IDENTIFIER: 'TokenType{ DirectiveIdentifier }',
	    DIRECTIVE_BODY_ITEM: 'TokenType{ DirectiveBodyItem }',
	    INLINE_SUB_CONTEXT: 'TokenType{ InlineSubContext }'
	});


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	
	var tokenType = __webpack_require__(6),
	    ScanError = __webpack_require__(5).ScanError;

	var charRepeater = __webpack_require__(10).charRepeater,
	    spaces = charRepeater(' '),
	    carrots = charRepeater('^');

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
	            '                ' + spaces(this.start) + carrots(this.end - this.start),
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
	    var isQuery = keywordSets.QUERY_START.indexOf(this._c) > -1;
	    if (isQuery) {
	        this._nextScan[0] = this._scanQuery;
	        return this._makeMarkerToken(tokenType.QUERY_STATEMENT);
	    } else {
	        this._nextScan[0] = this._scanDirective;
	        return this._makeMarkerToken(tokenType.DIRECTIVE_STATEMENT);
	    }
	};

	Scanner.prototype._scanDirective = function _scanDirective() {
	    var tok;
	    // a directive with just ":" is the "save" alias, use ":" as the directive ID
	    if (this._accept(keywords.PARAMS_START)) {
	        this._nextScan[0] = this._scanDirectiveBody;
	        return this._makeToken(tokenType.DIRECTIVE_IDENTIFIER);
	    }
	    if (this._acceptUntil(keywordSets.DIRECTIVE_ID_END) < 1) {
	        throw new ScanError(
	            'Invalid directive, 0 length: ' + JSON.stringify(this._toEolContent),
	            this._line,
	            this._lineNum,
	            this._pos);
	    }
	    tok = this._makeToken(tokenType.DIRECTIVE_IDENTIFIER);
	    if (this._eol || this._c === keywords.STATEMENT_END) {
	        this._nextScan[0] = this._endDirective;
	        return tok;
	    }
	    if (this._accept(':')) {
	        this._ignore();
	        this._nextScan[0] = this._scanDirectiveBody;
	        return tok;
	    }
	    throw new ScanError(
	        'Invalid directive identifier terminator: ' + JSON.stringify(this._c) +
	        '. Either "' + keywords.PARAMS_START + '", "' + keywords.STATEMENT_END + '" or end of line required',
	        this._line,
	        this._lineNum,
	        this._pos);
	};

	Scanner.prototype._scanDirectiveBody = function _scanDirectiveBody() {
	    this._acceptRun(' ');
	    this._ignore();
	    if (this._eol || this._c === keywords.STATEMENT_END) {
	        return this._endDirective();
	    }
	    if (this._c === keywords.CONTINUATION) {
	        // consume the line continuation character, any trailing whitespace
	        // and then possibly continue to the next line
	        this._accept(keywords.CONTINUATION);
	        this._acceptRun(' ');
	        this._ignore();
	        if (this._eol && !this._nextLine()) {
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
	    return this._makeToken(tokenType.DIRECTIVE_BODY_ITEM);
	};

	Scanner.prototype._endDirective = function _endDirective() {
	    var tok = this._makeMarkerToken(tokenType.DIRECTIVE_STATEMENT_END);
	    if (this._eol) {
	        return tok;
	    }
	    if (this._c === keywords.STATEMENT_END) {
	        this._nextScan[0] = this._scanInlineSubContext;
	        return tok;
	    }
	    throw new ScanError(
	        'Invalid end of directive statement: ' + JSON.stringify(this._toEolContent),
	        this._line,
	        this._lineNum,
	        this._pos);
	};

	Scanner.prototype._scanQuery = function _scanQuery() {
	    if (this._c === keywords.CSS_START) {
	        return this._scanCSSSelector();
	    }
	    if (this._c === keywords.ACCESSOR_START) {
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
	    this._accept(keywords.CSS_START);
	    this._acceptRun(' ');
	    this._ignore();
	    // if (this._acceptUntil(keywords.ACCESSOR_START) < 1) {
	    if (this._acceptUntil(keywordSets.CSS_STATEMENT_END) < 1) {
	        throw new ScanError(
	            'Invalid CSS Selector: ' + JSON.stringify(this._toEolContent),
	            this._line,
	            this._lineNum,
	            this._pos);
	    }
	    tok = this._makeToken(tokenType.CSS_SELECTOR);

	    if (this._eol || this._c === keywords.STATEMENT_END) {
	        this._nextScan[0] = this._endQueryStatement;

	    } else if (this._c === keywords.ACCESSOR_START) {
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
	    // return this._makeMarkerToken(tokenType.QUERY_STATEMENT_END);
	    var tok = this._makeMarkerToken(tokenType.QUERY_STATEMENT_END);
	    if (this._eol) {
	        return tok;
	    } else if (this._c === keywords.STATEMENT_END) {
	        this._nextScan[0] = this._scanInlineSubContext;
	        return tok;
	    } else {
	        throw new ScanError(
	            'Invalid end of query statement ' + JSON.stringify(this._toEolContent),
	            this._line,
	            this._lineNum,
	            this._pos);
	    }
	};

	Scanner.prototype._scanAccessorSequence = function _scanAccessorSequence() {
	    var tok = this._makeMarkerToken(tokenType.ACCESSOR_SEQUENCE);
	    this._accept(keywords.ACCESSOR_START);
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
	    if (this._eol || this._c === keywords.STATEMENT_END) {
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

	Scanner.prototype._scanInlineSubContext = function _scanInlineSubContext() {
	    var tok;
	    this._accept(';');
	    tok = this._makeToken(tokenType.INLINE_SUB_CONTEXT);
	    this._acceptRun(' ');
	    this._ignore();
	    this._nextScan[0] = this._scanStatement;
	    return tok;
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	
	var jqProvider = __webpack_require__(3);

	var UnexpectedTokenError = __webpack_require__(5).UnexpectedTokenError;

	var tokenType = __webpack_require__(6);


	function ensureJqApi(elm) {
	    if (elm instanceof jqProvider) {
	        return elm;
	    }
	    return jqProvider(elm);
	}


	function makeCssQuery(selector) {
	    return function cssQuery(elm) {
	        return ensureJqApi(elm).find(selector);
	    };
	}


	function makeIndexQuery(indexStr) {
	    var int = parseInt(indexStr, 10);
	    return function indexQuery(elm) {
	        return ensureJqApi(elm).eq(int);
	    };
	}


	function textQuery(elm) {
	    return ensureJqApi(elm).text();
	}


	function makeAttrQuery(attr) {
	    return function attrQuery(elm) {
	        return ensureJqApi(elm).attr(attr);
	    };
	}


	function accessorSeq(parser) {
	    var queries = [],
	        tok = parser.nextToken(),
	        attr,
	        expected;
	    if (tok.type === tokenType.INDEX_ACCESSOR) {
	        queries.push(makeIndexQuery(tok.content));
	        tok = parser.nextToken();
	        // index accessor might be the only accessor
	        if (tok.type === tokenType.QUERY_STATEMENT_END) {
	            return queries;
	        }
	    }
	    // can only have one of text or attr accessors
	    if (tok.type === tokenType.TEXT_ACCESSOR) {
	        queries.push(textQuery);
	    } else if (tok.type === tokenType.ATTR_ACCESSOR) {
	        // strip spaces and the brackets, ex: "[href]"
	        attr = tok.content.trim().slice(1, -1);
	        queries.push(makeAttrQuery(attr));
	    } else {
	        // if it got here, something is wrong, either the query should have ended after
	        // an index accessor (if there was one) or a text or attr accessor should have
	        // been encountered
	        expected = [tokenType.TEXT_ACCESSOR, tokenType.ATTR_ACCESSOR];
	        if (!queries.length) {
	            expected.push(tokenType.INDEX_ACCESSOR);
	        }
	        throw new UnexpectedTokenError(tok.type, expected, tok);
	    }
	    tok = parser.nextToken();
	    if (tok.type !== tokenType.QUERY_STATEMENT_END) {
	        throw new UnexpectedTokenError(tok.type, tokenType.QUERY_STATEMENT_END, tok);
	    }
	    return queries;
	}


	function cssSelector(parser) {
	    var selector = parser._tok.content.trim(),
	        query = makeCssQuery(selector),
	        tok = parser.nextToken();
	    if (tok.type === tokenType.QUERY_STATEMENT_END) {
	        return [query];
	    } else if (tok.type === tokenType.ACCESSOR_SEQUENCE) {
	        return [query].concat(accessorSeq(parser));
	    } else {
	        throw new UnexpectedTokenError(
	            tok.type,
	            [tokenType.QUERY_STATEMENT_END, tokenType.ACCESSOR_SEQUENCE],
	            tok);
	    }
	}


	function QueryNode(queries) {
	    this._queries = queries;
	}

	QueryNode.prototype.exec = function exec(context) {
	    var val = context.value,
	        len = this._queries.length,
	        i = 0;
	    for (; i < len; i++) {
	        val = this._queries[i](val);
	    }
	    context.lastValue = val;
	};


	exports.parse = function parseQuery(parser) {
	    var tok = parser.nextToken(),
	        queries;
	    if (tok.type === tokenType.CSS_SELECTOR) {
	        queries = cssSelector(parser);
	    } else if (tok.type === tokenType.ACCESSOR_SEQUENCE) {
	        queries = accessorSeq(parser);
	    } else {
	        throw new UnexpectedTokenError(
	            tok.type,
	            [tokenType.CSS_SELECTOR, tokenType.ACCESSOR_SEQUENCE],
	            tok);
	    }
	    return new QueryNode(queries);
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var errors = __webpack_require__(5),
	    UnexpectedTokenError = errors.UnexpectedTokenError,
	    TakeSyntaxError = errors.TakeSyntaxError;

	var utils = __webpack_require__(10),
	    getViaNameList = utils.getViaNameList,
	    saveToNameList = utils.saveToNameList;

	var tokenType = __webpack_require__(6);


	function getOneParam(parser) {
	    var tok = parser.nextToken(),
	        endTok;
	    if (tok.type !== tokenType.DIRECTIVE_BODY_ITEM) {
	        throw new UnexpectedTokenError(
	            tok.type,
	            tokenType.DIRECTIVE_BODY_ITEM,
	            tok);
	    }
	    endTok = parser.nextToken();
	    if (endTok.type !== tokenType.DIRECTIVE_STATEMENT_END) {
	        throw new UnexpectedTokenError(
	            endTok.type,
	            tokenType.DIRECTIVE_STATEMENT_END,
	            endTok);
	    }
	    return tok;
	}

	function getSubContext(parser, directiveName) {
	    // the next token should be a sub-context
	    var tok = parser.nextToken(),
	        subCtx,
	        result;
	    if (tok.type !== tokenType.CONTEXT) {
	        throw new UnexpectedTokenError(
	            tok.type,
	            tokenType.CONTEXT,
	            tok);
	    }
	    if (tok.end <= parser.depth) {
	        throw new TakeSyntaxError('Invalid depth, expecting to start a "' + directiveName + '" context.', tok);
	    }
	    // parse the sub-context the `SaveEachNode` will manage
	    subCtx = parser.spawnContextParser();
	    result = subCtx.parse();
	    subCtx.destroy();
	    return result;
	}


	function SaveNode(nameParts) {
	    this._nameParts = nameParts;
	}

	SaveNode.prototype.exec = function exec(context) {
	    saveToNameList(context.rv, this._nameParts, context.value);
	};

	function makeSave(parser) {
	    var tok = getOneParam(parser),
	        nameParts = tok.content.trim().split('.');
	    return {
	        node: new SaveNode(nameParts),
	        endTok: undefined
	    };
	}


	function SaveEachNode(nameParts, subContextNode) {
	    this._nameParts = nameParts;
	    this._subContext = subContextNode;
	}

	SaveEachNode.prototype.exec = function exec(context) {
	    var items = context.value,
	        results = [],
	        i = 0,
	        subCtx,
	        len,
	        item,
	        rv;
	    saveToNameList(context.rv, this._nameParts, results);
	    if (items == null || !items.length) {
	        return;
	    }
	    subCtx = this._subContext;
	    len = items.length;
	    for (; i < len; i++) {
	        item = items[i];
	        rv = {};
	        results.push(rv);
	        subCtx.exec(undefined, rv, item, item);
	    }
	};

	function makeSaveEach(parser) {
	    var tok = getOneParam(parser),
	        nameParts = tok.content.trim().split('.'),
	        result = getSubContext(parser);
	    return {
	        node: new SaveEachNode(nameParts, result.node),
	        endTok: result.endTok
	    };
	}


	function DefSubroutineNode(subCtxNode) {
	    this._subCtxNode = subCtxNode;
	}

	DefSubroutineNode.prototype.exec = function exec(context) {
	    var rv = {};
	    this._subCtxNode.exec(undefined, rv, context.value, context.value);
	    context.lastValue = rv;
	};

	function makeDefSubroutine(parser) {
	    var nameParts = [],
	        tok = parser.nextToken(),
	        defName,
	        subCtxResult;
	    // collect the name parts, which might be space separated, eg: 'def: some name'
	    while (tok.type === tokenType.DIRECTIVE_BODY_ITEM) {
	        nameParts.push(tok.content.trim());
	        tok = parser.nextToken();
	    }
	    if (!nameParts.length) {
	        throw new TakeSyntaxError('The `def` directive requires a parameter for the name', tok);
	    }
	    defName = nameParts.join(' ');
	    if (tok.type !== tokenType.DIRECTIVE_STATEMENT_END) {
	        throw new UnexpectedTokenError(tok.type, tokenType.DIRECTIVE_STATEMENT_END, tok);
	    }
	    // parse the sub context
	    subCtxResult = getSubContext(parser);
	    parser.defs[defName] = new DefSubroutineNode(subCtxResult.node);
	    return {
	        node: undefined,
	        endTok: subCtxResult.endTok
	    };
	}


	function NamespaceNode(identParts, subCtxNode) {
	    this.identParts = identParts;
	    this._subCtxNode = subCtxNode;
	}

	NamespaceNode.prototype.exec = function exec(context) {
	    var subRv = getViaNameList(context.rv, this.identParts);
	    if (subRv == null) {
	        subRv = {};
	        saveToNameList(context.rv, this.identParts, subRv);
	    }
	    this._subCtxNode.exec(undefined, subRv, context.value, context.value);
	};

	function makeNamespace(parser) {
	    var tok = getOneParam(parser),
	        nameParts = tok.content.trim().split('.'),
	        result = getSubContext(parser);
	    return {
	        node: new NamespaceNode(nameParts, result.node),
	        endTok: result.endTok
	    };
	}



	module.exports = Object.freeze({
	    save: makeSave,
	    ':': makeSave,
	    'save each': makeSaveEach,
	    def: makeDefSubroutine,
	    namespace: makeNamespace,
	    '+': makeNamespace
	});


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	
	// `nameList` is an Array of strings which are used to look up
	// possibly nested values in `src`. For example: `['a', 'b']`
	// would return `src.a.b`.
	exports.getViaNameList = function getViaNameList(src, nameList) {
	    var max,
	        i;
	    if (nameList.length === 1) {
	        return src[nameList[0]];
	    }
	    i = 0;
	    max = nameList.length - 1;
	    for (; i < max; i++) {
	        src = src[nameList[i]];
	    }
	    // `i` ends up as last index
	    return src[nameList[i]];
	};


	// `nameList` is an Array of strings which are used to save `value` to a
	// possibly nested name in `dest`. For example: `['a', 'b']` will save
	// result in `dest.a.b = value`
	exports.saveToNameList = function saveToNameList(dest, nameList, value) {
	    var part,
	        max,
	        i;
	    if (nameList.length === 1) {
	        dest[nameList[0]] = value;
	    }
	    i = 0;
	    max = nameList.length - 1;
	    for (; i < max; i++) {
	        part = nameList[i];
	        if (part in dest) {
	            dest = dest[part];
	        } else {
	            dest = dest[part] = {};
	        }
	    }
	    // `i` ends up as last index
	    dest[nameList[i]] = value;
	};


	// util for adding padding (spaces) to a string
	exports.charRepeater = function charRepeater(char) {
	    var base = '' + char,
	        baseLen = Math.pow(2, 6);
	    while (base.length < baseLen) {
	        base += base;
	    }

	    function repeater(len) {
	        var rv;
	        if (len < 1) {
	            return '';
	        }
	        if (len <= baseLen) {
	            return base.slice(-len);
	        }
	        rv = base + base;
	        while (rv.length < len) {
	            rv += base;
	        }
	        return rv.slice(-len);
	    }
	    return repeater;
	};


/***/ }
/******/ ])
});
;