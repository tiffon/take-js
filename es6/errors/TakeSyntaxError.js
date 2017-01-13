'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _utils = require('../utils');

var _utils2 = require('./utils');

function TakeSyntaxError(message, extra) {
    this.message = message;
    this.extra = extra;
    this.stack = Error.call(this, '' + this).stack;
}
(0, _utils2.configErrorProto)(TakeSyntaxError, 'TakeSyntaxError');

TakeSyntaxError.prototype.toString = function toString(offset) {
    return (0, _utils.dedentOffset)(offset, '\n            TakeSyntaxError {\n                  message: ' + this.message + '\n                    extra: ' + this.extra + '\n            }\n    ');
};

exports.default = TakeSyntaxError;