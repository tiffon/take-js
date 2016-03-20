// @flow

export interface INode {
    exec(context?: Object, rv?: Object, value: any, lastValue: any): void;
}
