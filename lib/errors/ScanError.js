'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _utils = require('../utils');

var _utils2 = require('./utils');

var spaces = (0, _utils.charRepeater)(' ');

function ScanError(message, line, lineNum, pos, extra) {
    this.message = message;
    this.line = line;
    this.lineNum = lineNum;
    this.pos = pos;
    this.extra = extra;
    this.stack = Error.call(this, '' + this).stack;
}
(0, _utils2.configErrorProto)(ScanError, 'ScanError');

ScanError.prototype.toString = function toString(offset) {
    return (0, _utils.dedentOffset)(offset, '\n        ScanError {\n              message: ' + this.message + '\n                 line: ' + JSON.stringify(this.line) + '\n                       ' + spaces(this.pos) + ' ^\n             line num: ' + this.lineNum + '\n                  pos: ' + this.pos + '\n                extra: ' + JSON.stringify(this.extra) + '\n        }\n    ');
};

exports.default = ScanError;