
import UnexpectedTokenError from '../errors/UnexpectedTokenError';
import Scanner from '../scanner';
import TokenType from '../TokenType';
import ContextParser from './ContextParser';


export default function parse(lines) {
    var scanner = new Scanner(lines),
        tok = scanner.getToken(),
        ctx,
        result;
    if (tok.type !== TokenType.CONTEXT) {
        throw new UnexpectedTokenError(tok.type, TokenType.CONTEXT, 'Leading context token not found.');
    }
    ctx = new ContextParser(tok.end, scanner.getToken.bind(scanner));
    result = ctx.parse();
    ctx.destroy();
    if (result.endTok) {
        throw new UnexpectedTokenError(tok, 'EOF');
    }
    return result.node;
}
