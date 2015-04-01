
var TakeTemplate = require('../').TakeTemplate,
    errors = require('../lib/errors');

var HTML_FIXTURE = [
    '<div>',
    '    <h1 id="id-on-h1">Text in h1</h1>',
    '    <nav>',
    '        <ul id="first-ul" title="nav ul title">',
    '            <li>',
    '                <a href="/local/a">first nav item</a>',
    '            </li>',
    '            <li>',
    '                <a href="/local/b">second nav item</a>',
    '            </li>',
    '        </ul>',
    '    </nav>',
    '    <section>',
    '        <p>some description</p>',
    '        <ul id="second-ul" title="content ul title">',
    '            <li>',
    '                <a href="http://ext.com/a">first content link</a>',
    '            </li>',
    '            <li>',
    '                <a href="http://ext.com/b">second content link</a>',
    '            </li>',
    '        </ul>',
    '    </section>',
    '</div>',
].join('\n');


describe('TakeTemplate', function() {

    it('compiles a basic template', function() {
        var tt = new TakeTemplate([
            '$ h1 | text',
            '   save: value'
        ]);
        tt.should.be.instanceOf(TakeTemplate);
    });

    describe('saving text from basic queries', function() {

        it('saves text from a CSS selector', function() {
            var tt = new TakeTemplate([
                    '$ h1 | text',
                    '   save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.should.eql({value: 'Text in h1'});
        });

        it('save text from an index accessor', function() {
            var tt = new TakeTemplate([
                    '$ a | 0 text',
                    '   save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.should.eql({value: 'first nav item'});
        });

        it('save text from a negative index accessor', function() {
            var tt = new TakeTemplate([
                    '$ a | -1 text',
                    '   save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.should.eql({value: 'second content link'});
        });

        it('save an empty string from an absent CSS selector', function() {
            var tt = new TakeTemplate([
                    '$ i | text',
                    '   save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.should.eql({value: ''});
        });

        it('save an empty string from an index accessor on an absent CSS selector', function() {
            var tt = new TakeTemplate([
                    '$ i | 1 text',
                    '   save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.should.eql({value: ''});
        });

        it('save an empty string from a negative index accessor on an absent CSS selector', function() {
            var tt = new TakeTemplate([
                    '$ i | -1 text',
                    '   save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.should.eql({value: ''});
        });
    });

    describe('saves attributes correctly', function() {

        it('saves an existing attribute', function() {
            var tt = new TakeTemplate([
                    '$ h1 | [id]',
                    '   save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.should.eql({value: 'id-on-h1'});
        });

        it('saves an absent attribute as `undefined`', function() {
            var tt = new TakeTemplate([
                    '$ h1 | [mia]',
                    '   save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.should.eql({value: undefined});
        });
    });

    describe('enters and exits sub-contexts correctly', function() {

        it('saves from a sub-context correctly', function() {
            var tt = new TakeTemplate([
                    '$ section',
                    '   $ ul | [id]',
                    '      save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.should.eql({value: 'second-ul'});
        });

        it('correctly limits an index accessor in a sub-context', function() {
            var tt = new TakeTemplate([
                    '$ section',
                    '   $ ul | 1 [id]',
                    '      save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.should.eql({value: undefined});
        });

        it('exists a sub-context correctly', function() {
            var tt = new TakeTemplate([
                    '$ nav',
                    '    $ ul | 0 [id]',
                    '        save: sub_ctx_value',
                    '$ p | text',
                    '    save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.should.eql({
                sub_ctx_value: 'first-ul',
                value: 'some description'
            });
        });
    });

    describe('comments are handled correctly', function() {

        it('comments do not affect a template', function() {
            var tt = new TakeTemplate([
                    '# should have no effect',
                    '$ nav',
                    '    # should have no effect',
                    '    $ ul | 0 [id]',
                    '    # should have no effect',
                    '# should have no effect',
                    '        save: sub_ctx_value',
                    '# should have no effect',
                    '$ p | text',
                    '    save: value',
                    '    # should have no effect'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.should.eql({
                sub_ctx_value: 'first-ul',
                value: 'some description'
            });
        });

        it('CSS selectors with ID selectors are not considered comments', function() {
            var tt = new TakeTemplate([
                    '$ #id-on-h1 | [id]',
                    '    save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.should.eql({value: 'id-on-h1'});
        });
    });

    describe('the save each directirve', function() {

        it('saves an Array of values correctly', function() {
            var tt = new TakeTemplate([
                    '$ nav',
                    '    $ a',
                    '        save each: nav',
                    '            | [href]',
                    '                save: url',
                    '            | text',
                    '                save: text'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.should.eql({
                nav: [{
                        url: '/local/a',
                        text: 'first nav item'
                    },{
                        url: '/local/b',
                        text: 'second nav item'
                    }
                ]
            });
        });
    });

    describe('saves deep identifiers correctly', function() {

        it('the `save` directive saves nested objects correctly', function() {
            var tt = new TakeTemplate([
                    '$ h1 | [id]',
                    '   save: value.title_id'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.should.eql({
                value: {
                    title_id: 'id-on-h1'
                }
            });
        });

        it('the `save each` directive saves nested objects correctly', function() {
            var tt = new TakeTemplate([
                    '$ nav',
                    '    $ a',
                    '        save each: nav.items',
                    '            | [href]',
                    '                save: item.url',
                    '            | text',
                    '                save: item.text'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.should.eql({
                nav: {
                    items: [{
                            item: {
                                url: '/local/a',
                                text: 'first nav item'
                            }
                        },{
                            item: {
                                url: '/local/b',
                                text: 'second nav item'
                            }
                        }
                    ]
                }
            });
        });
    });

    describe('handles `baseUrl` correctly', function() {

        it.skip('the `TakeTemplate#take()` method handles baseUrl correctly', function() {
            var tt = new TakeTemplate([
                    '$ a | 0 [href]',
                    '    save: local',
                    '$ a | -1 [href]',
                    '    save: ext'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.should.eql({
                local: '/local/a',
                ext: 'http://ext.com/b'
            });
            data = tt.take(HTML_FIXTURE, {baseUrl: 'http://www.example.com'});
            data.should.eql({
                local: 'http://www.example.com/local/a',
                ext: 'http://ext.com/b'
            });
        });

        it.skip('the `TakeTemplate()` constructor handles baseUrl correctly', function() {
            var tt = new TakeTemplate([
                    '$ a | 0 [href]',
                    '    save: local',
                    '$ a | -1 [href]',
                    '    save: ext'
                ]),
                data = tt.take(HTML_FIXTURE, {baseUrl: 'http://www.example.com'});
            data.should.eql({
                local: 'http://www.example.com/local/a',
                ext: 'http://ext.com/b'
            });
        });
    });

    describe('throws under the right circumstances', function() {

        it('invalid directive statements cause a ScanError', function() {
            (function() {
                var tt = new TakeTemplate([
                    '$ h1 | [href]',
                    '    save fail'
                ]);
            }).should.throw(errors.ScanError);
        });

        it('invalid directive IDs cause an InvalidDirectiveError', function() {
            (function() {
                var tt = new TakeTemplate([
                    '$ h1 | [href]',
                    '    hm: fail'
                ]);
            }).should.throw(errors.InvalidDirectiveError);
        });

        it('invalid queries cause a ScanError', function() {
            (function() {
                var tt = new TakeTemplate([
                    '. h1 | [href]',
                    '    hm: fail'
                ]);
            }).should.throw(errors.ScanError);
        });

        it('invalid accessor sequences cause an UnexpectedTokenError', function() {
            (function() {
                var tt = new TakeTemplate([
                    '$ h1 | [href] text',
                    '    save: fail'
                ]);
            }).should.throw(errors.UnexpectedTokenError);
        });

        it('a `save each` directive without a sub-context causes a TakeSyntaxError', function() {
            (function() {
                var tt = new TakeTemplate([
                    '$ li',
                    '    save each: items',
                    '    $ h1 | text',
                    '       save: fail'
                ]);
            }).should.throw(errors.TakeSyntaxError);
        });
    });
});
