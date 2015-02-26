var through2 = require('through2');
var tweetTruncate = require('tweet-truncate');

function createAnalysisToTweetPackageStream(opts) {
  var featurePicker;
  var log;

  if (opts) {
    if (opts.featurePicker) {
      featurePicker = opts.featurePicker;
    }
    if (opts.log) {
      log = opts.log;
    }
  }

  if (!featurePicker) {
    throw new Error('No featurePicker given to analysisToTweetPackageStream.');
  }

  return through2(
    {
      objectMode: true
    },
    function truncateTextToTweetSize(analysis, enc, callback) {
      this.push(tweetTruncate({
        text: featurePicker(analysis),
        delimiter: '\n',
        urlsToAdd: [
          analysis.url
        ]
      }));
      callback();
    }
  );
}

module.exports = {
  create: createAnalysisToTweetPackageStream
};
