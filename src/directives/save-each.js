// @flow

import { INode } from '../INode';
import ContextParser from '../parse/ContextParser';
import type { ParseResult } from '../parse/ParseResult';
import Token from '../Token';
import { saveToNameList } from '../utils';
import { getOneParam, getSubContext } from './utils';


class SaveEachNode {
    _nameParts: Array<string>;
    _subContext: INode;

    constructor(nameParts: Array<string>, subContextNode: INode) {
        this._nameParts = nameParts;
        this._subContext = subContextNode;
    }

    exec(context?: Object) {
        if (context == null) {
            throw new Error('context must not be `== null` for "save each" directive');
        }
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
    }
}


export function makeSaveEach(parser: ContextParser): ParseResult {
    var tok = getOneParam(parser),
        nameParts = tok.content.trim().split('.'),
        result = getSubContext(parser, 'save each');
    if (!result.node) {
        throw new Error('Invalid sub-context for save-each directive');
    }
    return {
        node: new SaveEachNode(nameParts, result.node),
        endTok: result.endTok
    };
}
