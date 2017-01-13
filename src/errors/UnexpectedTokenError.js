// @flow

import Token from '../Token';
import { dedentOffset } from '../utils';
import { configErrorProto } from './utils';


function UnexpectedTokenError(found: string, expected: string | Array<string>, token: Token, message: ?string) {
    this.found = found;
    this.expected = expected;
    this.token = token;
    this.message = message;
    this.stack = (Error: Function).call(this, '' + this).stack;
}
configErrorProto(UnexpectedTokenError, 'UnexpectedTokenError');


UnexpectedTokenError.prototype.toString = function toString(offset: ?string): string {
    return dedentOffset(offset, `
            UnexpectedTokenError {
                    found: ${this.found}
                 expected: ${this.expected}
                  message: ${this.message}
                    token: ${this.token
                                ? '\n' + this.token.toString('                            ')
                                : this.token}
            }
    `);
};


export default UnexpectedTokenError;
