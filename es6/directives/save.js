'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.makeSave = makeSave;

var _INode = require('../INode');

var _ContextParser = require('../parse/ContextParser');

var _ContextParser2 = _interopRequireDefault(_ContextParser);

var _utils = require('../utils');

var _Token = require('../Token');

var _Token2 = _interopRequireDefault(_Token);

var _utils2 = require('./utils');

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