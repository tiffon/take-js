
var spaces = require('./utils').charRepeater(' ');


function ScanError(message, line, lineNum, pos, extra) {
    this.message = message;
    this.line = line;
    this.lineNum = lineNum;
    this.pos = pos;
    this.extra = extra;
    this.stack = Error.call(this, '' + this).stack;
}
exports.ScanError = ScanError;

ScanError.prototype = Object.create(Error.prototype);
ScanError.prototype.constructor = ScanError;
ScanError.prototype.name = 'ScanError';

ScanError.prototype.toString = function toString(offset) {
    var parts = [
            'ScanError: {',
            '      message: ' + this.message,
            '         line: ' + JSON.stringify(this.line),
            '                ' + spaces(this.pos) + '^',
            '     line num: ' + this.lineNum,
            '          pos: ' + this.pos,
            '        extra: ' + JSON.stringify(this.extra),
            '}'
        ];
    offset = offset || '';
    return offset + parts.join('\n' + offset);
};


function UnexpectedTokenError(found, expected, token, message) {
    this.found = found;
    this.expected = expected;
    this.token = token;
    this.message = message;
    this.stack = Error.call(this, '' + this).stack;
}
exports.UnexpectedTokenError = UnexpectedTokenError;

UnexpectedTokenError.prototype = Object.create(Error.prototype);
UnexpectedTokenError.prototype.constructor = UnexpectedTokenError;
UnexpectedTokenError.prototype.name = 'UnexpectedTokenError';

UnexpectedTokenError.prototype.toString = function toString(offset) {
    var parts = [
            'UnexpectedTokenError: {',
            '        found: ' + this.found,
            '     expected: ' + this.expected,
            '      message: ' + this.message,
            '        token: ' + (this.token
                                    ? '\n' + this.token.toString('               ')
                                    : this.token),
            '}'
        ];
    offset = offset || '';
    return offset + parts.join('\n' + offset);
};


function InvalidDirectiveError(ident, message, extra) {
    this.ident = ident;
    this.message = message;
    this.extra = extra;
    this.stack = Error.call(this, '' + this).stack;
}
exports.InvalidDirectiveError = InvalidDirectiveError;

InvalidDirectiveError.prototype = Object.create(Error.prototype);
InvalidDirectiveError.prototype.constructor = InvalidDirectiveError;
InvalidDirectiveError.prototype.name = 'InvalidDirectiveError';

InvalidDirectiveError.prototype.toString = function toString(offset) {
    var parts = [
            'InvalidDirectiveError: {',
            '        ident: ' + JSON.stringify(this.ident),
            '      message: ' + this.message,
            '        extra: ' + this.extra,
            '}'
        ];
    offset = offset || '';
    return offset + parts.join('\n' + offset);
};


function TakeSyntaxError(message, extra) {
    this.message = message;
    this.extra = extra;
    this.stack = Error.call(this, '' + this).stack;
}
exports.TakeSyntaxError = TakeSyntaxError;

TakeSyntaxError.prototype = Object.create(Error.prototype);
TakeSyntaxError.prototype.constructor = TakeSyntaxError;
TakeSyntaxError.prototype.name = 'TakeSyntaxError';

TakeSyntaxError.prototype.toString = function toString(offset) {
    var parts = [
            'TakeSyntaxError: {',
            '      message: ' + this.message,
            '        extra: ' + this.extra,
            '}'
        ];
    offset = offset || '';
    return offset + parts.join('\n' + offset);
};
