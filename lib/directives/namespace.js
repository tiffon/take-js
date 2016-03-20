'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.makeNamespace = makeNamespace;

var _INode = require('../INode');

var _Token = require('../Token');

var _Token2 = _interopRequireDefault(_Token);

var _utils = require('../utils');

var _utils2 = require('./utils');

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