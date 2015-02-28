var createSampleAnalyzePackageStream = require('../../sample-analyze-package-stream').create;
var test = require('tape');
var conformAsync = require('conform-async');

test('Post packages', function postPackages(t) {
  t.plan(1);

  createSampleAnalyzePackageStream(function done(error, summaryStream) {
    if (error) {
      console.log(error, error.stack);
      return;
    }

    var receivedSummaryData = false;

    summaryStream.on('data', function onData(summary) {
      if (!receivedSummaryData && summary && summary.length > 0) {
        receivedSummaryData = true;
      }
      console.log(summary);
    });

    summaryStream.on('end', function onEnd() {
      t.ok(receivedSummaryData, 'Received summary data.');
    });
  });
});
