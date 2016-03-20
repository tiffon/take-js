// @flow

import { INode } from '../INode';
import Token from '../Token';


export type ParseResult = {
    node: ?INode;
    endTok: ?Token;
}
