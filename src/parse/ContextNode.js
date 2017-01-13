// @flow

import { INode } from '../INode';


export default class ContextNode {
    _depth: number;
    _nodes: Array<INode>;
    rv: any;
    value: any;
    lastValue: any;

    constructor(depth: number, nodes: Array<INode>) {
        this._depth = depth;
        this._nodes = nodes;
        this.rv = undefined;
        this.value = undefined;
        this.lastValue = undefined;
    }

    exec(context?: Object, rv?: Object, value: any, lastValue: any) {
        var len = this._nodes.length,
            i = 0;
        this.rv = rv != null ? rv : context && context.rv;
        // value in a sub-context is derived from the parent context's lastValue
        this.value = value != null ? value : context && context.lastValue;
        this.lastValue = lastValue != null ? lastValue : this.value;
        for (; i < len; i++) {
            this._nodes[i].exec(this);
        }
    }
}
