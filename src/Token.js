// @flow

import { charRepeater, dedentOffset } from './utils';


const
    spaces = charRepeater(' '),
    carrots = charRepeater('^');


export default class Token {

    type: string;
    content: string;
    line: string;
    lineNum: number;
    start: number;
    end: number;

    constructor(type: string, content: string, line: string, lineNum: number, start: number, end: number) {
        this.type = type;
        this.content = content;
        this.line = line;
        this.lineNum = lineNum;
        this.start = start;
        this.end = end;
    }

    toString(offset : string) : string {
        return dedentOffset(offset, `
            Token {
                     type: ${this.type}
                  content: ${JSON.stringify(this.content)}
                 line num: ${this.lineNum}
               start, end: ${this.start}, ${this.end}
                     line: ${JSON.stringify(this.line)}
                            ${spaces(this.start) + carrots(this.end - this.start)}
            }
        `);
    }
}
