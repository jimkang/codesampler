var createAnalysisToPostableStream = require('../analysis-to-postable-stream').create;
var test = require('tape');
var conformAsync = require('conform-async');
var createExcerptAnalysisWithCode = require('../commit-summary-analyzer').createExcerptAnalysisWithCode;
var _ = require('lodash');

test('Post packages', function postPackages(t) {
  t.plan(4);

  var tweetStream = createAnalysisToPostableStream({
    excerptPicker: function pickFunction(analysis, done) {
      conformAsync.callBackOnNextTick(
        done, null, analysis.functions[0]
      );
    }
  });

  var receivedPackageCount = 0;

  tweetStream.on('data', function onData(excerpt) {
    if (receivedPackageCount === 0) {
      t.deepEqual(
        _.pick(excerpt, 'text', 'code', 'url'),
        {
          text: 'function validateEmailAddress (emailAddress) {\nhttp://zombo.com',
          code: 'function validateEmailAddress (emailAddress) {',
          url: 'http://zombo.com'
        },
        'Received package from analysis.'
      );
    }
    else {
      t.deepEqual(
        _.pick(excerpt, 'text', 'code', 'url'),
        {
          text: 'function prestidigitate(really, really, really, long, list, of, parameters, that, just goes on and on and on and on …\nhttp://realultimatepower.net',
          code: 'function prestidigitate(really, really, really, long, list, of, parameters, that, just goes on and on and on and on and on and on till the brink of dawn) {',
          url: 'http://realultimatepower.net',
        },
        'Received package from analysis.'
      );
    }
    receivedPackageCount += 1;
  });

  tweetStream.on('end', function onEnd() {
    t.equal(
      receivedPackageCount,
      2,
      'Does not emit a postable for an analysis that duplicates the code of another one.'
    );
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
      .map(createExcerptAnalysisWithCode)
    }
  );

  tweetStream.write(
    {
      sha: 'yes',
      url: 'http://realultimatepower.net',
      functions: [
        "function prestidigitate(really, really, really, long, list, of, parameters, that, just goes on and on and on and on and on and on till the brink of dawn) {",
      ]
      .map(createExcerptAnalysisWithCode)
    }
  );

  tweetStream.write(
    {
      sha: 'yes',
      url: 'http://realultimatepower2.net',
      functions: [
        "function prestidigitate(really, really, really, long, list, of, parameters, that, just goes on and on and on and on and on and on till the brink of dawn) {",
      ]
      .map(createExcerptAnalysisWithCode)
    }
  );

  // This should trigger the 'end' event.
  tweetStream.end();
});
