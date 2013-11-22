// Load in modules
var fs = require('fs');
var system = require('system');
var server = require('webserver').create();
var webpage = require('webpage');

// Log all errors
phantom.onError = function (msg, trace) {
  var msgStack = ['ERROR: ' + msg];
  if (trace && trace.length) {
      msgStack.push('TRACE:');
      trace.forEach(function(t) {
          msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
      });
  }
  console.error(msgStack.join('\n'));
  phantom.exit(1);
};

// Process arguments
var program = require('./vendor/commander')
                .version(require('../package.json').version)
                .option('-p, --port <port>', 'Port to run the server on', 9090)
                .parse(process.argv);
var port = program.port;

// Start a server
var app = server.listen(port, function (req, res) {
  // If it's a POST request, collect image data
  if (req.method === 'POST') {
    getImageData(req, res);
  // Otherwise, send health status
  } else {
    res.statusCode = 200;
    res.write('IT\'S ALIVE!');
    res.close();
  }
});

console.log('PhantomJS server is running at http://127.0.0.1:' + port + '/');

function getImageData(req, res) {
  // Grab the post data
  var encodedArg = req.postRaw || req.post;
  if (!encodedArg) {
    res.statusCode = 400;
    res.write('No POST data was found');
    return res.close();
  }

  console.log('PHANTOMJS: Creating page');

  // Load the compose webpage
  var page = webpage.create();
  var errorEncountered = false;
  page.onError = function (msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    console.error(msgStack.join('\n'));
    if (!errorEncountered) {
      res.statusCode = 500;
      res.write('An error occurred on the page');
      res.close();
      errorEncountered = true;
    }
  };

  page.onConsoleMessage = function (msg) {
    console.log(msg);
  };

  console.log('PHANTOMJS: Opening page');

  page.open(phantom.libraryPath + '/phantomjs-pixel-server.html', function (status) {
    console.log('PHANTOMJS: Evaluating commands');
    var arg = decodeURIComponent(encodedArg);
    var params;
    try {
      params = JSON.parse(arg);
    } catch (e) {}

    // If there was an error in the JSON, respond
    if (!params) {
      res.statusCode = 500;
      res.write('Error processing JSON.');
      res.close();
      return;
    }

    page.evaluate(function (params) {
      window.processCommand(params);
    }, params);

    console.log('PHANTOMJS: Extracting data');
    var count = 0;
    function checkForRetStr() {
      // Stop early if there was an error and we replied
      if (errorEncountered) {
        return;
      }

      // Pluck out the data png
      var dataUrl = page.evaluate(function () {
        return window.retStr;
      });

      if (!dataUrl) {
        count += 1;
        if (count > 100) {
          res.statusCode = 500;
          res.write('Canvas not drawn to within 10 seconds. Timing out request.');
          res.close();
          return;
        }
        return setTimeout(checkForRetStr, 100);
      }

      console.log('PHANTOMJS: Writing response');

      // Output the dataUrl
      res.statusCode = 200;
      res.write(dataUrl);
      res.close();
    }
    checkForRetStr();
  });
}
