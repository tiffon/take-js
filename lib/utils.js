'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getViaNameList = getViaNameList;
exports.saveToNameList = saveToNameList;
exports.charRepeater = charRepeater;
exports.dedentOffset = dedentOffset;
exports.newConstantsNamespace = newConstantsNamespace;

var _dedent = require('dedent');

var _dedent2 = _interopRequireDefault(_dedent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// `nameList` is an Array of strings which are used to look up
// possibly nested values in `src`. For example: `['a', 'b']`
// would return `src.a.b`.
function getViaNameList(src, nameList) {
    var i;
    if (nameList.length === 1) {
        return src[nameList[0]];
    }
    var max = nameList.length - 1;
    i = 0;
    for (; i < max; i++) {
        src = src[nameList[i]];
    }
    // `i` ends up as last index
    return src[nameList[i]];
}

// `nameList` is an Array of strings which are used to save `value` to a
// possibly nested name in `dest`. For example: `['a', 'b']` will save
// result in `dest.a.b = value`


function saveToNameList(dest, nameList, value) {
    var part, max, i;
    if (nameList.length === 1) {
        dest[nameList[0]] = value;
    }
    i = 0;
    max = nameList.length - 1;
    for (; i < max; i++) {
        part = nameList[i];
        if (part in dest) {
            dest = dest[part];
        } else {
            dest = dest[part] = {};
        }
    }
    // `i` ends up as last index
    dest[nameList[i]] = value;
}

// util for adding padding (spaces) to a string
function charRepeater(char) {
    var base = '' + char,
        baseLen = 64;
    while (base.length < baseLen) {
        base += base;
    }

    function repeater(len) {
        var rv;
        if (len < 1) {
            return '';
        }
        if (len <= baseLen) {
            return base.slice(-len);
        }
        rv = base + base;
        while (rv.length < len) {
            rv += base;
        }
        return rv.slice(-len);
    }
    return repeater;
}

// dedents the string `s`, then adds a leading string if `pre` is supplied
function dedentOffset(pre, s) {
    var value = (0, _dedent2.default)(s);
    if (!pre) {
        return value;
    }
    var parts = value.split('\n');
    return pre + parts.join('\n' + pre);
}

// Returns an object with keys equal to their value. The value can optionally
// be formatted, primarily to have leading and trailing strings attached. For
// instance, if opts.format === 'Expression { %s }', and source === ['SMILE'],
// the result will be:
//
//      {
//          SMILE: 'Expression { SMILE }'
//      }
//
// Options:
//  - format : string - format string to modify the values of the keys, the
//                      `'%s'` is replaced with the key
//  - source : array<string> - array of strings to construct the key/values from
function newConstantsNamespace(opts) {
    var pre = '',
        post = '',
        i = 0,
        src;
    if (Array.isArray(opts)) {
        src = opts;
    } else {
        src = opts.source;
        if (opts.format) {
            var parts = opts.format.split('%s');
            pre = parts[0] || '';
            post = parts[1] || '';
        }
    }
    var len = src.length,
        rv = {};
    for (; i < len; i++) {
        var v = src[i];
        rv[v] = pre + v + post;
    }
    return Object.freeze(rv);
}