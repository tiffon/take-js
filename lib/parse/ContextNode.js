'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _INode = require('../INode');

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