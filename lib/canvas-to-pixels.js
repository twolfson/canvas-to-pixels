var assert = require('assert');
var Canvas = require('canvas');

function canvasToPixels(options, cb) {
  // Localize and assert options
  var width = options.width;
  var height = options.height;
  var js = options.js;
  assert(width, 'canvasToPixels expects `options.width` parameter');
  assert(height, 'canvasToPixels expects `options.height` parameter');
  assert(js, 'canvasToPixels expects `options.js` parameter');

  // Create our canvas
  var canvas = new Canvas(width, height);
  js(canvas, function handleError (err) {
    // If there was an error, callback with it
    if (err) {
      return cb(err);
    }

    // Grab the pixel data and callback
    var context = canvas.getContext('2d');
    var pixels = context.getImageData(0, 0, width, height).data;
    cb(null, pixels);
  });
}

module.exports = canvasToPixels;