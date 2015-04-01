A DSL for extracting data from a web page. The DSL serves two purposes: finds elements and extracts their text or attribute values. The main reason for developing this is to have all the CSS selectors for scraping a site in one place (I prefer CSS selectors over anything else).

The DSL wraps [cheerio](https://github.com/cheeriojs/cheerio).

A few links:

-   [Github repository](https://github.com/tiffon/take-js)
-   [npm package](http://npmjs.com/package/take-dsl)
-   [Discussion group](https://groups.google.com/forum/#!forum/take-dsl)

Example
=======

Given the following take template:

    $ h1 | text
        save: h1_title
    $ ul
        save each: uls
            $ li
                | 0 [title]
                    save: title
                | 1 text
                    save: second_li
    $ p | 1 text
        save: p_text

And the following HTML:

```HTML
<div>
    <h1>Le Title 1</h1>
    <p>Some body here</p>
    <h2 class="second title">The second title</h2>
    <p>Another body here</p>
    <ul id="a">
        <li title="a less than awesome title">A first li</li>
        <li>A second li</li>
        <li>A third li</li>
    </ul>
    <ul id="b">
        <li title="some awesome title">B first li</li>
        <li>B second li</li>
        <li>B third li</li>
    </ul>
</div>
```

The following data will be extracted (presented in JSON format):

```JSON
{
    "h1_title": "Le Title 1",
    "p_text": "Another body here",
    "uls": [
        {
            "title": "a less than awesome title",
            "second_li": "A second li"
        },
        {
            "title": "some awesome title",
            "second_li": "B second li"
        }
    ]
}
```

Take templates always result in a single JavaScript `Object`.

For a more complex example, see the [reddit sample](https://github.com/tiffon/take-js/blob/master/lib/sample.js).

## Install

```SHELL
npm  install take
```

## Usage

### Creating a Take Template

A take template is created from an `Array` of `string`s with each `string` being one line of the take template.

To create a template:

```JavaScript
var TakeTemplate = require('take').TakeTemplate,
    TMPL = [
        '$ nav a',
        '    save each: nav',
        '        | text',
        '            save: text',
        '        | [href]',
        '            save: link'
    ],
    tt = TakeTemplate(TMPL);
```


### Using a Take Template

Pass a HTML string to the `.take()` method:

```JavaScript
data = tt.take('<div>hello world</div>')
```


## Take Templates

Take templates are whitespace sensitive and are comprised of three types of lines:

-   Queries
    -   `$ h1`
    -   `| text`
    -   `$ h1 | 0 text`
-   `save` directives
    -   `save: h1_title`
    -   `save: time.exact`
-   `save each` directives
    -   `save each: entries`
    -   `save each: popular.movies`

### Queries


There are two main types of queries in take templates:

-   CSS selector queries
-   Non-CSS selector queries

The reason they’re divided like this is because CSS Selectors always go first on the line and they can be followed by non-CSS non-CSS Selector queries. Non-CSS selector queries can’t be followed by CSS selector queries. Seems easier to read this way, but it’s arbitrary and the syntax can be changed if something else makes more sense.


#### CSS Selector queries

CSS selector queries start with `$` and end either at the end of the line or at the `|` character. The `|` character delimits non-CSS selector queries.

-   `$ #siteTable .thing | text`
-   `$ .domain a`

In the first example above, the CSS selector query is `#siteTable .thing`. The second is `.domain a`.

The CSS selectors are passed to [cheerio](https://github.com/cheeriojs/cheerio), so anything cheerio can accept can be used. There are a few open [issues](https://github.com/cheeriojs/cheerio/issues) in cheerio. They will come up.


#### Non-CSS Selector queries

Non-CSS selector queries start with `|` and continue for the rest of the line. There are three non-CSS Selector queries:

-   Element indexes
    -   Syntax: an integer
    -   `| 0` will return the first element in the current context
    -   `| 1` will return the second element in the current context
-   Text retrieval
    -   Syntax: `text`
    -   `| text` will return the text of the current context
    -   `| 1 text` will first get the second element in the current context and then return it’s text
-   Attribute retrieval
    -   Syntax: `[attr]`
    -   `| [href]` will return the value of the `href` attribute of the first element in the current context
    -   `| 1 [href]` will return the value of the `href` attribute of the second element in the current context

**Order matters**: Index queries should precede text or attribute retrieval queries. Only one of text or attribute queries can be used; they can’t both be used on one line.


### Whitespace

The level of indentation on each line defines the context for the line.

The root context of a take template is the current HTML document being processed. Every statement that is not indented is executed against the document being processed.

Each line that is indented more deeply has a context that is the result of the last query in the parent context. For example:

    $ #some-id
        $ li
        $ div

The query on the first line is executed against the document being processed. The query on the second line is executed against the result of the first line. So, the second line is synonomous with `$ #some-id li`. The query on the third line is also executed against the result of the first line. So, it can be re-written as `$ #some-id div`.

Another example:

    $ a
        | 0
            | text
            | [href]

The third and fourth lines retrieve the text and href attribute, respectively, from the first `<a>` in the document being processed. This could be rewritten as:

    $ a | 0
        | text
        | [href]


### Save Directives

Save directives save the context into the result `Object`. These are generally only intended to be applied to the result of a `text` or `[attr]` retrieval.

The syntax is:

    save: identifier

Any non-whitespace characters can be used as the identifier. Also, the identifier can contain dots (`.`), which designate sub-`Object`s for saving.

For example, the following take template:

    $ a | 0
        | text
            save: first_a.text
        | [href]
            save: first_a.href

And the following HTML:

```HTML
<div>
    <a href="http://www.example.com">fo sho</a>
    <a href="http://www.another.com">psych out</a>
</div>
```

Will result in the following `Object`:

```JavaScript
{
    first_a: {
        text: 'fo sho',
        href: 'http://www.example.com'
    }
}
```


### Save Each Directives

Save each directives produce an `Array` of `Object`s. Generally, these are used for repeating elements on a page. In the [reddit sample](https://github.com/tiffon/take-js/blob/master/lib/sample.js), a save each directive is used to save each of the reddit entries on the reddit homepage.

The syntax is:

    save each: identifier

Any non-whitespace characters can be used as the identifier. Also, the identifier can contain dots (`.`), which designate sub-`Object`s for saving.

Save each directives apply the next sub-context to each of the elements of their context. Put another way, save each directives repeatedly process each element of thier context.

For example, in the following take template, the `| text` and `| [href]` queries (along with saving the results) will be applied to every `<a>` in the document.

    $ a
        save each: anchors
            | text
                save: text
            | [href]
                save: href

Applying the above take template to the following HTML:

```HTML
<div>
    <a href="http://www.example.com">fo sho</a>
    <a href="http://www.another.com">psych out</a>
</div>
```

Will result in the following `Object`:

```JavaScript
{
    anchors: [{
            text: 'fo sho',
            href: 'http://www.example.com'
        },{
            text: 'psych out',
            href: 'http://www.another.com'
        }
    ]
}
```
