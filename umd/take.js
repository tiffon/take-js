(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
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

	'use strict';

	var _TakeTemplate = __webpack_require__(11);

	var _TakeTemplate2 = _interopRequireDefault(_TakeTemplate);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.TakeTemplate = _TakeTemplate2.default;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _utils = __webpack_require__(2);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var spaces = (0, _utils.charRepeater)(' '),
	    carrots = (0, _utils.charRepeater)('^');

	var Token = function () {
	    function Token(type, content, line, lineNum, start, end) {
	        _classCallCheck(this, Token);

	        this.type = type;
	        this.content = content;
	        this.line = line;
	        this.lineNum = lineNum;
	        this.start = start;
	        this.end = end;
	    }

	    _createClass(Token, [{
	        key: 'toString',
	        value: function toString(offset) {
	            return (0, _utils.dedentOffset)(offset, '\n            Token {\n                     type: ' + this.type + '\n                  content: ' + JSON.stringify(this.content) + '\n                 line num: ' + this.lineNum + '\n               start, end: ' + this.start + ', ' + this.end + '\n                     line: ' + JSON.stringify(this.line) + '\n                            ' + (spaces(this.start) + carrots(this.end - this.start)) + '\n            }\n        ');
	        }
	    }]);

	    return Token;
	}();

	exports.default = Token;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getViaNameList = getViaNameList;
	exports.saveToNameList = saveToNameList;
	exports.charRepeater = charRepeater;
	exports.dedentOffset = dedentOffset;
	exports.newConstantsNamespace = newConstantsNamespace;

	var _dedent = __webpack_require__(23);

	var _dedent2 = _interopRequireDefault(_dedent);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// `nameList` is an Array of strings which are used to look up
	// possibly nested values in `src`. For example: `['a', 'b']`
	// would return `src.a.b`.
	function getViaNameList(src, nameList) {
	    var i;
	    if (nameList.length === 1) {
	        return src[nameList[0]];
	    }
	    var max = nameList.length - 1;
	    i = 0;
	    for (; i < max; i++) {
	        src = src[nameList[i]];
	    }
	    // `i` ends up as last index
	    return src[nameList[i]];
	}

	// `nameList` is an Array of strings which are used to save `value` to a
	// possibly nested name in `dest`. For example: `['a', 'b']` will save
	// result in `dest.a.b = value`
	function saveToNameList(dest, nameList, value) {
	    var part, max, i;
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
	}

	// util for adding padding (spaces) to a string
	function charRepeater(char) {
	    var base = '' + char,
	        baseLen = 64;
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
	}

	// dedents the string `s`, then adds a leading string if `pre` is supplied
	function dedentOffset(pre, s) {
	    var value = (0, _dedent2.default)(s);
	    if (!pre) {
	        return value;
	    }
	    var parts = value.split('\n');
	    return pre + parts.join('\n' + pre);
	}

	// Returns an object with keys equal to their value. The value can optionally
	// be formatted, primarily to have leading and trailing strings attached. For
	// instance, if opts.format === 'Expression { %s }', and source === ['SMILE'],
	// the result will be:
	//
	//      {
	//          SMILE: 'Expression { SMILE }'
	//      }
	//
	// Options:
	//  - format : string - format string to modify the values of the keys, the
	//                      `'%s'` is replaced with the key
	//  - source : array<string> - array of strings to construct the key/values from
	function newConstantsNamespace(opts) {
	    var pre = '',
	        post = '',
	        i = 0,
	        src;
	    if (Array.isArray(opts)) {
	        src = opts;
	    } else {
	        src = opts.source;
	        if (opts.format) {
	            var parts = opts.format.split('%s');
	            pre = parts[0] || '';
	            post = parts[1] || '';
	        }
	    }
	    var len = src.length,
	        rv = {};
	    for (; i < len; i++) {
	        var v = src[i];
	        rv[v] = pre + v + post;
	    }
	    return Object.freeze(rv);
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _utils = __webpack_require__(2);

	var TokenType = (0, _utils.newConstantsNamespace)({
	    format: 'TokenType{ %s }',
	    source: ['CONTEXT', 'QUERY_STATEMENT', 'QUERY_STATEMENT_END', 'CSS_SELECTOR', 'ACCESSOR_SEQUENCE', 'INDEX_ACCESSOR', 'TEXT_ACCESSOR', 'OWN_TEXT_ACCESSOR', 'ATTR_ACCESSOR', 'FIELD_ACCESSOR', 'DIRECTIVE_STATEMENT', 'DIRECTIVE_STATEMENT_END', 'DIRECTIVE_IDENTIFIER', 'DIRECTIVE_BODY_ITEM', 'INLINE_SUB_CONTEXT']
	});

	exports.default = TokenType;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _InvalidDirectiveError = __webpack_require__(17);

	var _InvalidDirectiveError2 = _interopRequireDefault(_InvalidDirectiveError);

	var _UnexpectedTokenError = __webpack_require__(6);

	var _UnexpectedTokenError2 = _interopRequireDefault(_UnexpectedTokenError);

	var _directives = __webpack_require__(13);

	var _directives2 = _interopRequireDefault(_directives);

	var _INode = __webpack_require__(3);

	var _query = __webpack_require__(21);

	var _Token = __webpack_require__(1);

	var _Token2 = _interopRequireDefault(_Token);

	var _TokenType = __webpack_require__(4);

	var _TokenType2 = _interopRequireDefault(_TokenType);

	var _ContextNode = __webpack_require__(19);

	var _ContextNode2 = _interopRequireDefault(_ContextNode);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ContextParser = function () {
	    function ContextParser(depth, getToken, defs, fromInline) {
	        _classCallCheck(this, ContextParser);

	        this._depth = depth;
	        this._tokenGetter = [getToken];
	        this._defs = defs || {};
	        this._fromInline = !!fromInline;
	        this._nodes = [];
	        this._tok = undefined;
	        this._isDone = false;
	    }

	    _createClass(ContextParser, [{
	        key: 'getDefs',
	        value: function getDefs() {
	            return this._defs;
	        }
	    }, {
	        key: 'getDepth',
	        value: function getDepth() {
	            return this._depth;
	        }
	    }, {
	        key: 'destroy',
	        value: function destroy() {
	            // this._depth = undefined;
	            // this._tokenGetter = undefined;
	            // this._defs = undefined;
	            // this._nodes = undefined;
	            // this._tok = undefined;
	            // this._isDone = undefined;
	        }
	    }, {
	        key: 'parse',
	        value: function parse() {
	            var tok;
	            if (this._isDone) {
	                throw new Error('Already parsed.');
	            }
	            tok = this._parse();
	            return {
	                node: new _ContextNode2.default(this._depth, this._nodes),
	                endTok: tok
	            };
	        }
	    }, {
	        key: 'spawnContextParser',
	        value: function spawnContextParser(depth, fromInline) {
	            var defs = Object.create(this._defs);
	            if (depth == null) {
	                if (!this._tok) {
	                    throw new Error('Invalid state: this._tok cannot be null when spawing ContextParser without a provided depth');
	                }
	                depth = this._tok.end;
	            }
	            // TODO: prototype chain for defs
	            return new ContextParser(depth, this._tokenGetter[0], defs, fromInline);
	        }
	    }, {
	        key: 'nextToken',
	        value: function nextToken(acceptEOF) {
	            this._tok = this._tokenGetter[0]();
	            if (!this._tok) {
	                this._isDone = true;
	                if (!acceptEOF) {
	                    throw new Error('Unexpected end of input');
	                }
	            }
	            return this._tok;
	        }
	    }, {
	        key: '_parse',
	        value: function _parse() {
	            var tok, endSubTok;
	            while (true) {
	                tok = this.nextToken();
	                if (!tok) {
	                    throw new Error('Token expected, found EOF');
	                }
	                if (tok.type === _TokenType2.default.QUERY_STATEMENT) {
	                    this._parseQuery();
	                    tok = undefined;
	                } else if (tok.type === _TokenType2.default.DIRECTIVE_STATEMENT) {
	                    tok = this._parseDirective();
	                } else {
	                    throw new _UnexpectedTokenError2.default(tok.type, [_TokenType2.default.QUERY_STATEMENT, _TokenType2.default.DIRECTIVE_STATEMENT], tok);
	                }
	                if (!tok) {
	                    // get the next token, EOF is ok
	                    tok = this.nextToken(true);
	                }
	                if (!tok) {
	                    return;
	                }
	                if (tok.type !== _TokenType2.default.CONTEXT && tok.type !== _TokenType2.default.INLINE_SUB_CONTEXT) {
	                    throw new _UnexpectedTokenError2.default(tok.type, [_TokenType2.default.CONTEXT, _TokenType2.default.INLINE_SUB_CONTEXT], tok);
	                }
	                if (tok.type === _TokenType2.default.INLINE_SUB_CONTEXT) {
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
	                        if (endSubTok.type !== _TokenType2.default.CONTEXT) {
	                            throw new _UnexpectedTokenError2.default(endSubTok.type, _TokenType2.default.CONTEXT, endSubTok);
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
	        }
	    }, {
	        key: '_parseContext',
	        value: function _parseContext() {
	            var subCtx = this.spawnContextParser(),
	                result = subCtx.parse();
	            subCtx.destroy();
	            if (result.node) {
	                this._nodes.push(result.node);
	            } else {
	                throw new Error('Expected to find a sub-context');
	            }
	            return result.endTok;
	        }
	    }, {
	        key: '_parseInlineSubContext',
	        value: function _parseInlineSubContext() {
	            var subCtx = this.spawnContextParser(this._depth, true),
	                result = subCtx.parse();
	            subCtx.destroy();
	            if (result.node) {
	                this._nodes.push(result.node);
	            } else {
	                throw new Error('Expected to find an inline-sub-context');
	            }
	            return result.endTok;
	        }
	    }, {
	        key: '_parseQuery',
	        value: function _parseQuery() {
	            this._nodes.push((0, _query.parse)(this));
	        }

	        // directives return their last token because they can parse sub-contexts

	    }, {
	        key: '_parseDirective',
	        value: function _parseDirective() {
	            var tok = this.nextToken(),
	                ident,
	                defNode,
	                result;

	            if (!tok) {
	                throw new Error('Invalid state: this._tok cannot be null when parsing a call to a directive');
	            }
	            if (tok.type !== _TokenType2.default.DIRECTIVE_IDENTIFIER) {
	                throw new _UnexpectedTokenError2.default(tok.type, _TokenType2.default.DIRECTIVE_IDENTIFIER, tok);
	            }
	            ident = tok.content.trim();
	            if (_directives2.default[ident]) {
	                result = _directives2.default[ident](this);
	                if (result.node) {
	                    // `result.node` is undefined for `def` directives bc they add the node to `this.defs` instead
	                    this._nodes.push(result.node);
	                }
	                return result.endTok;
	            } else if (this._defs[ident]) {
	                this._parseCallUserDirective(this._defs[ident]);
	            } else {
	                throw new _InvalidDirectiveError2.default(ident, 'Unknown directive: ' + JSON.stringify(ident), tok);
	            }
	        }
	    }, {
	        key: '_parseCallUserDirective',
	        value: function _parseCallUserDirective(defNode) {
	            var tok = this.nextToken();
	            if (!tok) {
	                throw new Error('Invalid state: this._tok cannot be null when parsing a call to a user-directive');
	            }
	            if (tok.type !== _TokenType2.default.DIRECTIVE_STATEMENT_END) {
	                throw new _UnexpectedTokenError2.default(tok.type, _TokenType2.default.DIRECTIVE_STATEMENT_END, tok);
	            }
	            this._nodes.push(defNode);
	        }
	    }]);

	    return ContextParser;
	}();

	exports.default = ContextParser;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _Token = __webpack_require__(1);

	var _Token2 = _interopRequireDefault(_Token);

	var _utils = __webpack_require__(2);

	var _utils2 = __webpack_require__(8);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function UnexpectedTokenError(found, expected, token, message) {
	    this.found = found;
	    this.expected = expected;
	    this.token = token;
	    this.message = message;
	    this.stack = Error.call(this, '' + this).stack;
	}
	(0, _utils2.configErrorProto)(UnexpectedTokenError, 'UnexpectedTokenError');

	UnexpectedTokenError.prototype.toString = function toString(offset) {
	    return (0, _utils.dedentOffset)(offset, '\n            UnexpectedTokenError {\n                    found: ' + this.found + '\n                 expected: ' + this.expected + '\n                  message: ' + this.message + '\n                    token: ' + (this.token ? '\n' + this.token.toString('                            ') : this.token) + '\n            }\n    ');
	};

	exports.default = UnexpectedTokenError;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getOneParam = getOneParam;
	exports.getSubContext = getSubContext;

	var _TakeSyntaxError = __webpack_require__(9);

	var _TakeSyntaxError2 = _interopRequireDefault(_TakeSyntaxError);

	var _UnexpectedTokenError = __webpack_require__(6);

	var _UnexpectedTokenError2 = _interopRequireDefault(_UnexpectedTokenError);

	var _INode = __webpack_require__(3);

	var _ContextParser = __webpack_require__(5);

	var _ContextParser2 = _interopRequireDefault(_ContextParser);

	var _Token = __webpack_require__(1);

	var _Token2 = _interopRequireDefault(_Token);

	var _TokenType = __webpack_require__(4);

	var _TokenType2 = _interopRequireDefault(_TokenType);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getOneParam(parser) {
	    var tok = parser.nextToken(),
	        endTok;
	    if (!tok) {
	        throw new _TakeSyntaxError2.default('Expected ' + _TokenType2.default.DIRECTIVE_BODY_ITEM + ' token, found EOF');
	    }
	    if (tok.type !== _TokenType2.default.DIRECTIVE_BODY_ITEM) {
	        throw new _UnexpectedTokenError2.default(tok.type, _TokenType2.default.DIRECTIVE_BODY_ITEM, tok);
	    }
	    endTok = parser.nextToken();
	    if (!endTok) {
	        throw new _TakeSyntaxError2.default('Expected ' + _TokenType2.default.DIRECTIVE_STATEMENT_END + ' token, found EOF');
	    }
	    if (endTok.type !== _TokenType2.default.DIRECTIVE_STATEMENT_END) {
	        throw new _UnexpectedTokenError2.default(endTok.type, _TokenType2.default.DIRECTIVE_STATEMENT_END, endTok);
	    }
	    return tok;
	}

	function getSubContext(parser, directiveName) {
	    // the next token should be a sub-context
	    var tok = parser.nextToken(),
	        subCtx,
	        result;
	    if (!tok) {
	        throw new _TakeSyntaxError2.default('Expected ' + _TokenType2.default.CONTEXT + ' token, found EOF');
	    }
	    if (tok.type !== _TokenType2.default.CONTEXT) {
	        throw new _UnexpectedTokenError2.default(tok.type, _TokenType2.default.CONTEXT, tok);
	    }
	    if (tok.end <= parser.getDepth()) {
	        throw new _TakeSyntaxError2.default('Invalid depth, expecting to start a "' + directiveName + '" context.', tok);
	    }
	    // parse the sub-context
	    subCtx = parser.spawnContextParser();
	    result = subCtx.parse();
	    subCtx.destroy();
	    return result;
	}

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.configErrorProto = configErrorProto;
	function configErrorProto(ctor, name) {
	    ctor.prototype = Object.create(Error.prototype);
	    ctor.prototype.constructor = ctor;
	    ctor.prototype.name = name;
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _utils = __webpack_require__(2);

	var _utils2 = __webpack_require__(8);

	function TakeSyntaxError(message, extra) {
	    this.message = message;
	    this.extra = extra;
	    this.stack = Error.call(this, '' + this).stack;
	}
	(0, _utils2.configErrorProto)(TakeSyntaxError, 'TakeSyntaxError');

	TakeSyntaxError.prototype.toString = function toString(offset) {
	    return (0, _utils.dedentOffset)(offset, '\n            TakeSyntaxError {\n                  message: ' + this.message + '\n                    extra: ' + this.extra + '\n            }\n    ');
	};

	exports.default = TakeSyntaxError;

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';

	// weak test for a browser environment
	if (typeof window !== 'undefined') {
	    // use jQuery
	    module.exports = jQuery;
	} else {
	    // use cheerio in node (avoid webpack's sniffing via `eval`)
	    module.exports = eval('require')('cheerio');
	}

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _jqProvider = __webpack_require__(10);

	var _jqProvider2 = _interopRequireDefault(_jqProvider);

	var _parse = __webpack_require__(20);

	var _parse2 = _interopRequireDefault(_parse);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var TakeTemplate = function () {
	    function TakeTemplate(source) {
	        _classCallCheck(this, TakeTemplate);

	        var lines = void 0;
	        if (typeof source === 'string') {
	            lines = source.split('\n');
	        } else if (Array.isArray(source)) {
	            lines = source;
	        } else {
	            throw new Error('Invalid template source');
	        }
	        this.node = (0, _parse2.default)(lines);
	    }

	    _createClass(TakeTemplate, [{
	        key: 'take',
	        value: function take(doc) {
	            var $doc = (0, _jqProvider2.default)(doc),
	                rv = {};
	            this.node.exec(undefined, rv, $doc, $doc);
	            return rv;
	        }
	    }]);

	    return TakeTemplate;
	}();

	exports.default = TakeTemplate;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	exports.makeDefSubroutine = makeDefSubroutine;

	var _TakeSyntaxError = __webpack_require__(9);

	var _TakeSyntaxError2 = _interopRequireDefault(_TakeSyntaxError);

	var _UnexpectedTokenError = __webpack_require__(6);

	var _UnexpectedTokenError2 = _interopRequireDefault(_UnexpectedTokenError);

	var _INode = __webpack_require__(3);

	var _ContextParser = __webpack_require__(5);

	var _ContextParser2 = _interopRequireDefault(_ContextParser);

	var _Token = __webpack_require__(1);

	var _Token2 = _interopRequireDefault(_Token);

	var _TokenType = __webpack_require__(4);

	var _TokenType2 = _interopRequireDefault(_TokenType);

	var _utils = __webpack_require__(7);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var DefSubroutineNode = function () {
	    function DefSubroutineNode(subCtxNode) {
	        _classCallCheck(this, DefSubroutineNode);

	        this._subCtxNode = subCtxNode;
	    }

	    _createClass(DefSubroutineNode, [{
	        key: 'exec',
	        value: function exec(context) {
	            if (context == null) {
	                throw new Error('Invalid context - def INode must be exececuted on a non-null context');
	            }
	            var rv = {};
	            this._subCtxNode.exec(undefined, rv, context.value, context.value);
	            context.lastValue = rv;
	        }
	    }]);

	    return DefSubroutineNode;
	}();

	function makeDefSubroutine(parser) {
	    var nameParts = [],
	        tok = parser.nextToken();
	    if (!tok) {
	        throw new _TakeSyntaxError2.default('The `def` directive requires a parameter for the name');
	    }
	    // collect the name parts, which might be space separated, eg: 'def: some name'
	    while (tok && tok.type === _TokenType2.default.DIRECTIVE_BODY_ITEM) {
	        nameParts.push(tok.content.trim());
	        tok = parser.nextToken();
	    }
	    if (!nameParts.length) {
	        throw new _TakeSyntaxError2.default('The `def` directive requires a parameter for the name', tok);
	    }
	    if (!tok) {
	        throw new _TakeSyntaxError2.default('Expecting a ' + _TokenType2.default.DIRECTIVE_STATEMENT_END + ' token');
	    }
	    if (tok.type !== _TokenType2.default.DIRECTIVE_STATEMENT_END) {
	        throw new _UnexpectedTokenError2.default(tok.type, _TokenType2.default.DIRECTIVE_STATEMENT_END, tok);
	    }
	    // parse the sub context
	    var subCtxResult = (0, _utils.getSubContext)(parser, 'def'),
	        defName = nameParts.join(' ');
	    if (!subCtxResult.node) {
	        throw new Error('Invalid sub-context for def directive');
	    }
	    parser.getDefs()[defName] = new DefSubroutineNode(subCtxResult.node);
	    return {
	        node: undefined,
	        endTok: subCtxResult.endTok
	    };
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _def = __webpack_require__(12);

	var _namespace = __webpack_require__(14);

	var _save = __webpack_require__(16);

	var _saveEach = __webpack_require__(15);

	var directives = Object.freeze({
	    save: _save.makeSave,
	    ':': _save.makeSave,
	    'save each': _saveEach.makeSaveEach,
	    def: _def.makeDefSubroutine,
	    namespace: _namespace.makeNamespace,
	    '+': _namespace.makeNamespace
	});

	exports.default = directives;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	exports.makeNamespace = makeNamespace;

	var _INode = __webpack_require__(3);

	var _Token = __webpack_require__(1);

	var _Token2 = _interopRequireDefault(_Token);

	var _utils = __webpack_require__(2);

	var _utils2 = __webpack_require__(7);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var NamespaceNode = function () {
	    function NamespaceNode(_identParts, subCtxNode) {
	        _classCallCheck(this, NamespaceNode);

	        this._identParts = _identParts;
	        this._subCtxNode = subCtxNode;
	    }

	    _createClass(NamespaceNode, [{
	        key: 'exec',
	        value: function exec(context) {
	            if (context == null) {
	                throw new Error('context must not be `== null` for "namespace" directive');
	            }
	            var subRv = (0, _utils.getViaNameList)(context.rv, this._identParts);
	            if (subRv == null) {
	                subRv = {};
	                (0, _utils.saveToNameList)(context.rv, this._identParts, subRv);
	            }
	            this._subCtxNode.exec(undefined, subRv, context.value, context.value);
	        }
	    }]);

	    return NamespaceNode;
	}();

	function makeNamespace(parser) {
	    var tok = (0, _utils2.getOneParam)(parser),
	        nameParts = tok.content.trim().split('.'),
	        result = (0, _utils2.getSubContext)(parser, 'namespace');
	    if (!result.node) {
	        throw new Error('Invalid sub-context for namespace directive');
	    }
	    return {
	        node: new NamespaceNode(nameParts, result.node),
	        endTok: result.endTok
	    };
	}

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	exports.makeSaveEach = makeSaveEach;

	var _INode = __webpack_require__(3);

	var _ContextParser = __webpack_require__(5);

	var _ContextParser2 = _interopRequireDefault(_ContextParser);

	var _Token = __webpack_require__(1);

	var _Token2 = _interopRequireDefault(_Token);

	var _utils = __webpack_require__(2);

	var _utils2 = __webpack_require__(7);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var SaveEachNode = function () {
	    function SaveEachNode(nameParts, subContextNode) {
	        _classCallCheck(this, SaveEachNode);

	        this._nameParts = nameParts;
	        this._subContext = subContextNode;
	    }

	    _createClass(SaveEachNode, [{
	        key: 'exec',
	        value: function exec(context) {
	            if (context == null) {
	                throw new Error('context must not be `== null` for "save each" directive');
	            }
	            var items = context.value,
	                results = [],
	                i = 0,
	                subCtx,
	                len,
	                item,
	                rv;
	            (0, _utils.saveToNameList)(context.rv, this._nameParts, results);
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
	        }
	    }]);

	    return SaveEachNode;
	}();

	function makeSaveEach(parser) {
	    var tok = (0, _utils2.getOneParam)(parser),
	        nameParts = tok.content.trim().split('.'),
	        result = (0, _utils2.getSubContext)(parser, 'save each');
	    if (!result.node) {
	        throw new Error('Invalid sub-context for save-each directive');
	    }
	    return {
	        node: new SaveEachNode(nameParts, result.node),
	        endTok: result.endTok
	    };
	}

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	exports.makeSave = makeSave;

	var _INode = __webpack_require__(3);

	var _ContextParser = __webpack_require__(5);

	var _ContextParser2 = _interopRequireDefault(_ContextParser);

	var _utils = __webpack_require__(2);

	var _Token = __webpack_require__(1);

	var _Token2 = _interopRequireDefault(_Token);

	var _utils2 = __webpack_require__(7);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var SaveNode = function () {
	    function SaveNode(nameParts) {
	        _classCallCheck(this, SaveNode);

	        this._nameParts = nameParts;
	    }

	    _createClass(SaveNode, [{
	        key: 'exec',
	        value: function exec(context) {
	            if (context == null) {
	                throw new Error('Invalid context - save INode must be exececuted on a non-null context');
	            }
	            (0, _utils.saveToNameList)(context.rv, this._nameParts, context.value);
	        }
	    }]);

	    return SaveNode;
	}();

	function makeSave(parser) {
	    var tok = (0, _utils2.getOneParam)(parser),
	        nameParts = tok.content.trim().split('.');
	    return {
	        node: new SaveNode(nameParts),
	        endTok: undefined
	    };
	}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _utils = __webpack_require__(2);

	var _utils2 = __webpack_require__(8);

	function InvalidDirectiveError(ident, message, extra) {
	    this.ident = ident;
	    this.message = message;
	    this.extra = extra;
	    this.stack = Error.call(this, '' + this).stack;
	}
	(0, _utils2.configErrorProto)(InvalidDirectiveError, 'InvalidDirectiveError');

	InvalidDirectiveError.prototype.toString = function toString(offset) {
	    return (0, _utils.dedentOffset)(offset, '\n        InvalidDirectiveError {\n                ident: ' + JSON.stringify(this.ident) + '\n              message: ' + this.message + '\n                extra: ' + JSON.stringify(this.extra) + '\n        }\n    ');
	};

	exports.default = InvalidDirectiveError;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _utils = __webpack_require__(2);

	var _utils2 = __webpack_require__(8);

	var spaces = (0, _utils.charRepeater)(' ');

	function ScanError(message, line, lineNum, pos, extra) {
	    this.message = message;
	    this.line = line;
	    this.lineNum = lineNum;
	    this.pos = pos;
	    this.extra = extra;
	    this.stack = Error.call(this, '' + this).stack;
	}
	(0, _utils2.configErrorProto)(ScanError, 'ScanError');

	ScanError.prototype.toString = function toString(offset) {
	    return (0, _utils.dedentOffset)(offset, '\n        ScanError {\n              message: ' + this.message + '\n                 line: ' + JSON.stringify(this.line) + '\n                       ' + spaces(this.pos) + ' ^\n             line num: ' + this.lineNum + '\n                  pos: ' + this.pos + '\n                extra: ' + JSON.stringify(this.extra) + '\n        }\n    ');
	};

	exports.default = ScanError;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _INode = __webpack_require__(3);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ContextNode = function () {
	    function ContextNode(depth, nodes) {
	        _classCallCheck(this, ContextNode);

	        this._depth = depth;
	        this._nodes = nodes;
	        this.rv = undefined;
	        this.value = undefined;
	        this.lastValue = undefined;
	    }

	    _createClass(ContextNode, [{
	        key: 'exec',
	        value: function exec(context, rv, value, lastValue) {
	            var len = this._nodes.length,
	                i = 0;
	            this.rv = rv != null ? rv : context && context.rv;
	            // value in a sub-context is derived from the parent context's lastValue
	            this.value = value != null ? value : context && context.lastValue;
	            this.lastValue = lastValue != null ? lastValue : this.value;
	            for (; i < len; i++) {
	                this._nodes[i].exec(this);
	            }
	        }
	    }]);

	    return ContextNode;
	}();

	exports.default = ContextNode;

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = parse;

	var _UnexpectedTokenError = __webpack_require__(6);

	var _UnexpectedTokenError2 = _interopRequireDefault(_UnexpectedTokenError);

	var _scanner = __webpack_require__(22);

	var _scanner2 = _interopRequireDefault(_scanner);

	var _TokenType = __webpack_require__(4);

	var _TokenType2 = _interopRequireDefault(_TokenType);

	var _ContextParser = __webpack_require__(5);

	var _ContextParser2 = _interopRequireDefault(_ContextParser);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function parse(lines) {
	    var scanner = new _scanner2.default(lines),
	        tok = scanner.getToken(),
	        ctx,
	        result;
	    if (tok.type !== _TokenType2.default.CONTEXT) {
	        throw new _UnexpectedTokenError2.default(tok.type, _TokenType2.default.CONTEXT, 'Leading context token not found.');
	    }
	    ctx = new _ContextParser2.default(tok.end, scanner.getToken.bind(scanner));
	    result = ctx.parse();
	    ctx.destroy();
	    if (result.endTok) {
	        throw new _UnexpectedTokenError2.default(tok, 'EOF');
	    }
	    return result.node;
	}

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _TakeSyntaxError = __webpack_require__(9);

	var _TakeSyntaxError2 = _interopRequireDefault(_TakeSyntaxError);

	var _UnexpectedTokenError = __webpack_require__(6);

	var _UnexpectedTokenError2 = _interopRequireDefault(_UnexpectedTokenError);

	var _INode = __webpack_require__(3);

	var _jqProvider = __webpack_require__(10);

	var _jqProvider2 = _interopRequireDefault(_jqProvider);

	var _ContextParser = __webpack_require__(5);

	var _ContextParser2 = _interopRequireDefault(_ContextParser);

	var _TokenType = __webpack_require__(4);

	var _TokenType2 = _interopRequireDefault(_TokenType);

	var _Token = __webpack_require__(1);

	var _Token2 = _interopRequireDefault(_Token);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function ensureJqApi(elm) {
	    if (elm instanceof _jqProvider2.default) {
	        return elm;
	    }
	    return (0, _jqProvider2.default)(elm);
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
	    var queries = [];
	    var tok = parser.nextToken();
	    if (!tok) {
	        throw new _TakeSyntaxError2.default('Expected to find a ' + _TokenType2.default.INDEX_ACCESSOR + ', ' + _TokenType2.default.ATTR_ACCESSOR + ' or ' + _TokenType2.default.TEXT_ACCESSOR + ' token');
	    }
	    if (tok.type === _TokenType2.default.INDEX_ACCESSOR) {
	        queries.push(makeIndexQuery(tok.content));
	        tok = parser.nextToken();
	        if (!tok) {
	            throw new _TakeSyntaxError2.default('Expected to find a ' + _TokenType2.default.QUERY_STATEMENT_END + ' or ' + _TokenType2.default.TEXT_ACCESSOR + ' token');
	        }
	        // index accessor might be the only accessor
	        if (tok.type === _TokenType2.default.QUERY_STATEMENT_END) {
	            return queries;
	        }
	    }
	    // can only have one of text or attr accessors
	    if (tok.type === _TokenType2.default.TEXT_ACCESSOR) {
	        queries.push(textQuery);
	    } else if (tok.type === _TokenType2.default.ATTR_ACCESSOR) {
	        // strip spaces and the brackets, ex: "[href]"
	        var attr = tok.content.trim().slice(1, -1);
	        queries.push(makeAttrQuery(attr));
	    } else {
	        // if it got here, something is wrong, either the query should have ended after
	        // an index accessor (if there was one) or a text or attr accessor should have
	        // been encountered
	        var expected = [_TokenType2.default.TEXT_ACCESSOR, _TokenType2.default.ATTR_ACCESSOR];
	        if (!queries.length) {
	            expected.push(_TokenType2.default.INDEX_ACCESSOR);
	        }
	        throw new _UnexpectedTokenError2.default(tok.type, expected, tok);
	    }
	    var endTok = parser.nextToken();
	    if (!endTok) {
	        throw new _TakeSyntaxError2.default('Expected to find a ' + _TokenType2.default.QUERY_STATEMENT_END + ' token');
	    }
	    if (endTok.type !== _TokenType2.default.QUERY_STATEMENT_END) {
	        throw new _UnexpectedTokenError2.default(endTok.type, _TokenType2.default.QUERY_STATEMENT_END, endTok);
	    }
	    return queries;
	}

	function cssSelector(parser) {
	    if (!parser._tok) {
	        throw new _TakeSyntaxError2.default('Expected to find a token, instead found EOF');
	    }
	    var selector = parser._tok.content.trim(),
	        query = makeCssQuery(selector),
	        tok = parser.nextToken();
	    if (!tok) {
	        throw new _TakeSyntaxError2.default('Expected to find a ' + _TokenType2.default.QUERY_STATEMENT_END + ' or ' + _TokenType2.default.ACCESSOR_SEQUENCE + ' token');
	    }
	    if (tok.type === _TokenType2.default.QUERY_STATEMENT_END) {
	        return [query];
	    } else if (tok.type === _TokenType2.default.ACCESSOR_SEQUENCE) {
	        return [query].concat(accessorSeq(parser));
	    } else {
	        throw new _UnexpectedTokenError2.default(tok.type, [_TokenType2.default.QUERY_STATEMENT_END, _TokenType2.default.ACCESSOR_SEQUENCE], tok);
	    }
	}

	var QueryNode = function () {
	    function QueryNode(queries) {
	        _classCallCheck(this, QueryNode);

	        this._queries = queries;
	    }

	    _createClass(QueryNode, [{
	        key: 'exec',
	        value: function exec(context) {
	            if (!context) {
	                throw new Error('Invalid context, expected to find a context for a query node');
	            }
	            var val = context.value,
	                len = this._queries.length,
	                i = 0;
	            for (; i < len; i++) {
	                val = this._queries[i](val);
	            }
	            context.lastValue = val;
	        }
	    }]);

	    return QueryNode;
	}();

	exports.parse = function parseQuery(parser) {
	    var tok = parser.nextToken(),
	        queries;
	    if (!tok) {
	        throw new _TakeSyntaxError2.default('Expected to find a ' + _TokenType2.default.CSS_SELECTOR + ' or ' + _TokenType2.default.ACCESSOR_SEQUENCE + ' token');
	    }
	    if (tok.type === _TokenType2.default.CSS_SELECTOR) {
	        queries = cssSelector(parser);
	    } else if (tok.type === _TokenType2.default.ACCESSOR_SEQUENCE) {
	        queries = accessorSeq(parser);
	    } else {
	        throw new _UnexpectedTokenError2.default(tok.type, [_TokenType2.default.CSS_SELECTOR, _TokenType2.default.ACCESSOR_SEQUENCE], tok);
	    }
	    return new QueryNode(queries);
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _ScanError = __webpack_require__(18);

	var _ScanError2 = _interopRequireDefault(_ScanError);

	var _Token = __webpack_require__(1);

	var _Token2 = _interopRequireDefault(_Token);

	var _TokenType = __webpack_require__(4);

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

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	function dedent(strings) {

	  var raw = undefined;
	  if (typeof strings === "string") {
	    // dedent can be used as a plain function
	    raw = [strings];
	  } else {
	    raw = strings.raw;
	  }

	  // first, perform interpolation
	  var result = "";

	  for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    values[_key - 1] = arguments[_key];
	  }

	  for (var i = 0; i < raw.length; i++) {
	    result += raw[i].
	    // join lines when there is a suppressed newline
	    replace(/\\\n[ \t]*/g, "").

	    // handle escaped backticks
	    replace(/\\`/g, "`");

	    if (i < values.length) {
	      result += values[i];
	    }
	  }

	  // dedent eats leading and trailing whitespace too
	  result = result.trim();

	  // now strip indentation
	  var lines = result.split("\n");
	  var mindent = null;
	  lines.forEach(function (l) {
	    var m = l.match(/^ +/);
	    if (m) {
	      var indent = m[0].length;
	      if (!mindent) {
	        // this is the first indented line
	        mindent = indent;
	      } else {
	        mindent = Math.min(mindent, indent);
	      }
	    }
	  });

	  if (mindent !== null) {
	    result = lines.map(function (l) {
	      return l[0] === " " ? l.slice(mindent) : l;
	    }).join("\n");
	  }

	  // handle escaped newlines at the end to ensure they don't get stripped too
	  return result.replace(/\\n/g, "\n");
	}

	if (true) {
	  module.exports = dedent;
	}

/***/ }
/******/ ])
});
;