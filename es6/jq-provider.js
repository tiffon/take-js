'use strict';

// weak test for a browser environment
if (typeof window !== 'undefined') {
    // use jQuery
    module.exports = jQuery;
} else {
    // use cheerio in node (avoid webpack's sniffing via `eval`)
    module.exports = eval('require')('cheerio');
}