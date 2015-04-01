#!/usr/bin/env node

var request = require('superagent');

var TakeTemplate = require('./take-template').TakeTemplate;

var REDDIT_URL = 'http://www.reddit.com',
    REDDIT_TMPL = [
        '$ #siteTable .thing',
        '    save each: entries',
        '        $ .rank | text',
        '            save: rank',
        '        $ .score.unvoted | text',
        '            save: score',
        '        $ a.title | text',
        '            save: title',
        '        $ .domain a',
        '            | text',
        '                save: domain.text',
        '            | [href]',
        '                save: domain.reddit_section',
        '        $ .tagline',
        '            $ time',
        '                | [datetime]',
        '                    save: time.exact',
        '                | text',
        '                    save: time.desc',
        '            $ .author',
        '                | [href]',
        '                    save: author.url',
        '                | text',
        '                    save: author.login',
        '            $ .subreddit',
        '                | [href]',
        '                    save: section.url',
        '                | text',
        '                    save: section.name',
        '        $ .comments | text',
        '            save: num_comments'
    ],
    tt = new TakeTemplate(REDDIT_TMPL);

request
    .get(REDDIT_URL)
    .end(function(err, resp) {
        var data;
        if (err) {
            throw err;
        }
        data = tt.take(resp.text);
        console.log('Total reddit entries:', data.entries.length);
        console.log('Printing the first two:');
        console.log(JSON.stringify(data.entries.slice(0, 2), undefined, 4));
    });
