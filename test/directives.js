var fs = require('fs'),
    cheerio = require('cheerio');

var TakeTemplate = require('../').TakeTemplate,
    errors = require('../lib/errors');

var html_fixture = fs.readFileSync(__dirname + '/doc.html', {encoding: 'utf8'}),
    $doc = cheerio(html_fixture);


describe('directives', function() {

    describe('def directives', function() {


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
});
