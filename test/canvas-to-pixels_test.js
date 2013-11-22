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
      assert.deepEqual(this.actualPixels, [].slice.call(this.expectedPixels.data));
    });
  });

  // describe('given commands which encrypt as a string', function () {
  //   // DEV: These were optimal for gifsockets but proved troublesome on Windows with stdout
  //   // TODO: Look into if Windows + stdout gives us the same trouble
  //   makeRequest({
  //     width: 10,
  //     height: 10,
  //     js: drawCheckerboardInfo,
  //     responseType: 'string'
  //   });
  //   before(function () {
  //     try {
  //       var body = this.body;
  //       var i = 0;
  //       var len = body.length;
  //       var pixels = new Array(len);
  //       this.actualPixels = pixels;
  //       for (; i < len; i++) {
  //         pixels[i] = body.charCodeAt(i);
  //       }
  //     } catch (e) {
  //       console.log('Body was ', this.body);
  //       throw e;
  //     }
  //   });
  //   debugActual('checkerboard.png');
  //   loadExpected('checkerboard.png');

  //   it('gives an encoded string which corresponds to pixel values', function () {
  //     assert.deepEqual(this.actualPixels, [].slice.call(this.expectedPixels.data));
  //   });
  // });

  // describe('running an asynchronous set of commands', function () {
  //   function drawCheckerboardAsync(canvas, cb) {
  //     setTimeout(function () {
  //       var context = canvas.getContext('2d');
  //       context.fillStyle = "#000000";
  //       context.fillRect(0, 0, 10, 10);
  //       context.fillStyle = "#FFFFFF";
  //       context.fillRect(0, 0, 5, 5);
  //       context.fillRect(5, 5, 5, 5);
  //       cb();
  //     }, 1000);
  //   }

  //   makeRequest({
  //     width: 10,
  //     height: 10,
  //     js: functionToString(drawCheckerboardAsync)
  //   });
  //   interpretPixels();
  //   debugActual('checkerboard.png');
  //   loadExpected('checkerboard.png');

  //   it('returns an array of pixel values', function () {
  //     assert.deepEqual(this.actualPixels, [].slice.call(this.expectedPixels.data));
  //   });
  // });
});
