var cheerio = require('cheerio');

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

var $DOC = cheerio(HTML_FIXTURE);


describe('TakeTemplate', function() {

    describe('base functionality', function() {


        it('compiles a basic template', function() {
            var tt = new TakeTemplate([
                '$ h1 | text',
                '   save: value'
            ]);
            tt.should.be.instanceOf(TakeTemplate);
        });


        it('saves', function() {
            var tt = new TakeTemplate([
                    'save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.value.html().should.eql($DOC.html());
        });


        it('saves with ":" alias', function() {
            var tt = new TakeTemplate([
                    ': value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.value.html().should.eql($DOC.html());
        });


        it('saves nested identifiers', function() {
            var tt = new TakeTemplate([
                    'save: parent.value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.parent.value.html().should.eql($DOC.html());
        });


        it('saves nested identifiers with the ":" alias', function() {
            var tt = new TakeTemplate([
                    ': parent.value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.parent.value.html().should.eql($DOC.html());
        });


        it('saves a css query', function() {
            var tt = new TakeTemplate([
                    '$ h1',
                    '   save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.value.html().should.eql($DOC.find('h1').html());
        });


        it('saves a css test query', function() {
            var tt = new TakeTemplate([
                    '$ h1 | text',
                    '   save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.value.should.eql($DOC.find('h1').text());
        });


        it('saves a css index query', function() {
            var tt = new TakeTemplate([
                    '$ a | 0',
                    '   save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.value.html().should.eql($DOC.find('a').eq(0).html());
        });


        it('saves a css negative index query', function() {
            var tt = new TakeTemplate([
                    '$ a | -1',
                    '   save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.value.html().should.eql($DOC.find('a').eq(-1).html());
        });


        it('saves a css index text query', function() {
            var tt = new TakeTemplate([
                    '$ a | 0 text',
                    '   save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.value.should.eql($DOC.find('a').eq(0).text());
        });


        it('saves a css negative index text query', function() {
            var tt = new TakeTemplate([
                    '$ a | -1 text',
                    '   save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.value.should.eql($DOC.find('a').eq(-1).text());
        });


        it('saves absent indexes as empty strings', function() {
            var tt = new TakeTemplate([
                    '$ notpresent | 0 text',
                    '   save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.value.should.eql('');
        });


        it('saves absent negative indexes as empty strings', function() {
            var tt = new TakeTemplate([
                    '$ notpresent | -1 text',
                    '   save: value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.value.should.eql('');
        });


        it('saves a query to a nested identifier', function() {
            var tt = new TakeTemplate([
                    '$ h1 | text',
                    '   save: parent.value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.parent.value.should.eql('Text in h1');
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

            it('saves from a sub-context correctly when using the ":" alias', function() {
                var tt = new TakeTemplate([
                        '$ section',
                        '   $ ul | [id]',
                        '      : value'
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

            it('correctly limits an index accessor in a sub-context when using the ":" alias', function() {
                var tt = new TakeTemplate([
                        '$ section',
                        '   $ ul | 1 [id]',
                        '      : value'
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

            it('exists a sub-context correctly when using the ":" alias', function() {
                var tt = new TakeTemplate([
                        '$ nav',
                        '    $ ul | 0 [id]',
                        '        : sub_ctx_value',
                        '$ p | text',
                        '    : value'
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
    });


    describe('handles `baseUrl` correctly', function() {

        // skipped because this functality is specific to PyQuery
        it.skip('the `TakeTemplate#take()` method handles baseUrl correctly', function() {
        });

        // skipped because this functality is specific to PyQuery
        it.skip('the `TakeTemplate()` constructor handles baseUrl correctly', function() {
        });
    });


    describe('saving via inline sub-contexts', function() {

        it('saves a css query', function() {
            var tt = new TakeTemplate([
                    '$ h1 ; save: value'
                ]),
                data = tt.take(HTML_FIXTURE),
                expect = $DOC.find('h1').html();
            data.value.html().should.eql(expect);
        });

        it('saves a css query to a nested identifier via the ":" alias', function() {
            var tt = new TakeTemplate([
                    '$ h1 ; : parent.value'
                ]),
                data = tt.take(HTML_FIXTURE),
                expect = $DOC.find('h1').html();
            data.parent.value.html().should.eql(expect);
        });

        it('saves an index query via the ":" alias identically to a non-inline save', function() {
            var tt = new TakeTemplate([
                    '$ a',
                    '   | 0 ;       : value',
                    '   | 0',
                    '       save    : again',
                ]),
                data = tt.take(HTML_FIXTURE),
                expect = $DOC.find('a').eq(0).html();
            data.value.html().should.eql(expect);
            data.again.html().should.eql(expect);
        });

        it('saves an index text query to a nested identifier', function() {
            var tt = new TakeTemplate([
                    '$ a | 0 text ; save: parent.value'
                ]),
                data = tt.take(HTML_FIXTURE),
                expect = $DOC.find('a').eq(0).text();
            data.parent.value.should.eql(expect);
        });

        it('saves an attribute query without disturbing surounding contexts', function() {
            var tt = new TakeTemplate([
                    '$ ul | 0',
                    '   | [title]',
                    '       save: title_value',
                    '   | [id] ; : id_value',
                    '$ p | text',
                    '    : p_value'
                ]),
                data = tt.take(HTML_FIXTURE);
            data.should.eql({
                id_value: 'first-ul',
                title_value: 'nav ul title',
                p_value: 'some description'
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
