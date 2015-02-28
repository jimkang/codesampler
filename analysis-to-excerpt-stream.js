var through2 = require('through2');
var tweetTruncate = require('tweet-truncate');

function createAnalysisToTweetExcerptStream(opts) {
  var excerptPicker;
  var log = function noOp() {};

  if (opts) {
    if (opts.excerptPicker) {
      excerptPicker = opts.excerptPicker;
    }
    if (opts.log) {
      log = opts.log;
    }
  }

  if (!excerptPicker) {
    throw new Error('No excerptPicker given to analysisToTweetExcerptStream.');
  }

  return through2(
    {
      objectMode: true
    },
    function truncateTextToTweetSize(analysis, enc, callback) {
      var stream = this;

      function truncateAndPush(error, excerpt) {

        if (error) {
          log('Error in analysisToTweetExcerptStream:', error, error.stack);
        }
        else if (!excerpt) {
          log('No excerpt found in analysis:', analysis);
        }
        else {
          stream.push(tweetTruncate({
            text: excerpt,
            delimiter: '\n',
            urlsToAdd: [
              analysis.url
            ]
          }));
        }
        callback();        
      }

      excerptPicker(analysis, truncateAndPush);
    }
  );
}

module.exports = {
  create: createAnalysisToTweetExcerptStream
};
