
var jqProvider = require('./jq-provider');

var errors = require('./errors'),
    UnexpectedTokenError = errors.UnexpectedTokenError,
    InvalidDirectiveError = errors.InvalidDirectiveError,
    TakeSyntaxError = errors.TakeSyntaxError;

var tokenType = require('./token-type'),
    Scanner = require('./scanner');


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

function makeTextQuery() {
    return function textQuery(elm) {
        return ensureJqApi(elm).text();
    };
}

function makeAttrQuery(attr) {
    return function attrQuery(elm) {
        return ensureJqApi(elm).attr(attr);
    };
}

function parseSaveToID(tok) {
    if (tok.type !== tokenType.DIRECTIVE_BODY_ITEM) {
        throw new UnexpectedTokenError(
            tok.type,
            tokenType.DIRECTIVE_BODY_ITEM,
            tok,
            'Invalid save ID');
    }
    return tok.content.trim().split('.');
}

// Util to save some name sequence to an object. For instance, `['location', 'query']`
// will save `value` to dest['location']['query'].
function saveTo(dest, nameParts, value) {
    var max = nameParts.length - 1,
        i = 0,
        part;
    if (!max) {
        dest[nameParts[0]] = value;
    } else {
        for (; i < max; i++) {
            part = nameParts[i];
            if (part in dest) {
                dest = dest[part];
            } else {
                dest = dest[part] = {};
            }
        }
        part = nameParts[i];
        dest[part] = value;
    }
}


function ContextNode(depth, nodes) {
    this._depth = depth;
    this._nodes = nodes;
    this._rv = undefined;
    this._value = undefined;
    this.lastValue = undefined;
}

Object.defineProperties(ContextNode.prototype, {
    rv: {
        get: function() {
            return this._rv;
        }
    },
    value: {
        get: function() {
            return this._value;
        }
    }
});

ContextNode.prototype.exec = function exec(context, rv, value, lastValue) {
    var len = this._nodes.length,
        i = 0;
    this._rv = rv != null ? rv : context.rv;
    // value in a sub-context is derived from the parent context's lastValue
    this._value = value != null ? value : context.lastValue;
    if (lastValue != null) {
        this.lastValue = lastValue;
    } else if (value != null) {
        this.lastValue = value;
    } else if (context != null) {
        if (context.lastValue != null) {
            this.lastValue = context.lastValue;
        } else if (context.value != null) {
            this.lastValue = context.value;
        } else {
            this.lastValue = undefined;
        }
    } else {
        this.lastValue = undefined;
    }
    for (; i < len; i++) {
        this._nodes[i].exec(this);
    }
};


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


function SaveNode(nameParts) {
    this._nameParts = nameParts;
}

SaveNode.prototype.exec = function exec(context) {
    saveTo(context.rv, this._nameParts, context.value);
};


function SaveEachNode(nameParts, subContextNode) {
    this._nameParts = nameParts;
    this._subContext = subContextNode;
}

SaveEachNode.prototype.exec = function exec(context) {
    var items = context.value,
        results = [],
        i = 0,
        subCtx,
        len,
        item,
        rv;
    saveTo(context.rv, this._nameParts, results);
    if (items == null || !items.length) {
        return;
    }
    subCtx = this._subContext;
    len = items.length;
    for (; i < len; i++) {
        item = items[i];
        rv = {};
        results.push(rv);
        subCtx.exec(undefined, rv, item, item);
    }
};


function ContextParser(depth, getToken) {
    this._depth = depth;
    this._tokenGetter = [getToken];
    this._nodes = undefined;
    this._tok = undefined;
    this._isDone = false;
}

ContextParser.prototype.destroy = function destroy() {
    this._depth = undefined;
    this._tokenGetter = undefined;
    this._nodes = undefined;
    this._tok = undefined;
    this._isDone = undefined;
};

ContextParser.prototype.parse = function parse() {
    var tok;
    if (this._isDone) {
        throw new Error('Already parsed.');
    }
    this._nodes = [];
    tok = this._parse();
    return [new ContextNode(this._depth, this._nodes), tok];
};

ContextParser.prototype._nextToken = function _nextToken(acceptEOF) {
    this._tok = this._tokenGetter[0]();
    if (!this._tok) {
        this._isDone = true;
        if (!acceptEOF) {
            throw new Error('Unexpected end of input');
        }
    }
    return this._tok;
};

ContextParser.prototype._parse = function _parse() {
    var tok,
        subCtxEndToken;
    while (true) {
        tok = this._nextToken();
        if (tok.type === tokenType.QUERY_STATEMENT) {
            this._parseQuery();
            tok = undefined;
        } else if (tok.type === tokenType.DIRECTIVE_STATEMENT) {
            tok = this._parseDirective();
        } else {
            throw new UnexpectedTokenError(
                tok.type,
                [tokenType.QUERY_STATEMENT, tokenType.DIRECTIVE_STATEMENT],
                tok);
        }
        if (!tok) {
            // get the next token, EOF is ok
            tok = this._nextToken(true);
        }
        if (this._isDone) {
            return;
        }
        if (tok.type !== tokenType.CONTEXT) {
            throw new UnexpectedTokenError(tok.type, tokenType.CONTEXT, tok);
        }
        if (tok.end > this._depth) {
            subCtxEndToken = this._parseContext();
            if (!subCtxEndToken) {
                // `subCtxEndToken` is either the last token parsed in the sub-context or
                // `undefined`, if it's `undefined` then we've reached EOF
                return;
            }
            // If `subCtxEndToken` is defined, then it's a context token. It's possible the
            // depth is less than this context's depth, so use `subCtxEndToken` as `tok` to
            // see if this context should end.
            tok = subCtxEndToken;
            // TODO: consider detecting scenario where entered a sub-context with
            // indent+4 but exited that sub-context with indent+2... possibly do not
            // allow this type of thing / detect and error
        }
        if (tok.end < this._depth) {
            // exit this context because the context token is more shallow than this
            // context's indent
            return tok;
        }
        // context token has the same depth, so continue this parse loop
    }
};

