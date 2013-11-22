var assert = require('assert');
var canvasToPixels = require('../');
var imageUtils = require('./utils/image');

function drawCheckerboard(canvas, cb) {
  // Draw a white on black checkerboard
  var context = canvas.getContext('2d');
  context.fillStyle = "#000000";
  context.fillRect(0, 0, 10, 10);
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, 5, 5);
  context.fillRect(5, 5, 5, 5);
  cb();
}

function runCanvasToPixels(params) {
  before(function (done) {
    var that = this;
    canvasToPixels(params, function (err, pixels) {
      that.actualPixels = pixels;
      done(err);
    });
  });
}

describe('canvas-to-pixels', function () {
  describe('given a set of commands on a canvas', function () {
    runCanvasToPixels({
      width: 10,
      height: 10,
      js: drawCheckerboard
    });
    imageUtils.debug('checkerboard.png');
    imageUtils.loadExpected('checkerboard.png');

    it('returns an array of pixel values', function () {
      assert.deepEqual([].slice.call(this.actualPixels), [].slice.call(this.expectedPixels.data));
    });
  });
});
