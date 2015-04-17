
var jqProvider = require('./jq-provider');

var UnexpectedTokenError = require('./errors').UnexpectedTokenError;

var tokenType = require('./token-type');


function ensureJqApi(elm) {
    if (elm instanceof jqProvider) {
        return elm;
    }
    return jqProvider(elm);
}


function makeCssQuery(selector) {
    return function cssQuery(elm) {
        return ensureJqApi(elm).find(selector);
    };
}


function makeIndexQuery(indexStr) {
    var int = parseInt(indexStr, 10);
    return function indexQuery(elm) {
        return ensureJqApi(elm).eq(int);
    };
}


function textQuery(elm) {
    return ensureJqApi(elm).text();
}


function makeAttrQuery(attr) {
    return function attrQuery(elm) {
        return ensureJqApi(elm).attr(attr);
    };
}


function accessorSeq(parser) {
    var queries = [],
        tok = parser.nextToken(),
        attr,
        expected;
    if (tok.type === tokenType.INDEX_ACCESSOR) {
        queries.push(makeIndexQuery(tok.content));
        tok = parser.nextToken();
        // index accessor might be the only accessor
        if (tok.type === tokenType.QUERY_STATEMENT_END) {
            return queries;
        }
    }
    // can only have one of text or attr accessors
    if (tok.type === tokenType.TEXT_ACCESSOR) {
        queries.push(textQuery);
    } else if (tok.type === tokenType.ATTR_ACCESSOR) {
        // strip spaces and the brackets, ex: "[href]"
        attr = tok.content.trim().slice(1, -1);
        queries.push(makeAttrQuery(attr));
    } else {
        // if it got here, something is wrong, either the query should have ended after
        // an index accessor (if there was one) or a text or attr accessor should have
        // been encountered
        expected = [tokenType.TEXT_ACCESSOR, tokenType.ATTR_ACCESSOR];
        if (!queries.length) {
            expected.push(tokenType.INDEX_ACCESSOR);
        }
        throw new UnexpectedTokenError(tok.type, expected, tok);
    }
    tok = parser.nextToken();
    if (tok.type !== tokenType.QUERY_STATEMENT_END) {
        throw new UnexpectedTokenError(tok.type, tokenType.QUERY_STATEMENT_END, tok);
    }
    return queries;
}


function cssSelector(parser) {
    var selector = parser._tok.content.trim(),
        query = makeCssQuery(selector),
        tok = parser.nextToken();
    if (tok.type === tokenType.QUERY_STATEMENT_END) {
        return [query];
    } else if (tok.type === tokenType.ACCESSOR_SEQUENCE) {
        return [query].concat(accessorSeq(parser));
    } else {
        throw new UnexpectedTokenError(
            tok.type,
            [tokenType.QUERY_STATEMENT_END, tokenType.ACCESSOR_SEQUENCE],
            tok);
    }
}


function QueryNode(queries) {
    this._queries = queries;
}

QueryNode.prototype.exec = function exec(context) {
    var val = context.value,
        len = this._queries.length,
        i = 0;
    for (; i < len; i++) {
        val = this._queries[i](val);
    }
    context.lastValue = val;
};


exports.parse = function parseQuery(parser) {
    var tok = parser.nextToken(),
        queries;
    if (tok.type === tokenType.CSS_SELECTOR) {
        queries = cssSelector(parser);
    } else if (tok.type === tokenType.ACCESSOR_SEQUENCE) {
        queries = accessorSeq(parser);
    } else {
        throw new UnexpectedTokenError(
            tok.type,
            [tokenType.CSS_SELECTOR, tokenType.ACCESSOR_SEQUENCE],
            tok);
    }
    return new QueryNode(queries);
};
