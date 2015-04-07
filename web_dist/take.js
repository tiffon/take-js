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

	exports.TakeTemplate = __webpack_require__(1).TakeTemplate;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {


	var jqProvider = __webpack_require__(2),
	    parse = __webpack_require__(3).parse;


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
/* 2 */
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
/* 3 */
/***/ function(module, exports, __webpack_require__) {


	var jqProvider = __webpack_require__(2);

	var errors = __webpack_require__(4),
	    UnexpectedTokenError = errors.UnexpectedTokenError,
	    InvalidDirectiveError = errors.InvalidDirectiveError,
	    TakeSyntaxError = errors.TakeSyntaxError;

	var tokenType = __webpack_require__(5),
	    Scanner = __webpack_require__(6);

	var HIGH_INT = Math.pow(2, 30);


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

	function makeTextQuery() {
	    return function textQuery(elm) {
	        return ensureJqApi(elm).text();
	    };
	}

	function makeAttrQuery(attr) {
	    return function attrQuery(elm) {
	        return ensureJqApi(elm).attr(attr);
	    };
	}

	function parseSaveToID(tok) {
	    if (tok.type !== tokenType.DIRECTIVE_BODY_ITEM) {
	        throw new UnexpectedTokenError(
	            tok.type,
	            tokenType.DIRECTIVE_BODY_ITEM,
	            tok,
	            'Invalid save ID');
	    }
	    return tok.content.trim().split('.');
	}

	// Util to save some name sequence to an object. For instance, `['location', 'query']`
	// will save `value` to dest['location']['query'].
	function saveTo(dest, nameParts, value) {
	    var max = nameParts.length - 1,
	        i = 0,
	        part;
	    if (!max) {
	        dest[nameParts[0]] = value;
	    } else {
	        for (; i < max; i++) {
	            part = nameParts[i];
	            if (part in dest) {
	                dest = dest[part];
	            } else {
	                dest = dest[part] = {};
	            }
	        }
	        part = nameParts[i];
	        dest[part] = value;
	    }
	}


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
	    if (lastValue != null) {
	        this.lastValue = lastValue;
	    } else if (value != null) {
	        this.lastValue = value;
	    } else if (context != null) {
	        if (context.lastValue != null) {
	            this.lastValue = context.lastValue;
	        } else if (context.value != null) {
	            this.lastValue = context.value;
	        } else {
	            this.lastValue = undefined;
	        }
	    } else {
	        this.lastValue = undefined;
	    }
	    for (; i < len; i++) {
	        this._nodes[i].exec(this);
	    }
	};


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


	function SaveNode(nameParts) {
	    this._nameParts = nameParts;
	}

	SaveNode.prototype.exec = function exec(context) {
	    saveTo(context.rv, this._nameParts, context.value);
	};


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
	    saveTo(context.rv, this._nameParts, results);
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


	function ContextParser(depth, getToken) {
	    this._depth = depth;
	    this._tokenGetter = [getToken];
	    this._nodes = undefined;
	    this._tok = undefined;
	    this._isDone = false;
	}

	ContextParser.prototype.destroy = function destroy() {
	    this._depth = undefined;
	    this._tokenGetter = undefined;
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
	    return [new ContextNode(this._depth, this._nodes), tok];
	};

	ContextParser.prototype._nextToken = function _nextToken(acceptEOF) {
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
	        tok = this._nextToken();
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
	            tok = this._nextToken(true);
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
	                tok = this._nextToken(true);
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
	    }
	};

	ContextParser.prototype._parseContext = function _parseContext() {
	    var subCtx = new ContextParser(this._tok.end, this._tokenGetter[0]),
	        pair = subCtx.parse(),
	        subNode = pair[0],
	        endTok = pair[1];
	    subCtx.destroy();
	    this._nodes.push(subNode);
	    return endTok;
	};

	ContextParser.prototype._parseInlineSubContext = function _parseInlineSubContext() {
	    var subCtx = new ContextParser(HIGH_INT, this._tokenGetter[0]),
	        pair = subCtx.parse(),
	        subNode = pair[0],
	        endTok = pair[1];
	    subCtx.destroy();
	    this._nodes.push(subNode);
	    return endTok;
	};

	ContextParser.prototype._parseQuery = function _parseQuery() {
	    var tok = this._nextToken(),
	        queries;
	    if (tok.type === tokenType.CSS_SELECTOR) {
	        queries = this._parseCssSelector();
	    } else if (tok.type === tokenType.ACCESSOR_SEQUENCE) {
	        queries = this._parseAccessorSeq();
	    } else {
	        throw new UnexpectedTokenError(
	            tok.type,
	            [tokenType.CSS_SELECTOR, tokenType.ACCESSOR_SEQUENCE],
	            tok);
	    }
	    this._nodes.push(new QueryNode(queries));
	};

	ContextParser.prototype._parseCssSelector = function _parseCssSelector() {
	    var selector = this._tok.content.trim(),
	        query = makeCssQuery(selector),
	        tok = this._nextToken();
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
	        tok = this._nextToken(),
	        attr,
	        expected;
	    if (tok.type === tokenType.INDEX_ACCESSOR) {
	        queries.push(makeIndexQuery(tok.content));
	        tok = this._nextToken();
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
	    tok = this._nextToken();
	    if (tok.type !== tokenType.QUERY_STATEMENT_END) {
	        throw new UnexpectedTokenError(tok.type, tokenType.QUERY_STATEMENT_END, tok);
	    }
	    return queries;
	};

	// directives return their last token because they can parse sub-contexts
	ContextParser.prototype._parseDirective = function _parseDirective() {
	    var tok = this._nextToken(),
	        ident;
	    if (tok.type !== tokenType.DIRECTIVE_IDENTIFIER) {
	        throw new UnexpectedTokenError(tok.type, tokenType.DIRECTIVE_IDENTIFIER, tok);
	    }
	    ident = tok.content.trim();
	    if (ident === 'save' || ident === ':') {
	        return this._parseSaveDirective();
	    } else if (ident === 'save each') {
	        return this._parseSaveEachDirective();
	    } else {
	        throw new InvalidDirectiveError(
	            ident,
	            'Expecting either "save" or "save each" directive".',
	            tok);
	    }
	};

	ContextParser.prototype._parseSaveDirective = function _parseSaveDirective() {
	    var tok = this._nextToken(),
	        nameParts = parseSaveToID(tok),
	        node = new SaveNode(nameParts);
	    this._nodes.push(node);
	};

	ContextParser.prototype._parseSaveEachDirective = function _parseSaveEachDirective() {
	    var tok = this._nextToken(),
	        nameParts = parseSaveToID(tok),
	        subCtx,
	        pair,
	        subCtxNode,
	        lastTok,
	        node;
	    tok = this._nextToken();
	    if (tok.type !== tokenType.CONTEXT) {
	        throw new UnexpectedTokenError(tok.type, tokenType.CONTEXT, tok);
	    }
	    if (tok.end <= this._depth) {
	        throw new TakeSyntaxError('Invalid depth, expecting to start a "save each" context.', tok);
	    }
	    subCtx = new ContextParser(tok.end, this._tokenGetter[0]);
	    pair = subCtx.parse();
	    subCtxNode = pair[0];
	    lastTok = pair[1];
	    subCtx.destroy();
	    node = new SaveEachNode(nameParts, subCtxNode);
	    this._nodes.push(node);
	    return lastTok;
	};


	function parse(lines) {
	    var scanner = new Scanner(lines),
	        tok = scanner.getToken(),
	        ctx,
	        pair,
	        node,
	        lastTok;
	    if (tok.type !== tokenType.CONTEXT) {
	        throw new UnexpectedTokenError(tok.type, tokenType.CONTEXT, 'Leading context token not found.');
	    }
	    ctx = new ContextParser(tok.end, scanner.getToken.bind(scanner));
	    pair = ctx.parse();
	    node = pair[0];
	    lastTok = pair[1];
	    ctx.destroy();
	    if (lastTok) {
	        throw new UnexpectedTokenError(tok, 'EOF');
	    }
	    return node;
	}

	exports.parse = parse;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {


	// util for adding padding (spaces) to a string
	var spaces = (function() {
	    var base = '                                                            ',
	        baseLen = base.length;

	    function spaces(len) {
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
	    return spaces;
	})();


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
/* 5 */
/***/ function(module, exports, __webpack_require__) {


	module.exports = Object.freeze({
	    CONTEXT: 'TokenType{ Context }',
	    QUERY_STATEMENT: 'TokenType{ QueryStatement }',
	    QUERY_STATEMENT_END: 'TokenType{ QueryStatementend }',
	    CSS_SELECTOR: 'TokenType{ CSSSelector }',
	    ACCESSOR_SEQUENCE: 'TokenType{ AccessorSequence }',
	    INDEX_ACCESSOR: 'TokenType{ IndexAccessor }',
	    TEXT_ACCESSOR: 'TokenType{ TextAccessor }',
	    ATTR_ACCESSOR: 'TokenType{ AttrAccessor }',
	    DIRECTIVE_STATEMENT: 'TokenType{ DirectiveStatement }',
	    DIRECTIVE_IDENTIFIER: 'TokenType{ DirectiveIdentifier }',
	    DIRECTIVE_BODY_ITEM: 'TokenType{ DirectiveBodyItem }',
	    INLINE_SUB_CONTEXT: 'TokenType{ InlineSubContext }'
	});


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {


	var tokenType = __webpack_require__(5),
	    ScanError = __webpack_require__(4).ScanError;


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
	    QUERY_END: ';'
	});

	var keywordSets = Object.freeze({
	    QUERY_START: keywords.CSS_START + keywords.ACCESSOR_START,
	    CSS_QUERY_END: keywords.ACCESSOR_START + keywords.QUERY_END
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
	    var c = this._c;
	    if (rx.ALPHA.test(c) || c === ':') {
	        this._nextScan[0] = this._scanDirective;
	        return this._makeMarkerToken(tokenType.DIRECTIVE_STATEMENT);

	    } else if (keywordSets.QUERY_START.indexOf(c) > -1) {

	        this._nextScan[0] = this._scanQuery;
	        return this._makeMarkerToken(tokenType.QUERY_STATEMENT);

	    } else {
	        throw new ScanError(
	            'Invalid statement: ' + JSON.stringify(this._toEolContent),
	            this._line,
	            this._lineNum,
	            this._pos);
	    }
	};

	Scanner.prototype._scanDirective = function _scanDirective() {
	    var tok;
	    // a directive without any text is an alias to "save"
	    if (this._accept(':')) {
	        tok = this._makeToken(tokenType.DIRECTIVE_IDENTIFIER);
	        this._nextScan[0] = this._scanDirectiveBody;
	        return tok;
	    }
	    // require an alpha to start
	    if (!this._accept(undefined, true)) {
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
	    if (this._acceptUntil(keywordSets.CSS_QUERY_END) < 1) {
	        throw new ScanError(
	            'Invalid CSS Selector: ' + JSON.stringify(this._toEolContent),
	            this._line,
	            this._lineNum,
	            this._pos);
	    }
	    tok = this._makeToken(tokenType.CSS_SELECTOR);

	    if (this._eol || this._c === keywords.QUERY_END) {
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
	    } else if (this._c === keywords.QUERY_END) {
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
	    if (this._eol || this._c === keywords.QUERY_END) {
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


/***/ }
/******/ ])
});
;
