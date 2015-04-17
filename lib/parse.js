
// var jqProvider = require('./jq-provider');

var errors = require('./errors'),
    UnexpectedTokenError = errors.UnexpectedTokenError,
    InvalidDirectiveError = errors.InvalidDirectiveError,
    TakeSyntaxError = errors.TakeSyntaxError;

var tokenType = require('./token-type'),
    Scanner = require('./scanner'),
    parseQuery = require('./query').parse,
    directives = require('./directives');


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
    this.lastValue = lastValue != null ? lastValue : this._value;
    for (; i < len; i++) {
        this._nodes[i].exec(this);
    }
};


function ContextParser(depth, getToken, defs, fromInline) {
    this._depth = depth;
    this._tokenGetter = [getToken];
    this._defs = defs || {};
    this._fromInline = fromInline;
    this._nodes = undefined;
    this._tok = undefined;
    this._isDone = false;
}

Object.defineProperties(ContextParser.prototype, {
    defs: {
        get: function() {
            return this._defs;
        }
    },
    depth: {
        get: function() {
            return this._depth;
        }
    }
});

ContextParser.prototype.destroy = function destroy() {
    this._depth = undefined;
    this._tokenGetter = undefined;
    this._defs = undefined;
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
    return {
        node: new ContextNode(this._depth, this._nodes),
        endTok: tok
    };
};

ContextParser.prototype.spawnContextParser = function spawnContextParser(depth, fromInline) {
    var defs = Object.create(this._defs);
    if (depth == null) {
        depth = this._tok.end;
    }
    // TODO: prototype chain for defs
    return new ContextParser(depth, this._tokenGetter[0], defs, fromInline);
};

ContextParser.prototype.nextToken = function nextToken(acceptEOF) {
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
        endSubTok;
    while (true) {
        tok = this.nextToken();
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
            tok = this.nextToken(true);
        }
        if (this._isDone) {
            return;
        }
        if (tok.type !== tokenType.CONTEXT && tok.type !== tokenType.INLINE_SUB_CONTEXT) {
            throw new UnexpectedTokenError(
                tok.type,
                [tokenType.CONTEXT, tokenType.INLINE_SUB_CONTEXT],
                tok);
        }
        if (tok.type === tokenType.INLINE_SUB_CONTEXT) {
            endSubTok = this._parseInlineSubContext();
            if (!endSubTok) {
                // TODO(joe): check to see if i can get rid of this last request for a token
                // get the next token, EOF is ok
                tok = this.nextToken(true);
                if (!tok) {
                    return;
                }
            } else {
                // should be a context token (context from the next line)
                if (endSubTok.type !== tokenType.CONTEXT) {
                    throw new UnexpectedTokenError(endSubTok.type, tokenType.CONTEXT, endSubTok);
                }
                // should be treated like any other context token, the following conditions will check
                // to see if it's a sub-context, the current context or an ancestor context (inline sub
                // contexts are a one-off, so the `endSubTok` is from the next line)
                tok = endSubTok;
            }
        }
        if (tok.end > this._depth) {
            endSubTok = this._parseContext();
            if (!endSubTok) {
                // `endSubTok` is either the last token parsed in the sub-context or
                // `undefined`, if it's `undefined` then we've reached EOF
                return;
            }
            // If `endSubTok` is defined, then it's a context token. It's possible the
            // depth is less than this context's depth, so use `endSubTok` as `tok` to
            // see if this context should end.
            tok = endSubTok;
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
        // exit if the current context parser was created from an inline
        // context - they only persist if the context is deeper
        if (this._fromInline) {
            return tok;
        }
    }
};

ContextParser.prototype._parseContext = function _parseContext() {
    var subCtx = this.spawnContextParser(),
        result = subCtx.parse();
    subCtx.destroy();
    this._nodes.push(result.node);
    return result.endTok;
};

ContextParser.prototype._parseInlineSubContext = function _parseInlineSubContext() {
    var subCtx = this.spawnContextParser(this._depth, true),
        result = subCtx.parse();
    subCtx.destroy();
    this._nodes.push(result.node);
    return result.endTok;
};

ContextParser.prototype._parseQuery = function _parseQuery() {
    this._nodes.push(parseQuery(this));
};

ContextParser.prototype._parseCssSelector = function _parseCssSelector() {
    var selector = this._tok.content.trim(),
        query = makeCssQuery(selector),
        tok = this.nextToken();
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
        tok = this.nextToken(),
        attr,
        expected;
    if (tok.type === tokenType.INDEX_ACCESSOR) {
        queries.push(makeIndexQuery(tok.content));
        tok = this.nextToken();
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
    tok = this.nextToken();
    if (tok.type !== tokenType.QUERY_STATEMENT_END) {
        throw new UnexpectedTokenError(tok.type, tokenType.QUERY_STATEMENT_END, tok);
    }
    return queries;
};

// directives return their last token because they can parse sub-contexts
ContextParser.prototype._parseDirective = function _parseDirective() {
    var tok = this.nextToken(),
        ident,
        defNode,
        result;
    if (tok.type !== tokenType.DIRECTIVE_IDENTIFIER) {
        throw new UnexpectedTokenError(tok.type, tokenType.DIRECTIVE_IDENTIFIER, tok);
    }
    ident = tok.content.trim();
    if (directives[ident]) {
        result = directives[ident](this);
        if (result.node) {
            // `result.node` is undefined for `def` directives bc they add the node to `this.defs` instead
            this._nodes.push(result.node);
        }
        return result.endTok;
    } else if (this._defs[ident]) {
        this._parseCallUserDirective(this._defs[ident]);
    } else {
        throw new InvalidDirectiveError(
            ident,
            'Unknown directive: ' + JSON.stringify(ident),
            tok);
    }
};

ContextParser.prototype._parseCallUserDirective = function _parseCallUserDirective(defNode) {
    var tok = this.nextToken();
    if (tok.type !== tokenType.DIRECTIVE_STATEMENT_END) {
        throw new UnexpectedTokenError(tok.type, tokenType.DIRECTIVE_STATEMENT_END, tok);
    }
    this._nodes.push(defNode);
};




function parse(lines) {
    var scanner = new Scanner(lines),
        tok = scanner.getToken(),
        ctx,
        result;
    if (tok.type !== tokenType.CONTEXT) {
        throw new UnexpectedTokenError(tok.type, tokenType.CONTEXT, 'Leading context token not found.');
    }
    ctx = new ContextParser(tok.end, scanner.getToken.bind(scanner));
    result = ctx.parse();
    ctx.destroy();
    if (result.endTok) {
        throw new UnexpectedTokenError(tok, 'EOF');
    }
    return result.node;
}

exports.parse = parse;
