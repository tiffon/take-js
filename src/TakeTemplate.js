// @flow

import jqProvider from './jq-provider';
import parse from './parse';


export default class TakeTemplate {

    node: Object;

    constructor(source: string | Array<string>) {
        let lines;
        if (typeof source === 'string') {
            lines = source.split('\n');
        } else if (Array.isArray(source)) {
            lines = source;
        } else {
            throw new Error('Invalid template source');
        }
        this.node = parse(lines);
    }

    take(doc: string): Object {
        var $doc = jqProvider(doc),
            rv = {};
        this.node.exec(undefined, rv, $doc, $doc);
        return rv;
    }
}
