var through2 = require('through2');
var tweetTruncate = require('tweet-truncate');

function createAnalysisToTweetPackageStream(opts) {
  var excerptPicker;
  var log;

  if (opts) {
    if (opts.excerptPicker) {
      excerptPicker = opts.excerptPicker;
    }
    if (opts.log) {
      log = opts.log;
    }
  }

  if (!excerptPicker) {
    throw new Error('No excerptPicker given to analysisToTweetPackageStream.');
  }

  return through2(
    {
      objectMode: true
    },
    function truncateTextToTweetSize(analysis, enc, callback) {
      var excerpt = excerptPicker(analysis);
      if (excerpt) {
        this.push(tweetTruncate({
          text: excerptPicker(analysis),
          delimiter: '\n',
          urlsToAdd: [
            analysis.url
          ]
        }));
      }
      else if (log) {
        log('No excerpt found in analysis:', analysis);
      }
      callback();
    }
  );
}

module.exports = {
  create: createAnalysisToTweetPackageStream
};
