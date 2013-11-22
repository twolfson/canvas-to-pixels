var assert = require('assert');
var fs = require('fs');
var spawn = require('child_process').spawn;
var functionToString = require('function-to-string');
var getPixels = require('get-pixels');
var ndarray = require('ndarray');
var request = require('request');
var savePixels = require('save-pixels');

function makeRequest(params) {
  before(function (done) {
    // Stringify our argument for phantomjs
    var arg = JSON.stringify(params);
    var encodedArg = encodeURIComponent(arg);

    // Request to our server
    var that = this;
    request({
      url: 'http://localhost:9090/',
      method: 'POST',
      headers: {
        // DEV: PhantomJS looks for Proper-Case headers, request is lower-case =(
        'Content-Length': encodedArg.length
      },
      body: encodedArg,
    }, function handlePhantomResponse (err, res, body) {
      that.res = res;
      that.body = body;
      done(err);
    });
  });
}
function interpretPixels() {
  before(function () {
    try {
      this.actualPixels = JSON.parse(this.body);
    } catch (e) {
      console.log('Body was ', this.body);
      throw e;
    }
  });
}
function debugActual(filename) {
  if (process.env.DEBUG_TEST) {
    before(function (done) {
      var png = savePixels(ndarray(this.actualPixels, [10, 10, 4], [4 * 10, 4, 1], 0), 'png');
      try { fs.mkdirSync(__dirname + '/actual-files'); } catch (e) {}
      png.pipe(fs.createWriteStream(__dirname + '/actual-files/' + filename));
      png.on('end', done);
    });
  }
}
function loadExpected(filename) {
  before(function (done) {
    var that = this;
    getPixels(__dirname + '/expected-files/' + filename, function (err, expectedPixels) {
      that.expectedPixels = expectedPixels;
      done(err);
    });
  });
}

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
var drawCheckerboardInfo = functionToString(drawCheckerboard);

describe('phantomjs-pixel-server', function () {
  before(function (done) {
    this.child = spawn('phantomjs', [__dirname + '/../lib/phantomjs-pixel-server.js'], {stdio: [0, 1, 2]});
    setTimeout(function () {
      // TODO: We could wait for 200 from server
      done();
    }, 1000);
  });
  after(function (done) {
    this.child.kill();
    this.child.on('exit', function (code, signal) {
      done();
    });
  });

  describe('given a set of commands on a canvas', function () {
    makeRequest({
      width: 10,
      height: 10,
      js: drawCheckerboardInfo
    });
    interpretPixels();
    debugActual('checkerboard.png');
    loadExpected('checkerboard.png');

    it('returns an array of pixel values', function () {
      assert.deepEqual(this.actualPixels, [].slice.call(this.expectedPixels.data));
    });
  });

  describe('given commands which encrypt as a string', function () {
    // DEV: These were optimal for gifsockets but proved troublesome on Windows with stdout
    // TODO: Look into if Windows + stdout gives us the same trouble
    makeRequest({
      width: 10,
      height: 10,
      js: drawCheckerboardInfo,
      responseType: 'string'
    });
    before(function () {
      try {
        var body = this.body;
        var i = 0;
        var len = body.length;
        var pixels = new Array(len);
        this.actualPixels = pixels;
        for (; i < len; i++) {
          pixels[i] = body.charCodeAt(i);
        }
      } catch (e) {
        console.log('Body was ', this.body);
        throw e;
      }
    });
    debugActual('checkerboard.png');
    loadExpected('checkerboard.png');

    it('gives an encoded string which corresponds to pixel values', function () {
      assert.deepEqual(this.actualPixels, [].slice.call(this.expectedPixels.data));
    });
  });

  describe('running an asynchronous set of commands', function () {
    function drawCheckerboardAsync(canvas, cb) {
      setTimeout(function () {
        var context = canvas.getContext('2d');
        context.fillStyle = "#000000";
        context.fillRect(0, 0, 10, 10);
        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, 5, 5);
        context.fillRect(5, 5, 5, 5);
        cb();
      }, 1000);
    }

    makeRequest({
      width: 10,
      height: 10,
      js: functionToString(drawCheckerboardAsync)
    });
    interpretPixels();
    debugActual('checkerboard.png');
    loadExpected('checkerboard.png');

    it('returns an array of pixel values', function () {
      assert.deepEqual(this.actualPixels, [].slice.call(this.expectedPixels.data));
    });
  });
});
