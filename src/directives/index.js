
import { makeDefSubroutine } from './def';
import { makeNamespace } from './namespace';
import { makeSave } from './save';
import { makeSaveEach } from './save-each';


const directives = Object.freeze({
    save: makeSave,
    ':': makeSave,
    'save each': makeSaveEach,
    def: makeDefSubroutine,
    namespace: makeNamespace,
    '+': makeNamespace
});

export default directives;
