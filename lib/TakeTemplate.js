'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jqProvider = require('./jq-provider');

var _jqProvider2 = _interopRequireDefault(_jqProvider);

var _parse = require('./parse');

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