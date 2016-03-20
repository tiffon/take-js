// @flow

import { dedentOffset } from '../utils';
import { configErrorProto } from './utils';


function TakeSyntaxError(message: string, extra: ?any) {
    this.message = message;
    this.extra = extra;
    this.stack = (Error: Function).call(this, '' + this).stack;
}
configErrorProto(TakeSyntaxError, 'TakeSyntaxError');


TakeSyntaxError.prototype.toString = function toString(offset: string): string {
    return dedentOffset(offset, `
            TakeSyntaxError {
                  message: ${this.message}
                    extra: ${this.extra}
            }
    `);
};


export default TakeSyntaxError;
