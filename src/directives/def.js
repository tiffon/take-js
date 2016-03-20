// @flow

import TakeSyntaxError from '../errors/TakeSyntaxError';
import UnexpectedTokenError from '../errors/UnexpectedTokenError';
import { INode } from '../INode';
import ContextParser from '../parse/ContextParser';
import type { ParseResult } from '../parse/ParseResult';
import Token from '../Token';
import TokenType from '../TokenType';
import { getSubContext } from './utils';


class DefSubroutineNode {
    _subCtxNode: INode;

    constructor(subCtxNode: INode) {
        this._subCtxNode = subCtxNode;
    }
    exec(context) {
        if (context == null) {
            throw new Error('Invalid context - def INode must be exececuted on a non-null context');
        }
        var rv = {};
        this._subCtxNode.exec(undefined, rv, context.value, context.value);
        context.lastValue = rv;
    }
}


export function makeDefSubroutine(parser: ContextParser): ParseResult {
    var nameParts = [],
        tok: ?Token = parser.nextToken();
    if (!tok) {
        throw new TakeSyntaxError('The `def` directive requires a parameter for the name');
    }
    // collect the name parts, which might be space separated, eg: 'def: some name'
    while (tok && tok.type === TokenType.DIRECTIVE_BODY_ITEM) {
        nameParts.push(tok.content.trim());
        tok = parser.nextToken();
    }
    if (!nameParts.length) {
        throw new TakeSyntaxError('The `def` directive requires a parameter for the name', tok);
    }
    if (!tok) {
        throw new TakeSyntaxError(`Expecting a ${TokenType.DIRECTIVE_STATEMENT_END} token`);
    }
    if (tok.type !== TokenType.DIRECTIVE_STATEMENT_END) {
        throw new UnexpectedTokenError(tok.type, TokenType.DIRECTIVE_STATEMENT_END, tok);
    }
    // parse the sub context
    const
        subCtxResult: ParseResult = getSubContext(parser, 'def'),
        defName: string = nameParts.join(' ');
    if (!subCtxResult.node) {
        throw new Error('Invalid sub-context for def directive');
    }
    parser.getDefs()[defName] = new DefSubroutineNode(subCtxResult.node);
    return {
        node: undefined,
        endTok: subCtxResult.endTok
    };
}
