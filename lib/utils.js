
// `nameList` is an Array of strings which are used to look up
// possibly nested values in `src`. For example: `['a', 'b']`
// would return `src.a.b`.
exports.getViaNameList = function getViaNameList(src, nameList) {
    var max,
        i;
    if (nameList.length === 1) {
        return src[nameList[0]];
    }
    i = 0;
    max = nameList.length - 1;
    for (; i < max; i++) {
        src = src[nameList[i]];
    }
    // `i` ends up as last index
    return src[nameList[i]];
};


// `nameList` is an Array of strings which are used to save `value` to a
// possibly nested name in `dest`. For example: `['a', 'b']` will save
// result in `dest.a.b = value`
exports.saveToNameList = function saveToNameList(dest, nameList, value) {
    var part,
        max,
        i;
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
};


// util for adding padding (spaces) to a string
exports.charRepeater = function charRepeater(char) {
    var base = '' + char,
        baseLen = Math.pow(2, 6);
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
};
