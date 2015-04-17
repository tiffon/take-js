var fs = require('fs'),
    cheerio = require('cheerio');

var TakeTemplate = require('../').TakeTemplate,
    errors = require('../lib/errors');

var html_fixture = fs.readFileSync(__dirname + '/doc.html', {encoding: 'utf8'}),
    $doc = cheerio(html_fixture);


describe('TakeTemplate', function() {

    describe('basic functionality', function() {


        it('a basic template compiles', function() {
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
                data = tt.take(html_fixture);
            data.value.html().should.eql($doc.html());
        });


        it('saves with ":" alias', function() {
            var tt = new TakeTemplate([
                    ': value'
                ]),
                data = tt.take(html_fixture);
            data.value.html().should.eql($doc.html());
        });


        it('saves nested identifiers', function() {
            var tt = new TakeTemplate([
                    'save: parent.value'
                ]),
                data = tt.take(html_fixture);
            data.parent.value.html().should.eql($doc.html());
        });


        it('saves nested identifiers with the ":" alias', function() {
            var tt = new TakeTemplate([
                    ': parent.value'
                ]),
                data = tt.take(html_fixture);
            data.parent.value.html().should.eql($doc.html());
        });


        it('saves a css query', function() {
            var tt = new TakeTemplate([
                    '$ h1',
                    '   save: value'
                ]),
                data = tt.take(html_fixture);
            data.value.html().should.eql($doc.find('h1').html());
        });


        it('saves a css text query', function() {
            var tt = new TakeTemplate([
                    '$ h1 | text',
                    '   save: value'
                ]),
                data = tt.take(html_fixture);
            data.value.should.eql('Text in h1');
        });


        it('saves a css index query', function() {
            var tt = new TakeTemplate([
                    '$ a | 0',
                    '   save: value'
                ]),
                data = tt.take(html_fixture);
            data.value.html().should.eql($doc.find('a').eq(0).html());
        });


        it('saves a css index text query', function() {
            var tt = new TakeTemplate([
                    '$ a | 0 text',
                    '   save: value'
                ]),
                data = tt.take(html_fixture);
            data.value.should.eql('first nav item');
        });


        it('saves absent indexes as ""', function() {
            var tt = new TakeTemplate([
                    '$ notpresent | 0 text',
                    '   save: value'
                ]),
                data = tt.take(html_fixture);
            data.value.should.eql('');
        });


        it('saves a css negative index query', function() {
            var tt = new TakeTemplate([
                    '$ a | -1',
                    '   save: value'
                ]),
                data = tt.take(html_fixture);
            data.value.html().should.eql($doc.find('a').eq(-1).html());
        });


        it('saves a css negative index text query', function() {
            var tt = new TakeTemplate([
                    '$ a | -1 text',
                    '   save: value'
                ]),
                data = tt.take(html_fixture);
            data.value.should.eql('second content link');
        });


        it('saves absent negative indexes as ""', function() {
            var tt = new TakeTemplate([
                    '$ notpresent | -1 text',
                    '   save: value'
                ]),
                data = tt.take(html_fixture);
            data.value.should.eql('');
        });


        it('saves a query to a nested identifier', function() {
            var tt = new TakeTemplate([
                    '$ h1 | text',
                    '   save: parent.value'
                ]),
                data = tt.take(html_fixture);
            data.parent.value.should.eql('Text in h1');
        });


        describe('saves attributes correctly', function() {

            it('saves an existing attribute', function() {
                var tt = new TakeTemplate([
                        '$ h1 | [id]',
                        '   save: value'
                    ]),
                    data = tt.take(html_fixture);
                data.value.should.eql('id-on-h1');
            });

            it('saves an absent attribute as `undefined`', function() {
                var tt = new TakeTemplate([
                        '$ h1 | [mia]',
                        '   save: value'
                    ]),
                    data = tt.take(html_fixture);
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
                    data = tt.take(html_fixture);
                data.value.should.eql('second-ul');
            });

            it('saves from a sub-context correctly when using the ":" alias', function() {
                var tt = new TakeTemplate([
                        '$ section',
                        '   $ ul | [id]',
                        '      : value'
                    ]),
                    data = tt.take(html_fixture);
                data.should.eql({value: 'second-ul'});
            });

            it('correctly limits an index accessor in a sub-context', function() {
                var tt = new TakeTemplate([
                        '$ section',
                        '   $ ul | 1 [id]',
                        '      save: value'
                    ]),
                    data = tt.take(html_fixture);
                data.should.eql({value: undefined});
            });

            it('correctly limits an index accessor in a sub-context when using the ":" alias', function() {
                var tt = new TakeTemplate([
                        '$ section',
                        '   $ ul | 1 [id]',
                        '      : value'
                    ]),
                    data = tt.take(html_fixture);
                data.should.eql({value: undefined});
            });

            it('exits a sub-context correctly', function() {
                var tt = new TakeTemplate([
                        '$ nav',
                        '    $ ul | 0 [id]',
                        '        save: sub_ctx_value',
                        '$ p | text',
                        '    save: value'
                    ]),
                    data = tt.take(html_fixture);
                data.should.eql({
                    sub_ctx_value: 'first-ul',
                    value: 'some description'
                });
            });

            it('exits a sub-context correctly when using the ":" alias', function() {
                var tt = new TakeTemplate([
                        '$ nav',
                        '    $ ul | 0 [id]',
                        '        : sub_ctx_value',
                        '$ p | text',
                        '    : value'
                    ]),
                    data = tt.take(html_fixture);
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
                    data = tt.take(html_fixture);
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
                    data = tt.take(html_fixture);
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
                    data = tt.take(html_fixture);
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
                    data = tt.take(html_fixture);
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

            // skipped because this functality is specific to PyQuery
            it.skip('the `TakeTemplate#take()` method handles baseUrl correctly', function() {
            });

            // skipped because this functality is specific to PyQuery
            it.skip('the `TakeTemplate()` constructor handles baseUrl correctly', function() {
            });
        });


        describe('throws under the right circumstances', function() {

            it('invalid directive statements cause a ScanError', function() {
                (function() {
                    var tt = new TakeTemplate([
                        '$ h1 | [href]',
                        '    save fail'
                    ]);
                }).should.throw(errors.InvalidDirectiveError);
            });

            it('invalid directive IDs cause an InvalidDirectiveError', function() {
                (function() {
                    var tt = new TakeTemplate([
                        '$ h1 | [href]',
                        '    hm: fail'
                    ]);
                }).should.throw(errors.InvalidDirectiveError);
            });

            it('invalid queries cause an InvalidDirectiveError', function() {
                (function() {
                    var tt = new TakeTemplate([
                        '.h1 | [href]',
                        '    hm: fail'
                    ]);
                }).should.throw(errors.InvalidDirectiveError);
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


        describe('saving via inline sub-contexts', function() {

            it('saves a css query', function() {
                var tt = new TakeTemplate([
                        '$ h1 | 0 text ; save: value'
                    ]),
                    data = tt.take(html_fixture);
                data.value.should.eql('Text in h1');
            });

            it('saves a css query to a nested id via the ":" alias', function() {
                var tt = new TakeTemplate([
                        '$ h1 | 0 text ; : parent.value'
                    ]),
                    data = tt.take(html_fixture);
                data.parent.value.should.eql('Text in h1');
            });

            it('saves an accessor query in a sub-context', function() {
                var tt = new TakeTemplate([
                        '$ h1',
                        '   | 0 text ;  : value'
                    ]),
                    data = tt.take(html_fixture);
                data.value.should.eql('Text in h1');
            });

            it('saves from multiple inline sub-contexts', function() {
                var tt = new TakeTemplate([
                        '$ h1 ; | 0 ; | text ; : value'
                    ]),
                    data = tt.take(html_fixture);
                data.value.should.eql('Text in h1');
            });

            it('saves from sub-context of an inline sub-context', function() {
                var tt = new TakeTemplate([
                        '$ h1 ; | 0 ; | text',
                        '    : value'
                    ]),
                    data = tt.take(html_fixture);
                data.value.should.eql('Text in h1');
            });

            it('exits a sub-context of an inline sub-context correctly', function() {
                var tt = new TakeTemplate([
                        '$ h1 ; | 0 ; | text',
                        '    : h1_value',
                        '$ p | text',
                        '    : p_value'
                    ]),
                    data = tt.take(html_fixture);
                data.should.eql({
                    h1_value: 'Text in h1',
                    p_value: 'some description'
                });

            });
        });


        describe('field accessor', function() {
            it.skip('TODO: field accessor tests', function() {
            });
        });
    });
});
