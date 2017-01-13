'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.makeSaveEach = makeSaveEach;

var _INode = require('../INode');

var _ContextParser = require('../parse/ContextParser');

var _ContextParser2 = _interopRequireDefault(_ContextParser);

var _Token = require('../Token');

var _Token2 = _interopRequireDefault(_Token);

var _utils = require('../utils');

var _utils2 = require('./utils');

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