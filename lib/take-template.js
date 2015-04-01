
var cheerio = require('cheerio');

var parse = require('./parse').parse;


function TakeTemplate(lines) {
    this.node = parse(lines);
}
exports.TakeTemplate = TakeTemplate;

TakeTemplate.prototype.take = function(doc) {
    var $doc = cheerio(doc),
        rv = {};
    this.node.exec(undefined, rv, $doc, $doc);
    return rv;
};
