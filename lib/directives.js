'use strict';

var errors = require('./errors'),
    UnexpectedTokenError = errors.UnexpectedTokenError,
    TakeSyntaxError = errors.TakeSyntaxError;

var utils = require('./utils'),
    getViaNameList = utils.getViaNameList,
    saveToNameList = utils.saveToNameList;

var tokenType = require('./token-type');


function getOneParam(parser) {
    var tok = parser.nextToken(),
        endTok;
    if (tok.type !== tokenType.DIRECTIVE_BODY_ITEM) {
        throw new UnexpectedTokenError(
            tok.type,
            tokenType.DIRECTIVE_BODY_ITEM,
            tok);
    }
    endTok = parser.nextToken();
    if (endTok.type !== tokenType.DIRECTIVE_STATEMENT_END) {
        throw new UnexpectedTokenError(
            endTok.type,
            tokenType.DIRECTIVE_STATEMENT_END,
            endTok);
    }
    return tok;
}

function getSubContext(parser, directiveName) {
    // the next token should be a sub-context
    var tok = parser.nextToken(),
        subCtx,
        result;
    if (tok.type !== tokenType.CONTEXT) {
        throw new UnexpectedTokenError(
            tok.type,
            tokenType.CONTEXT,
            tok);
    }
    if (tok.end <= parser.depth) {
        throw new TakeSyntaxError('Invalid depth, expecting to start a "' + directiveName + '" context.', tok);
    }
    // parse the sub-context the `SaveEachNode` will manage
    subCtx = parser.spawnContextParser();
    result = subCtx.parse();
    subCtx.destroy();
    return result;
}


function SaveNode(nameParts) {
    this._nameParts = nameParts;
}

SaveNode.prototype.exec = function exec(context) {
    saveToNameList(context.rv, this._nameParts, context.value);
};

function makeSave(parser) {
    var tok = getOneParam(parser),
        nameParts = tok.content.trim().split('.');
    return {
        node: new SaveNode(nameParts),
        endTok: undefined
    };
}


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
    saveToNameList(context.rv, this._nameParts, results);
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

function makeSaveEach(parser) {
    var tok = getOneParam(parser),
        nameParts = tok.content.trim().split('.'),
        result = getSubContext(parser);
    return {
        node: new SaveEachNode(nameParts, result.node),
        endTok: result.endTok
    };
}


function DefSubroutineNode(subCtxNode) {
    this._subCtxNode = subCtxNode;
}

DefSubroutineNode.prototype.exec = function exec(context) {
    var rv = {};
    this._subCtxNode.exec(undefined, rv, context.value, context.value);
    context.lastValue = rv;
};

function makeDefSubroutine(parser) {
    var nameParts = [],
        tok = parser.nextToken(),
        defName,
        subCtxResult;
    // collect the name parts, which might be space separated, eg: 'def: some name'
    while (tok.type === tokenType.DIRECTIVE_BODY_ITEM) {
        nameParts.push(tok.content.trim());
        tok = parser.nextToken();
    }
    if (!nameParts.length) {
        throw new TakeSyntaxError('The `def` directive requires a parameter for the name', tok);
    }
    defName = nameParts.join(' ');
    if (tok.type !== tokenType.DIRECTIVE_STATEMENT_END) {
        throw new UnexpectedTokenError(tok.type, tokenType.DIRECTIVE_STATEMENT_END, tok);
    }
    // parse the sub context
    subCtxResult = getSubContext(parser);
    parser.defs[defName] = new DefSubroutineNode(subCtxResult.node);
    return {
        node: undefined,
        endTok: subCtxResult.endTok
    };
}


function NamespaceNode(identParts, subCtxNode) {
    this.identParts = identParts;
    this._subCtxNode = subCtxNode;
}

NamespaceNode.prototype.exec = function exec(context) {
    var subRv = getViaNameList(context.rv, this.identParts);
    if (subRv == null) {
        subRv = {};
        saveToNameList(context.rv, this.identParts, subRv);
    }
    this._subCtxNode.exec(undefined, subRv, context.value, context.value);
};

function makeNamespace(parser) {
    var tok = getOneParam(parser),
        nameParts = tok.content.trim().split('.'),
        result = getSubContext(parser);
    return {
        node: new NamespaceNode(nameParts, result.node),
        endTok: result.endTok
    };
}



module.exports = Object.freeze({
    save: makeSave,
    ':': makeSave,
    'save each': makeSaveEach,
    def: makeDefSubroutine,
    namespace: makeNamespace,
    '+': makeNamespace
});
