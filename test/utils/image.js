var fs = require('fs');
var ndarray = require('ndarray');
var getPixels = require('get-pixels');
var savePixels = require('save-pixels');

exports.loadExpected = function (filename) {
  before(function (done) {
    var that = this;
    getPixels(__dirname + '/../expected-files/' + filename, function (err, expectedPixels) {
      that.expectedPixels = expectedPixels;
      done(err);
    });
  });
};

exports.debug = function (filename) {
  if (process.env.DEBUG_TEST) {
    before(function (done) {
      var png = savePixels(ndarray([].slice.call(this.actualPixels), [10, 10, 4], [4 * 10, 4, 1], 0), 'png');
      try { fs.mkdirSync(__dirname + '/../actual-files'); } catch (e) {}
      png.pipe(fs.createWriteStream(__dirname + '/../actual-files/' + filename));
      png.on('end', done);
    });
  }
};