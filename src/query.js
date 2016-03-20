// @flow

import TakeSyntaxError from './errors/TakeSyntaxError';
import UnexpectedTokenError from './errors/UnexpectedTokenError';
import { INode } from './INode';
import jqProvider from './jq-provider';
import ContextParser from './parse/ContextParser';
import TokenType from './TokenType';
import Token from './Token';


function ensureJqApi(elm: any): jqProvider {
    if (elm instanceof jqProvider) {
        return elm;
    }
    return jqProvider(elm);
}


function makeCssQuery(selector: string): Function {
    return function cssQuery(elm) {
        return ensureJqApi(elm).find(selector);
    };
}


function makeIndexQuery(indexStr: string): Function {
    const int = parseInt(indexStr, 10);
    return function indexQuery(elm) {
        return ensureJqApi(elm).eq(int);
    };
}


function textQuery(elm: any): string {
    return ensureJqApi(elm).text();
}


function makeAttrQuery(attr: string): Function {
    return function attrQuery(elm) {
        return ensureJqApi(elm).attr(attr);
    };
}


function accessorSeq(parser: ContextParser): Array<Function> {
    const queries: Array<Function> = [];
    let tok = parser.nextToken();
    if (!tok) {
        throw new TakeSyntaxError(`Expected to find a ${TokenType.INDEX_ACCESSOR}, ${TokenType.ATTR_ACCESSOR} or ${TokenType.TEXT_ACCESSOR} token`);
    }
    if (tok.type === TokenType.INDEX_ACCESSOR) {
        queries.push(makeIndexQuery(tok.content));
        tok = parser.nextToken();
        if (!tok) {
            throw new TakeSyntaxError(`Expected to find a ${TokenType.QUERY_STATEMENT_END} or ${TokenType.TEXT_ACCESSOR} token`);
        }
        // index accessor might be the only accessor
        if (tok.type === TokenType.QUERY_STATEMENT_END) {
            return queries;
        }
    }
    // can only have one of text or attr accessors
    if (tok.type === TokenType.TEXT_ACCESSOR) {
        queries.push(textQuery);
    } else if (tok.type === TokenType.ATTR_ACCESSOR) {
        // strip spaces and the brackets, ex: "[href]"
        const attr = tok.content.trim().slice(1, -1);
        queries.push(makeAttrQuery(attr));
    } else {
        // if it got here, something is wrong, either the query should have ended after
        // an index accessor (if there was one) or a text or attr accessor should have
        // been encountered
        const expected = [TokenType.TEXT_ACCESSOR, TokenType.ATTR_ACCESSOR];
        if (!queries.length) {
            expected.push(TokenType.INDEX_ACCESSOR);
        }
        throw new UnexpectedTokenError(tok.type, expected, tok);
    }
    const endTok = parser.nextToken();
    if (!endTok) {
        throw new TakeSyntaxError(`Expected to find a ${TokenType.QUERY_STATEMENT_END} token`);
    }
    if (endTok.type !== TokenType.QUERY_STATEMENT_END) {
        throw new UnexpectedTokenError(endTok.type, TokenType.QUERY_STATEMENT_END, endTok);
    }
    return queries;
}


function cssSelector(parser: ContextParser): Array<Function> {
    if (!parser._tok) {
        throw new TakeSyntaxError(`Expected to find a token, instead found EOF`);
    }
    const
        selector = parser._tok.content.trim(),
        query = makeCssQuery(selector),
        tok = parser.nextToken();
    if (!tok) {
        throw new TakeSyntaxError(`Expected to find a ${TokenType.QUERY_STATEMENT_END} or ${TokenType.ACCESSOR_SEQUENCE} token`);
    }
    if (tok.type === TokenType.QUERY_STATEMENT_END) {
        return [query];
    } else if (tok.type === TokenType.ACCESSOR_SEQUENCE) {
        return [query].concat(accessorSeq(parser));
    } else {
        throw new UnexpectedTokenError(
            tok.type,
            [TokenType.QUERY_STATEMENT_END, TokenType.ACCESSOR_SEQUENCE],
            tok);
    }
}


class QueryNode {

    _queries: Array<Function>;

    constructor(queries: Array<Function>) {
        this._queries = queries;
    }
    exec(context?: Object) {
        if (!context) {
            throw new Error('Invalid context, expected to find a context for a query node');
        }
        var val = context.value,
            len = this._queries.length,
            i = 0;
        for (; i < len; i++) {
            val = this._queries[i](val);
        }
        context.lastValue = val;
    }
}


exports.parse = function parseQuery(parser: ContextParser): INode {
    var tok = parser.nextToken(),
        queries;
    if (!tok) {
       throw new TakeSyntaxError(`Expected to find a ${TokenType.CSS_SELECTOR} or ${TokenType.ACCESSOR_SEQUENCE} token`);
   }
    if (tok.type === TokenType.CSS_SELECTOR) {
        queries = cssSelector(parser);
    } else if (tok.type === TokenType.ACCESSOR_SEQUENCE) {
        queries = accessorSeq(parser);
    } else {
        throw new UnexpectedTokenError(
            tok.type,
            [TokenType.CSS_SELECTOR, TokenType.ACCESSOR_SEQUENCE],
            tok);
    }
    return new QueryNode(queries);
};
