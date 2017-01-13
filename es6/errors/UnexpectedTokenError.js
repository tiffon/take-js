'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Token = require('../Token');

var _Token2 = _interopRequireDefault(_Token);

var _utils = require('../utils');

var _utils2 = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function UnexpectedTokenError(found, expected, token, message) {
    this.found = found;
    this.expected = expected;
    this.token = token;
    this.message = message;
    this.stack = Error.call(this, '' + this).stack;
}

(0, _utils2.configErrorProto)(UnexpectedTokenError, 'UnexpectedTokenError');

UnexpectedTokenError.prototype.toString = function toString(offset) {
    return (0, _utils.dedentOffset)(offset, '\n            UnexpectedTokenError {\n                    found: ' + this.found + '\n                 expected: ' + this.expected + '\n                  message: ' + this.message + '\n                    token: ' + (this.token ? '\n' + this.token.toString('                            ') : this.token) + '\n            }\n    ');
};

exports.default = UnexpectedTokenError;