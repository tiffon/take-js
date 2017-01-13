# take-dsl Changelog


Here you can see the full list of changes between each take release.


## Version 0.2.0

Unreleased.

- Added the "def" directive to define sub-routines.
- Added the "namespace" directive, with "+" alias.
- [ ] Added the "merge" directive, with alias ">>".
- [ ] Added the field accessor.
- [ ] Added the "own_text" accessor.
- [ ] Added the "shrink" directive.
- Added comma line-continuations in directive parameter lists.
- Inline sub-contexts changed to support sub-contexts of their own (instead of having the max-depth).
- [ ] "reddit_inline_saves.take" changed to use namespaces.

- Allow directives that don't require parameters.
- Directives also end on ";".
- Remove underscores on `ContextParser` method names that are used by directives and `query.parse`.
- Created a `DIRECTIVE_STATEMENT_END` token type.
- Directives are now looked up by name and are external functions with a defined signature.
- Adjusted the scanner to accept a wider range of directive names.


## Version 0.1.0

April 8 2015.

- Readme updated.
- Inline sub-contexts.
- `:` alias for `save:`.
- Tests are run via `npm test`.
- Reorganized tests.
- Moved the reddit sample out of `./lib` into it's own `./sample` folder.
- Moved the reddit take template to a seperate file.
- Created a second version of the reddit template using inline sub-contexts.
- The sample compares the output from the two different templates.
- Use webpack + jQuery to create a browser build (jQuery is an external dependency).
- Created an extremely basic demo page in `./web_dist` run via `npm start`.
- AUTHORS.md added.
- CHANGES.md added.
- TODO.md added.


## Version 0.0.1

Released on April 1 2015.

- Readme update.


## Version 0.0.0

Released on March 31 2015.

First public release.
