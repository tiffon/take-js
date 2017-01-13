// @flow

import TakeSyntaxError from '../errors/TakeSyntaxError';
import UnexpectedTokenError from '../errors/UnexpectedTokenError';
import { INode } from '../INode';
import ContextParser from '../parse/ContextParser';
import type { ParseResult } from '../parse/ParseResult';
import Token from '../Token';
import TokenType from '../TokenType';


export function getOneParam(parser: ContextParser): Token {
    var tok = parser.nextToken(),
        endTok;
    if (!tok) {
        throw new TakeSyntaxError(`Expected ${TokenType.DIRECTIVE_BODY_ITEM} token, found EOF`);
    }
    if (tok.type !== TokenType.DIRECTIVE_BODY_ITEM) {
        throw new UnexpectedTokenError(
            tok.type,
            TokenType.DIRECTIVE_BODY_ITEM,
            tok);
    }
    endTok = parser.nextToken();
    if (!endTok) {
        throw new TakeSyntaxError(`Expected ${TokenType.DIRECTIVE_STATEMENT_END} token, found EOF`);
    }
    if (endTok.type !== TokenType.DIRECTIVE_STATEMENT_END) {
        throw new UnexpectedTokenError(
            endTok.type,
            TokenType.DIRECTIVE_STATEMENT_END,
            endTok);
    }
    return tok;
}


export function getSubContext(parser: ContextParser, directiveName: string): ParseResult {
    // the next token should be a sub-context
    var tok = parser.nextToken(),
        subCtx: ContextParser,
        result: ParseResult;
    if (!tok) {
        throw new TakeSyntaxError(`Expected ${TokenType.CONTEXT} token, found EOF`);
    }
    if (tok.type !== TokenType.CONTEXT) {
        throw new UnexpectedTokenError(
            tok.type,
            TokenType.CONTEXT,
            tok);
    }
    if (tok.end <= parser.getDepth()) {
        throw new TakeSyntaxError(`Invalid depth, expecting to start a "${directiveName}" context.`, tok);
    }
    // parse the sub-context
    subCtx = parser.spawnContextParser();
    result = subCtx.parse();
    subCtx.destroy();
    return result;
}
