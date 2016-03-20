'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var spaces = (0, _utils.charRepeater)(' '),
    carrots = (0, _utils.charRepeater)('^');

var Token = function () {
    function Token(type, content, line, lineNum, start, end) {
        _classCallCheck(this, Token);

        this.type = type;
        this.content = content;
        this.line = line;
        this.lineNum = lineNum;
        this.start = start;
        this.end = end;
    }

    _createClass(Token, [{
        key: 'toString',
        value: function toString(offset) {
            return (0, _utils.dedentOffset)(offset, '\n            Token {\n                     type: ' + this.type + '\n                  content: ' + JSON.stringify(this.content) + '\n                 line num: ' + this.lineNum + '\n               start, end: ' + this.start + ', ' + this.end + '\n                     line: ' + JSON.stringify(this.line) + '\n                            ' + (spaces(this.start) + carrots(this.end - this.start)) + '\n            }\n        ');
        }
    }]);

    return Token;
}();

exports.default = Token;