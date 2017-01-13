# take-dsl Ideas / Work Items

Here you can see the full list of changes between each take release.

### Very Important
- Regain parity with [python version](github.com/tiffon/take) feature-set (match master)

### Quality of life

- [ ] Additional construction options
    - [ ] `TakeTemplate.fromFile(path, callback)`
    - [ ] `TakeTemplate.fromFileSync(path)`
    - [ ] `TakeTemplate.fromStr(str)`
    - [ ] From a stream
    - `?` A promise based factory?


### Ideas for syntax enhancements

- [ ] Regex queries
    - Named capture groups are awesome and available in Python... possible to meet in the middle and have some kind of support for named groups that can be implemented in JavaScript?
        - Reference: *.tmLanguage syntax for capture groups: `captures: '1': {name: function.user.take}`
- [ ] Conversions, common operations (split, strip, etc)
    - Might be a filter interface
    - Possibly the underpinning for regex support
        - Regex support through a jinja2 filter-like syntax would be more cumbersome than a more primative implementation along the lines of the CSS selector support
- [ ] Work out support for user-defined sub-routines
    - [ ] Invocation should look n feel exactly like native directives
    - [ ] Sub-routines can be defined locally, in the current template, or externally in JavaScript / Python and made available at template creation
    - [ ] Sub-routines can be imported
        - [ ] Necessitates an "environment" of importables and a "loading system" for populating the environment.
            - There should not be a "global" environment of importables. Managable environments should likely be the end-goal, but immutable importables on a per-template basis are preferable to a global environment.
            - Reference:
                - Jinja2
                    - [Loaders](http://jinja.pocoo.org/docs/dev/api/#loaders)
                    - [Environment](http://jinja.pocoo.org/docs/dev/api/#jinja2.Environment)
                    - [Template `import` tag](http://jinja.pocoo.org/docs/dev/templates/#import)
                - [Swig JavaScript Template Engine](http://paularmstrong.github.io/swig/docs/loaders/)
    - `?` Should parameters be supported?
        - `?` Would parameters break the current syntax?
    - `?` Should sub-routines merge into the return value where they're invoked or should they return a `dict`/`Object`?
        - `?` Should this be an option?
        - `?` What would the syntax for the option be?
        - `?` Would the option syntax break the current syntax?
- Expectation management
    - *Not sure how to work these in, but they seem like interesting possiblities.*
    - Contracts / assertions
        - [Cobra](http://cobra-language.com/trac/cobra/wiki/Contracts)
        - [D lang](http://dlang.org/contracts.html)
        - [contracts.ruby](http://egonschiele.github.io/contracts.ruby/)
        - An interesting [blog post](http://showmetheco.de/articles/2012/12/design-by-contract-in-perl.html)
    - Action on failure is configurable (eg skip context, message, error)
    - Message levels for outcomes (e.g. debug, info, warn, error, meltdown)
    - Metadata (failed assertions, etc) attached to the return value?
