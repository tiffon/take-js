'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _utils = require('../utils');

var _utils2 = require('./utils');

function InvalidDirectiveError(ident, message, extra) {
    this.ident = ident;
    this.message = message;
    this.extra = extra;
    this.stack = Error.call(this, '' + this).stack;
}
(0, _utils2.configErrorProto)(InvalidDirectiveError, 'InvalidDirectiveError');

InvalidDirectiveError.prototype.toString = function toString(offset) {
    return (0, _utils.dedentOffset)(offset, '\n        InvalidDirectiveError {\n                ident: ' + JSON.stringify(this.ident) + '\n              message: ' + this.message + '\n                extra: ' + JSON.stringify(this.extra) + '\n        }\n    ');
};

exports.default = InvalidDirectiveError;