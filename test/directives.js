var fs = require('fs'),
    cheerio = require('cheerio');

var TakeTemplate = require('../').TakeTemplate,
    errors = require('../lib/errors');

var html_fixture = fs.readFileSync(__dirname + '/doc.html', {encoding: 'utf8'}),
    $doc = cheerio(html_fixture);


describe('directives', function() {

    describe('def directive', function() {


        it('executes a sub-context', function() {
            var tt = new TakeTemplate([
                    'def: simple',
                    '   $ h1 | 0 text',
                    '       save: saved',
                    'simple',
                    '   save: result',
                ]),
                data = tt.take(html_fixture);
            data.result.saved.should.eql('Text in h1');
        });


        it('can be invoked in an inline statement', function() {
            var tt = new TakeTemplate([
                    'def: simple',
                    '   $ h1 | 0 text',
                    '       save: saved',
                    'simple ; save: result'
                ]),
                data = tt.take(html_fixture);
            data.result.saved.should.eql('Text in h1');
        });


        it('can have spaces in their names', function() {
            var tt = new TakeTemplate([
                    'def: my simple defn',
                    '   $ h1 | 0 text',
                    '       save: saved',
                    'my simple defn ; save: result'
                ]),
                data = tt.take(html_fixture);
            data.result.saved.should.eql('Text in h1');
        });


        it('can use a save-each directive', function() {
            var expect = {
                    first: {
                        items: [
                            {url: '/local/a',
                             desc: 'first nav item'},
                            {url: '/local/b',
                             desc: 'second nav item'}
                        ]
                    },
                    second: {
                        items: [
                            {url: 'http://ext.com/a',
                             desc: 'first content link'},
                            {url: 'http://ext.com/b',
                             desc: 'second content link'}
                        ]
                    }
                },
                tt,
                data;
            tt = new TakeTemplate([
                'def: simple',
                '    $ li a',
                '        save each               : items',
                '            | [href] ;              : url',
                '            | text ;                : desc',
                '$ #first-ul',
                '    simple ;                : first',
                '$ #second-ul',
                '    simple ;                : second'
            ]);
            data = tt.take(html_fixture);
            data.should.eql(expect);
            tt = new TakeTemplate([
                'def: simple',
                '    $ li a',
                '        save each               : items',
                '            | [href] ;              : url',
                '            | text ;                : desc',
                '$ #first-ul ; simple ;      : first',
                '$ #second-ul ; simple ;     : second'
            ]);
            data = tt.take(html_fixture);
            data.should.eql(expect);
        });


        it('should be locally scoped', function() {
            (function() {
                var tt = new TakeTemplate([
                        '$ h1',
                        '   def: my simple defn',
                        '       $ h1 | 0 text',
                        '           save: saved',
                        'simple ; save: should_error'
                    ]);
            }).should.throw(errors.InvalidDirectiveError);
        });


        it('should shadow', function() {
            var tt = new TakeTemplate([
                    'def: simple',
                    '    $ a | 0 text',
                    '        save: value',
                    '$ ul',
                    '    def: simple',
                    '        $ a | 1 text',
                    '            save: value',
                    '    simple ;                    : shadowed',
                    'simple ;                        : parent_scope',
                ]),
                data = tt.take(html_fixture);
            data.parent_scope.value.should.eql('first nav item');
            data.shadowed.value.should.eql('second nav item');
        });
    });

    describe('namespace directives', function() {


        it('save into a child object', function() {
            var tt = new TakeTemplate([
                    'namespace               : parent',
                    '    $ h1 | 0 text ;         : value'
                ]),
                data = tt.take(html_fixture);
            data.parent.value.should.eql('Text in h1');
        });


        it('has "+" as an alias', function() {
            var tt = new TakeTemplate([
                    '+                       : parent',
                    '    $ h1 | 0 text ;         : value'
                ]),
                data = tt.take(html_fixture);
            data.parent.value.should.eql('Text in h1');
        });


        it('can be deeply nested (namespace inception)', function() {
            var tt = new TakeTemplate([
                    '+                       : p0',
                    '    +                       : p1',
                    '        +                       : p2',
                    '            +                       : p3',
                    '                +                       : p4',
                    '                    $ h1 | 0 text ;         : value'
                ]),
                data = tt.take(html_fixture);
            data.p0.p1.p2.p3.p4.value.should.eql('Text in h1');
        });


        it('nest and exit correctly', function() {
            var tt = new TakeTemplate([
                    '+                               : p0a',
                    '    namespace                       : p1a',
                    '        $ a | 0 text ;                  : first_li',
                    '    +                               : p1b',
                    '        $ a | 1 text ;                  : second_li',
                    'namespace                       : p0b',
                    '    $ a | 2 text ;                  : third_li'
                ]),
                data = tt.take(html_fixture);
            data.p0a.p1a.first_li.should.eql('first nav item');
            data.p0a.p1b.second_li.should.eql('second nav item');
            data.p0b.third_li.should.eql('first content link');
        });


        it('can be defined inline', function() {
            var tt = new TakeTemplate([
                    '$ h1 ; +                            : parent',
                    '    | 0 text ;                          : value',
                ]),
                data = tt.take(html_fixture);
            data.parent.value.should.eql('Text in h1');
        });


        it('nest and exit correctly when applied inline', function() {
            var tt = new TakeTemplate([
                    '$ a ; +                         : p0a',
                    '    | 0 ; +                         : p1a',
                    '        | text ;                        : first_li',
                    '    | 1 text ;                      : second_li',
                    '+                               : p0b',
                    '    $ h1 | 0 text ; +               : p1b',
                    '                                        : h1'
                ]),
                data = tt.take(html_fixture);
            data.p0a.p1a.first_li.should.eql('first nav item');
            data.p0a.second_li.should.eql('second nav item');
            data.p0b.p1b.h1.should.eql('Text in h1');
        });


        it('require minimal indentation', function() {
            var tt = new TakeTemplate([
                    '$ a ; +                         : p0a',
                    ' | 0 ; +                            : p1a',
                    '  | text ;                              : first_li',
                    ' | 1 text ;                         : second_li',
                    ' | 1 text ;                         : second_li_again',
                    '+                               : p0b',
                    ' $ h1 | 0 text ; +                  : p1b',
                    '                                        : h1'
                ]),
                data = tt.take(html_fixture);
            data.p0a.p1a.first_li.should.eql('first nav item');
            data.p0a.second_li.should.eql('second nav item');
            data.p0b.p1b.h1.should.eql('Text in h1');
        });


        it('do not overwrite if repeated', function() {
            var tt = new TakeTemplate([
                    '+                       : links',
                    '    $ a | 0 text ;          : first',
                    '+                       : links',
                    '    $ a | 1 text ;          : second',
                ]),
                data = tt.take(html_fixture);
            data.links.first.should.eql('first nav item');
            data.links.second.should.eql('second nav item');
        });
    });
});
