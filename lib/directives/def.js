'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.makeDefSubroutine = makeDefSubroutine;

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

var _utils = require('./utils');

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