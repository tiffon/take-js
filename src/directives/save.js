// @flow

import { INode } from '../INode';
import ContextParser from '../parse/ContextParser';
import type { ParseResult } from '../parse/ParseResult';
import { saveToNameList } from '../utils';
import Token from '../Token';
import { getOneParam } from './utils';


class SaveNode {
    _nameParts: Array<string>;

    constructor(nameParts: Array<string>) {
        this._nameParts = nameParts;
    }

    exec(context) {
        if (context == null) {
            throw new Error('Invalid context - save INode must be exececuted on a non-null context');
        }
        saveToNameList(context.rv, this._nameParts, context.value);
    }
}


export function makeSave(parser: ContextParser): ParseResult {
    var tok = getOneParam(parser),
        nameParts = tok.content.trim().split('.');
    return {
        node: new SaveNode(nameParts),
        endTok: undefined
    };
}
