// @flow

import { dedentOffset } from '../utils';
import { configErrorProto } from './utils';


function InvalidDirectiveError(ident: string, message: ?string, extra: any) {
    this.ident = ident;
    this.message = message;
    this.extra = extra;
    this.stack = (Error: Function).call(this, '' + this).stack;
}
configErrorProto(InvalidDirectiveError, 'InvalidDirectiveError');


InvalidDirectiveError.prototype.toString = function toString(offset: ?string): string {
    return dedentOffset(offset, `
        InvalidDirectiveError {
                ident: ${JSON.stringify(this.ident)}
              message: ${this.message}
                extra: ${JSON.stringify(this.extra)}
        }
    `);
};


export default InvalidDirectiveError;
