var createAnalysisToTweetPackageStream = require('../analysis-to-tweet-package-stream').create;
var test = require('tape');
var conformAsync = require('conform-async');

test('Post packages', function postPackages(t) {
  t.plan(3);

  var tweetStream = createAnalysisToTweetPackageStream({
    excerptPicker: function pickFunction(analysis) {
      return '`' + analysis.functions[0] + '`';
    }
  });

  var receivedPackageCount = 0;

  tweetStream.on('data', function onData(text) {
    if (receivedPackageCount === 0) {
      t.equal(
        text,
        '`function validateEmailAddress (emailAddress) {`\nhttp://zombo.com',
        'Received package from analysis.'
      );
    }
    else {
      t.equal(
        text,
        '`function prestidigitate(really, really, really, long, list, of, parameters, that, just goes on and on and on and on…\nhttp://realultimatepower.net',
        'Received package from analysis.'
      );
    }
    receivedPackageCount += 1;
  });

  tweetStream.on('end', function onEnd() {
    t.pass('Stream ended.');
  });

  tweetStream.write(
    {
      sha: 'hey',
      url: 'http://zombo.com',
      functions: [
        "function validateEmailAddress (emailAddress) {",
        "function(snap) {",
        "function(evt) {",
      ]
    }
  );

  tweetStream.write(
    {
      sha: 'yes',
      url: 'http://realultimatepower.net',
      functions: [
        "function prestidigitate(really, really, really, long, list, of, parameters, that, just goes on and on and on and one and on and on till the brink of dawn) {",
      ]
    }
  );

  // This should trigger the 'end' event.
  tweetStream.end();
});
