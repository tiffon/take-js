// @flow

import InvalidDirectiveError from '../errors/InvalidDirectiveError';
import UnexpectedTokenError from '../errors/UnexpectedTokenError';
import directives from '../directives';
import { INode } from '../INode';
import { parse as parseQuery } from '../query';
import Token from '../Token';
import TokenType from '../TokenType';
import ContextNode from './ContextNode';
import type { ParseResult } from './ParseResult';


export default class ContextParser {

    _depth: number;
    _tokenGetter: [Function];
    _defs: Object;
    _fromInline: boolean;
    _nodes: Array<INode>;
    _tok: ?Token;
    _isDone: boolean;

    constructor(depth: number, getToken: Function, defs: bject, fromInline?: boolean) {
        this._depth = depth;
        this._tokenGetter = [getToken];
        this._defs = defs || {};
        this._fromInline = !!fromInline;
        this._nodes = [];
        this._tok = undefined;
        this._isDone = false;
    }

    getDefs(): Object {
        return this._defs;
    }

    getDepth(): number {
        return this._depth;
    }

    getTok(): ?Token {
        return this._tok;
    }

    destroy() {
        this._tokenGetter = [];
        this._defs = {};
        this._nodes = [];
        this._tok = undefined;
    }

    parse(): ParseResult {
        var tok;
        if (this._isDone) {
            throw new Error('Already parsed.');
        }
        tok = this._parse();
        return {
            node: new ContextNode(this._depth, this._nodes),
            endTok: tok
        };
    }

    spawnContextParser(depth?: number, fromInline?: boolean): ContextParser {
        var defs = Object.create(this._defs);
        if (depth == null) {
            if (!this._tok) {
                throw new Error('Invalid state: this._tok cannot be null when spawing ContextParser without a provided depth');
            }
            depth = this._tok.end;
        }
        // TODO: prototype chain for defs
        return new ContextParser(depth, this._tokenGetter[0], defs, fromInline);
    }

    nextToken(acceptEOF?: boolean): ?Token {
        this._tok = this._tokenGetter[0]();
        if (!this._tok) {
            this._isDone = true;
            if (!acceptEOF) {
                throw new Error('Unexpected end of input');
            }
        }
        return this._tok;
    }

    _parse() {
        var tok,
            endSubTok;
        while (true) {
            tok = this.nextToken();
            if (!tok) {
                throw new Error('Token expected, found EOF');
            }
            if (tok.type === TokenType.QUERY_STATEMENT) {
                this._parseQuery();
                tok = undefined;
            } else if (tok.type === TokenType.DIRECTIVE_STATEMENT) {
                tok = this._parseDirective();
            } else {
                throw new UnexpectedTokenError(
                    tok.type,
                    [TokenType.QUERY_STATEMENT, TokenType.DIRECTIVE_STATEMENT],
                    tok);
            }
            if (!tok) {
                // get the next token, EOF is ok
                tok = this.nextToken(true);
            }
            if (!tok) {
                return;
            }
            if (tok.type !== TokenType.CONTEXT && tok.type !== TokenType.INLINE_SUB_CONTEXT) {
                throw new UnexpectedTokenError(
                    tok.type,
                    [TokenType.CONTEXT, TokenType.INLINE_SUB_CONTEXT],
                    tok);
            }
            if (tok.type === TokenType.INLINE_SUB_CONTEXT) {
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
                    if (endSubTok.type !== TokenType.CONTEXT) {
                        throw new UnexpectedTokenError(endSubTok.type, TokenType.CONTEXT, endSubTok);
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
    }

    _parseContext(): ?Token {
        var subCtx = this.spawnContextParser(),
            result = subCtx.parse();
        subCtx.destroy();
        if (result.node) {
            this._nodes.push(result.node);
        } else {
            throw new Error('Expected to find a sub-context');
        }
        return result.endTok;
    }

    _parseInlineSubContext(): ?Token {
        var subCtx = this.spawnContextParser(this._depth, true),
            result = subCtx.parse();
        subCtx.destroy();
        if (result.node) {
            this._nodes.push(result.node);
        } else {
            throw new Error('Expected to find an inline-sub-context');
        }
        return result.endTok;
    }

    _parseQuery() {
        this._nodes.push(parseQuery(this));
    }

    // directives return their last token because they can parse sub-contexts
    _parseDirective() {
        var tok = this.nextToken(),
            ident,
            defNode,
            result;

        if (!tok) {
            throw new Error('Invalid state: this._tok cannot be null when parsing a call to a directive');
        }
        if (tok.type !== TokenType.DIRECTIVE_IDENTIFIER) {
            throw new UnexpectedTokenError(tok.type, TokenType.DIRECTIVE_IDENTIFIER, tok);
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
    }

    _parseCallUserDirective(defNode: INode) {
        var tok = this.nextToken();
        if (!tok) {
            throw new Error('Invalid state: this._tok cannot be null when parsing a call to a user-directive');
        }
        if (tok.type !== TokenType.DIRECTIVE_STATEMENT_END) {
            throw new UnexpectedTokenError(tok.type, TokenType.DIRECTIVE_STATEMENT_END, tok);
        }
        this._nodes.push(defNode);
    }
}
