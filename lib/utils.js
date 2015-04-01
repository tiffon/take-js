
exports.spaces = (function() {
    var base = '                                                            ',
        baseLen = base.length;

    function spaces(len) {
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
    return spaces;
})();
