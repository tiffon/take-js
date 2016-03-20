'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _TakeSyntaxError = require('./errors/TakeSyntaxError');

var _TakeSyntaxError2 = _interopRequireDefault(_TakeSyntaxError);

var _UnexpectedTokenError = require('./errors/UnexpectedTokenError');

var _UnexpectedTokenError2 = _interopRequireDefault(_UnexpectedTokenError);

var _INode = require('./INode');

var _jqProvider = require('./jq-provider');

var _jqProvider2 = _interopRequireDefault(_jqProvider);

var _ContextParser = require('./parse/ContextParser');

var _ContextParser2 = _interopRequireDefault(_ContextParser);

var _TokenType = require('./TokenType');

var _TokenType2 = _interopRequireDefault(_TokenType);

var _Token = require('./Token');

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