'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = parse;

var _UnexpectedTokenError = require('../errors/UnexpectedTokenError');

var _UnexpectedTokenError2 = _interopRequireDefault(_UnexpectedTokenError);

var _Scanner = require('../Scanner');

var _Scanner2 = _interopRequireDefault(_Scanner);

var _TokenType = require('../TokenType');

var _TokenType2 = _interopRequireDefault(_TokenType);

var _ContextParser = require('./ContextParser');

var _ContextParser2 = _interopRequireDefault(_ContextParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parse(lines) {
    var scanner = new _Scanner2.default(lines),
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