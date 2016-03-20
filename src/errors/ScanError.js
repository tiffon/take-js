// @flow

import { charRepeater, dedentOffset } from '../utils';
import { configErrorProto } from './utils';


const spaces = charRepeater(' ');


function ScanError(message: ?string, line: ?string, lineNum: number, pos: number, extra: ?any) {
    this.message = message;
    this.line = line;
    this.lineNum = lineNum;
    this.pos = pos;
    this.extra = extra;
    this.stack = (Error: Function).call(this, '' + this).stack;
}
configErrorProto(ScanError, 'ScanError');


ScanError.prototype.toString = function toString(offset: ?string): string {
    return dedentOffset(offset, `
        ScanError {
              message: ${this.message}
                 line: ${JSON.stringify(this.line)}
                       ${spaces(this.pos)} ^
             line num: ${this.lineNum}
                  pos: ${this.pos}
                extra: ${JSON.stringify(this.extra)}
        }
    `);
};


export default ScanError;
