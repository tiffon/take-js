'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getOneParam = getOneParam;
exports.getSubContext = getSubContext;

var _TakeSyntaxError = require('../errors/TakeSyntaxError');

var _TakeSyntaxError2 = _interopRequireDefault(_TakeSyntaxError);

var _UnexpectedTokenError = require('../errors/UnexpectedTokenError');

var _UnexpectedTokenError2 = _interopRequireDefault(_UnexpectedTokenError);

var _INode = require('../INode');

var _ContextParser = require('../parse/ContextParser');

var _ContextParser2 = _interopRequireDefault(_ContextParser);

var _Token = require('../Token');

var _Token2 = _interopRequireDefault(_Token);

var _TokenType = require('../TokenType');

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