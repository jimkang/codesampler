var through2 = require('through2');
var tweetTruncate = require('tweet-truncate');

function createAnalysisToTweetPostableStream(opts) {
  var excerptPicker;
  var log = function noOp() {};
  var codePushedToStream = {};
 
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
          // log('No excerpt found in analysis:', analysis);
        }
        else {
          if (!codePushedToStream[excerpt.code]) {
            var truncatedText = tweetTruncate({
              text: excerpt.code,
              delimiter: '\n',
              urlsToAdd: [
                analysis.url
              ]
            });

            stream.push({
              text: truncatedText,
              code: excerpt.code,
              url: analysis.url,
              numberOfReadableWords: excerpt.numberOfReadableWords,
              rarityOfWords: excerpt.rarityOfWords
            });
          }

          codePushedToStream[excerpt.code] = true;
        }
        callback();
      }

      excerptPicker(analysis, truncateAndPush);
    }
  );
}

module.exports = {
  create: createAnalysisToTweetPostableStream
};
