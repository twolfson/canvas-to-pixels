# phantomjs-pixel-server [![Build status](https://travis-ci.org/twolfson/phantomjs-pixel-server.png?branch=master)](https://travis-ci.org/twolfson/phantomjs-pixel-server)

[PhantomJS][] server that converts canvas actions into pixels

This is part of the [gifsockets][] project.

[PhantomJS]: http://phantomjs.org/
[gifsockets]: https://github.com/twolfson/gifsockets-server

## Getting Started
Install the module with: `npm install -g phantomjs-pixel-server`

Start a server and get some pixels:

```bash
bin/phantomjs-pixel-server &
# PhantomJS server is running at http://127.0.0.1:9090/
curl http://127.0.0.1:9090/ -X POST --data \
'{"width":10,"height":10,"js":{"params":["canvas","cb"], '\
'"body":"var context = canvas.getContext(\"2d\"); '\
'context.fillStyle = \"#BADA55\"; context.fillRect(0, 0, 10, 10); cb();"}}'
# [186,218,85,255,186,218, ..., 255]
```

With [request][], that would look like:

[request]: https://github.com/mikeal/request

```js
// We use JSON as our body and must serialize it in this maner
var arg = JSON.stringify({
  width: 10,
  height: 10,
  js: {
    params: ["canvas", "cb"],
    body: [
      'var context = canvas.getContext(\'2d\');'
      'context.fillStyle = \'#BADA55\';',
      'context.fillRect(0, 0, 10, 10);',
      'cb();'
    ].join('')
  }
});
var encodedArg = encodeURIComponent(arg);

// Request to our server
request({
  url: 'http://localhost:9090/',
  method: 'POST',
  headers: {
    // PhantomJS looks for Proper-Case headers, request is lower-case
    // This means you *must* supply this header
    'Content-Length': encodedArg.length
  },
  body: encodedArg,
}, function handlePhantomResponse (err, res, body) {
  // body is "[186,218,85,255,186,218, ..., 255]"
});
```

## Documentation
### CLI
The CLI command for `phantomjs-pixel-server` is a `node` wrapper which invokes a [PhantomJS][] script. The script path is resolved by `node's` `require` function.

```js
// Resolve locally installed server path
// '/home/todd/github/phantomjs-pixel-server/lib/phantomjs-pixel-server.js'
require.resolve('phantomjs-pixel-server');
```

Inside the server, we use [commander][] to accept different parameters for the server. Currently, we only support `port`.

[commander]: https://github.com/visionmedia/commander.js

```bash
$ phantomjs-pixel-server --help

  Usage: phantomjs-pixel-server.js [options]

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -p, --port <port>  Port to run the server on
```

### HTTP interface
`phantomjs-pixel-server` will reply with `200s` to any non-`POST` request (e.g. `GET`). This is a nice way to know when the server has started.

```bash
curl http://127.0.0.1:9090/
# IT'S ALIVE!
```

For `POST` requests, we expect a JSON body that has been run through `escapeURIComponent` (see [Getting Started][] for example). The request can have the following parameters

[Getting Started]: #getting-started

- width `Number` - Width of canvas and output image
- height `Number` - Height of canvas and output image
- js `Object` - Container for commands to run against a `canvas` instance
    - This can be prepared by passing a function to [function-to-string][]
    - The function itself should have a signature of `function (canvas, cb) {}`
    - params `String[]` - Array of parameter names for a function
      - The first parameter will be a `canvas` instance with the provided `width` and `height`
    - body `String` - Body of the function to execute
      - This must callback when it is completed (second parameter)
      - It is expected that `js.body` will write out the content you want to the canvas
- responseType `String` - Optional flag to set response type.
    - By default, the response will be an `rgba` array of pixels.
        - For example, `[0, 1, 2, 3, 4, 5, 6, 7]` is 2 pixels with `r: 0, g: 1, b: 2, a: 3` and `r: 4, g: 5, b: 6, a: 7`
    - If `responseType` is `'string'`, the response will be a string where each character represents a pixel value
        - For example, `abcd` is `[97, 98, 99, 100]`
        - These values can be extracted via [charCodeAt][]. [Another example is in the tests][].
        - This is practical for reducing padding and using a more efficient parsing technique.

[function-to-string]: https://github.com/twolfson/function-to-string
[charCodeAt]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
[Another example is in the tests]: https://github.com/twolfson/phantomjs-pixel-server/blob/12d06b5f7c90fa4848dbe4c749180d6b0d726854/test/phantomjs-pixel-server_test.js#L117-L123

## Donating
Support this project and [others by twolfson][gittip] via [gittip][].

[![Support via Gittip][gittip-badge]][gittip]

[gittip-badge]: https://rawgithub.com/twolfson/gittip-badge/master/dist/gittip.png
[gittip]: https://www.gittip.com/twolfson/

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## Unlicense
As of Nov 15 2013, Todd Wolfson has released this repository and its contents to the public domain.

It has been released under the [UNLICENSE][].

[UNLICENSE]: UNLICENSE
