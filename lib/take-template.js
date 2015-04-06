
var jqProvider = require('./jq-provider'),
    parse = require('./parse').parse;


function TakeTemplate(lines) {
    this.node = parse(lines);
}
exports.TakeTemplate = TakeTemplate;

TakeTemplate.prototype.take = function(doc) {
    var $doc = jqProvider(doc),
        rv = {};
    this.node.exec(undefined, rv, $doc, $doc);
    return rv;
};
