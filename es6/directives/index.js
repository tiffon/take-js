'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _def = require('./def');

var _namespace = require('./namespace');

var _save = require('./save');

var _saveEach = require('./save-each');

var directives = Object.freeze({
    save: _save.makeSave,
    ':': _save.makeSave,
    'save each': _saveEach.makeSaveEach,
    def: _def.makeDefSubroutine,
    namespace: _namespace.makeNamespace,
    '+': _namespace.makeNamespace
});

exports.default = directives;