// @flow

import { newConstantsNamespace } from './utils';


const TokenType = newConstantsNamespace({
    format: 'TokenType{ %s }',
    source: [
        'CONTEXT',
        'QUERY_STATEMENT',
        'QUERY_STATEMENT_END',
        'CSS_SELECTOR',
        'ACCESSOR_SEQUENCE',
        'INDEX_ACCESSOR',
        'TEXT_ACCESSOR',
        'OWN_TEXT_ACCESSOR',
        'ATTR_ACCESSOR',
        'FIELD_ACCESSOR',
        'DIRECTIVE_STATEMENT',
        'DIRECTIVE_STATEMENT_END',
        'DIRECTIVE_IDENTIFIER',
        'DIRECTIVE_BODY_ITEM',
        'INLINE_SUB_CONTEXT'
    ]
});

export default TokenType;
