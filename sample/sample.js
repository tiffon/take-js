#!/usr/bin/env node

var fs = require('fs'),
    request = require('superagent');

var TakeTemplate = require('..').TakeTemplate;


var REDDIT_URL = 'http://www.reddit.com',
    TMPL_PATH = 'reddit.take',
    INLINE_TMPL_PATH = 'reddit_inline_saves.take';


var tmpl = fs.readFileSync(TMPL_PATH, {encoding: 'utf8'}),
    inlineTmpl = fs.readFileSync(INLINE_TMPL_PATH, {encoding: 'utf8'}),
    tt = new TakeTemplate(tmpl.split('\n')),
    inlineTT = new TakeTemplate(inlineTmpl.split('\n'));


request
    .get(REDDIT_URL)
    .end(function(err, resp) {
        var data,
            inlineData;
        if (err) {
            throw err;
        }
        data = tt.take(resp.text);
        inlineData = inlineTT.take(resp.text);
        console.log('Results of both templates are identiical:', JSON.stringify(data) === JSON.stringify(inlineData));
        console.log('Total reddit entries:', data.entries.length);
        console.log('Printing the first two:');
        data.entries = data.entries.slice(0, 2);
        console.log(JSON.stringify(data, undefined, 4));
    });
