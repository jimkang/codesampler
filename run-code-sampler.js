var config = require('./config');
var createTweetPoster = require('./tweet-poster').create;
var createSampleAnalyzeExcerptStream = require('./sample-analyze-excerpt-stream').create;
var chroniclerclient = require('./chroniclerclient');

var db = chroniclerclient.getDb();

var dryRun = false;

if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var postTweet = createTweetPoster({
  twitterConfig: config.twitter,
  dryRun: dryRun
});

function postAndRecord(excerpt) {
  postTweet(excerpt.text, postDone);

  function postDone(error) {
    if (!error) {
      db.recordThatTopicWasUsedInTribute(excerpt.code, function done() {
        console.log('Recorded use of ', excerpt.code);
      });
    }
  }
}

createSampleAnalyzeExcerptStream(
  {
    db: db
  },
  setUpStreamHandlers
);

function setUpStreamHandlers(error, excerptStream) {
  if (error) {
    console.log(error, error.stack);
    return;
  }

  excerptStream.on('data', postAndRecord);

  excerptStream.on('end', function onEnd() {
    db.close();
    console.log('codesampler run completed.');
  });
}