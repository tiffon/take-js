// @flow

import { INode } from '../INode';
import type { ParseResult } from '../parse/ParseResult';
import Token from '../Token';
import { getViaNameList, saveToNameList } from '../utils';
import { getOneParam, getSubContext } from './utils';


class NamespaceNode {
    _identParts: Array<string>;
    _subCtxNode: INode;

    constructor(_identParts: Array<string>, subCtxNode: INode) {
        this._identParts = _identParts;
        this._subCtxNode = subCtxNode;
    }

    exec(context?: Object) {
        if (context == null) {
            throw new Error('context must not be `== null` for "namespace" directive');
        }
        var subRv = getViaNameList(context.rv, this._identParts);
        if (subRv == null) {
            subRv = {};
            saveToNameList(context.rv, this._identParts, subRv);
        }
        this._subCtxNode.exec(undefined, subRv, context.value, context.value);
    }
}


export function makeNamespace(parser: Object): ParseResult {
    var tok: Token = getOneParam(parser),
        nameParts = tok.content.trim().split('.'),
        result = getSubContext(parser, 'namespace');
    if (!result.node) {
        throw new Error('Invalid sub-context for namespace directive');
    }
    return {
        node: new NamespaceNode(nameParts, result.node),
        endTok: result.endTok
    };
}
