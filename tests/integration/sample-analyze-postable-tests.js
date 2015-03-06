var createSampleAnalyzePostableStream = require('../../sample-analyze-postable-stream').create;
var test = require('tape');
var conformAsync = require('conform-async');
var chroniclerclient = require('../../chroniclerclient');

test('Post excerpts', function postExcerpts(t) {
  t.plan(1);
  var db = chroniclerclient.getDb();

  createSampleAnalyzePostableStream(
    {
      db: db
    },
    done
  );

  function done(error, excerptStream) {
    if (error) {
      console.log(error, error.stack);
      return;
    }

    var receivedExcerptData = false;

    excerptStream.on('data', function onData(excerpt) {
      if (!receivedExcerptData && excerpt && excerpt.text.length > 0) {
        receivedExcerptData = true;
      }
      console.log('Excerpt:', excerpt);
    });

    excerptStream.on('end', function onEnd() {
      db.close();
      t.ok(receivedExcerptData, 'Received excerpt data.');
    });
  }
});