ContextParser.prototype._parseContext = function _parseContext() {
    var subCtx = new ContextParser(this._tok.end, this._tokenGetter[0]),
        pair = subCtx.parse(),
        subNode = pair[0],
        endTok = pair[1];
    subCtx.destroy();
    this._nodes.push(subNode);
    return endTok;
};

ContextParser.prototype._parseQuery = function _parseQuery() {
    var tok = this._nextToken(),
        queries;
    if (tok.type === tokenType.CSS_SELECTOR) {
        queries = this._parseCssSelector();
    } else if (tok.type === tokenType.ACCESSOR_SEQUENCE) {
        queries = this._parseAccessorSeq();
    } else {
        throw new UnexpectedTokenError(
            tok.type,
            [tokenType.CSS_SELECTOR, tokenType.ACCESSOR_SEQUENCE],
            tok);
    }
    this._nodes.push(new QueryNode(queries));
};

ContextParser.prototype._parseCssSelector = function _parseCssSelector() {
    var selector = this._tok.content.trim(),
        query = makeCssQuery(selector),
        tok = this._nextToken();
    if (tok.type === tokenType.QUERY_STATEMENT_END) {
        return [query];
    } else if (tok.type === tokenType.ACCESSOR_SEQUENCE) {
        return [query].concat(this._parseAccessorSeq());
    } else {
        throw new UnexpectedTokenError(
            tok.type,
            [tokenType.QUERY_STATEMENT_END, tokenType.ACCESSOR_SEQUENCE],
            tok);
    }
};

ContextParser.prototype._parseAccessorSeq = function _parseAccessorSeq() {
    var queries = [],
        tok = this._nextToken(),
        attr,
        expected;
    if (tok.type === tokenType.INDEX_ACCESSOR) {
        queries.push(makeIndexQuery(tok.content));
        tok = this._nextToken();
        // index accessor might be the only accessor
        if (tok.type === tokenType.QUERY_STATEMENT_END) {
            return queries;
        }
    }
    // can only have one of text or attr accessors
    if (tok.type === tokenType.TEXT_ACCESSOR) {
        queries.push(makeTextQuery());
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
    tok = this._nextToken();
    if (tok.type !== tokenType.QUERY_STATEMENT_END) {
        throw new UnexpectedTokenError(tok.type, tokenType.QUERY_STATEMENT_END, tok);
    }
    return queries;
};

// directives return their last token because they can parse sub-contexts
ContextParser.prototype._parseDirective = function _parseDirective() {
    var tok = this._nextToken(),
        ident;
    if (tok.type !== tokenType.DIRECTIVE_IDENTIFIER) {
        throw new UnexpectedTokenError(tok.type, tokenType.DIRECTIVE_IDENTIFIER, tok);
    }
    ident = tok.content.trim();
    if (ident === 'save') {
        return this._parseSaveDirective();
    } else if (ident === 'save each') {
        return this._parseSaveEachDirective();
    } else {
        throw new InvalidDirectiveError(
            ident,
            'Expecting either "save" or "save each" directive".',
            tok);
    }
};

ContextParser.prototype._parseSaveDirective = function _parseSaveDirective() {
    var tok = this._nextToken(),
        nameParts = parseSaveToID(tok),
        node = new SaveNode(nameParts);
    this._nodes.push(node);
};

ContextParser.prototype._parseSaveEachDirective = function _parseSaveEachDirective() {
    var tok = this._nextToken(),
        nameParts = parseSaveToID(tok),
        subCtx,
        pair,
        subCtxNode,
        lastTok,
        node;
    tok = this._nextToken();
    if (tok.type !== tokenType.CONTEXT) {
        throw new UnexpectedTokenError(tok.type, tokenType.CONTEXT, tok);
    }
    if (tok.end <= this._depth) {
        throw new TakeSyntaxError('Invalid depth, expecting to start a "save each" context.', tok);
    }
    subCtx = new ContextParser(tok.end, this._tokenGetter[0]);
    pair = subCtx.parse();
    subCtxNode = pair[0];
    lastTok = pair[1];
    subCtx.destroy();
    node = new SaveEachNode(nameParts, subCtxNode);
    this._nodes.push(node);
    return lastTok;
};


function parse(lines) {
    var scanner = new Scanner(lines),
        tok = scanner.getToken(),
        ctx,
        pair,
        node,
        lastTok;
    if (tok.type !== tokenType.CONTEXT) {
        throw new UnexpectedTokenError(tok.type, tokenType.CONTEXT, 'Leading context token not found.');
    }
    ctx = new ContextParser(tok.end, scanner.getToken.bind(scanner));
    pair = ctx.parse();
    node = pair[0];
    lastTok = pair[1];
    ctx.destroy();
    if (lastTok) {
        throw new UnexpectedTokenError(tok, 'EOF');
    }
    return node;
}

exports.parse = parse;
