var createSampleAnalyzeExcerptStream = require('../../sample-analyze-excerpt-stream').create;
var test = require('tape');
var conformAsync = require('conform-async');

test('Post excerpts', function postExcerpts(t) {
  t.plan(1);

  createSampleAnalyzeExcerptStream(function done(error, excerptStream) {
    if (error) {
      console.log(error, error.stack);
      return;
    }

    var receivedExcerptData = false;

    excerptStream.on('data', function onData(excerpt) {
      if (!receivedExcerptData && excerpt && excerpt.length > 0) {
        receivedExcerptData = true;
      }
      console.log('Excerpt:', excerpt);
    });

    excerptStream.on('end', function onEnd() {
      t.ok(receivedExcerptData, 'Received excerpt data.');
    });
  });
});
