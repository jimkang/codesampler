var config = require('./config');
var createTweetPoster = require('./tweet-poster').create;
var createSampleAnalyzeExcerptStream = require('./sample-analyze-excerpt-stream').create;

var dryRun = false;

if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var postTweet = createTweetPoster({
  twitterConfig: config.twitter,
  dryRun: dryRun
});

createSampleAnalyzeExcerptStream(function done(error, excerptStream) {
  if (error) {
    console.log(error, error.stack);
    return;
  }

  excerptStream.on('data', postTweet);

  excerptStream.on('end', function onEnd() {
    console.log('codesampler run completed.')
  });
});
