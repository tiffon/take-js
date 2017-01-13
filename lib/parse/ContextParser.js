'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _InvalidDirectiveError = require('../errors/InvalidDirectiveError');

var _InvalidDirectiveError2 = _interopRequireDefault(_InvalidDirectiveError);

var _UnexpectedTokenError = require('../errors/UnexpectedTokenError');

var _UnexpectedTokenError2 = _interopRequireDefault(_UnexpectedTokenError);

var _directives = require('../directives');

var _directives2 = _interopRequireDefault(_directives);

var _INode = require('../INode');

var _query = require('../query');

var _Token = require('../Token');

var _Token2 = _interopRequireDefault(_Token);

var _TokenType = require('../TokenType');

var _TokenType2 = _interopRequireDefault(_TokenType);

var _ContextNode = require('./ContextNode');

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
        key: 'getTok',
        value: function getTok() {
            return this._tok;
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this._tokenGetter = [];
            this._defs = {};
            this._nodes = [];
            this._tok = undefined;
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