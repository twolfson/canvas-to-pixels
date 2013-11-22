# canvas-to-pixels [![Build status](https://travis-ci.org/twolfson/canvas-to-pixels.png?branch=master)](https://travis-ci.org/twolfson/canvas-to-pixels)

Convert canvas actions into pixels

This is part of the [gifsockets][] project. It is an alternative engine to the default [phantomjs-pixel-server][].

[gifsockets]: https://github.com/twolfson/gifsockets-server
[phantomjs-pixel-server]: https://github.com/twolfson/phantomjs-pixel-server

## Getting Started
**This module depends on [node-canvas][]. Please satisfy its dependencies before using.**

**Documentation here: https://github.com/LearnBoost/node-canvas/wiki**

Install the module with: `npm install canvas-to-pixels`

```js
var canvasToPixels = require('canvas-to-pixels');
canvasToPixels({
  width: 10,
  height: 10,
  js: (canvas, cb) {
    var context = canvas.getContext('2d');
    context.fillStyle = '#BADA55';
    context.fillRect(0, 0, 10, 10);
    cb();
  }
}, function receivePixels (err, pixels) {
  // pixels is [186,218,85,255,186,218, ..., 255]
});
```

## Documentation
`canvas-to-pixels` returns `canvasToPixels` as its `module.exports`

### `canvasToPixels(options, cb)`
Run JavaScript function against canvas receive call back with [`PixelArray`][]

- options `Object`
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
- cb `Function` - Error-first callback that will receive [`PixelArray`][]
    - Function signature should be `function (err, pixels) {}`
    - err `Error` - An error if any occurred while generating pixels
    - pixels [`PixelArray`][] - An `rgba` array of pixels values from the canvas
        - [`PixelArrays`][`PixelArray`] behave just like normal arrays except they lack methods like `concat`
        - An `rgba` array is an array that contains subsequences of length 4 representing the `red`, `green`, `blue`, and `alpha` values for a pixel.
            - For example, `[0, 1, 2, 3, 4, 5, 6, 7]` is 2 pixels with `r: 0, g: 1, b: 2, a: 3` and `r: 4, g: 5, b: 6, a: 7`
            - Each value can range from `0` to `255`
        - If you would like to coerce `pixels` into a normal array, run

```js
var normalArray = Array.prototype.slice.call(pixels);
```

[`PixelArray`]: https://developer.mozilla.org/en-US/docs/Web/API/CanvasPixelArray

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
