var config = require('./config');
var createTweetPoster = require('./tweet-poster').create;
var createSampleAnalyzePostableStream = require('./sample-analyze-postable-stream').create;
var chroniclerclient = require('./chroniclerclient');
var _ = require('lodash');
// var createJudge = require('./excerptjudge').create;
var queue = require('queue-async');

var dryRun = false;
if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var maxPostsPerRun = 3;
var db = chroniclerclient.getDb();
// var judge = createJudge();

var postTweet = createTweetPoster({
  twitterConfig: config.twitter,
  dryRun: dryRun
});

var receivedExcerpts = [];

function saveExcerpt(excerpt) {
  console.log('Received excerpt with code:', excerpt.code);
  receivedExcerpts.push(excerpt);
}

createSampleAnalyzePostableStream(
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

  excerptStream.on('data', saveExcerpt);

  excerptStream.on('end', function onEnd() {
    // var ranked = rankExcerpts(receivedExcerpts);
    // console.log('Excerpts by rank:', JSON.stringify(ranked, null, '  '));
    var selectedSample = _.sample(receivedExcerpts, maxPostsPerRun);

    postExcerpts(
      selectedSample, 
      function done(error) {
        if (error) {
          console.log(error);
        }

        db.close();
        console.log('codesampler run completed.');
      }
    );
  });
}

// function rankExcerpts(excerpts) {
//   receivedExcerpts.forEach(judge.scoreExcerpt);
//   return receivedExcerpts.sort(compareExcerpts);
// }

// function compareExcerpts(a, b) {
//   return (a.score > b.score) ? -1 : 1;
// }

function postExcerpts(excerpts, done) {
  var q = queue(1);
  excerpts.forEach(function queuePosting(excerpt) {
    q.defer(postAndRecord, excerpt);
  });
  q.awaitAll(done);
}

function postAndRecord(excerpt, done) {
  postTweet(excerpt.text, postDone);

  function postDone(error) {
    if (!error) {
      db.recordThatTopicWasUsedInTribute(excerpt.code, function recordDone() {
        console.log('Recorded use of ', excerpt.code);
      });
      done();
    }
    else {
      done(error);
    }
  }
}
