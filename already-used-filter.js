var queue = require('queue-async');
var _ = require('lodash');

function createAlreadyUsedFilter(opts) {
  var db;

  if (opts) {
    db = opts.db;
  }

  if (!db) {
    throw new Error('No db provided to createAlreadyUsedFilter.');
  }

  function filterText(codeText, done) {
    db.topicWasUsedInTribute(codeText, function checkResult(error, wasUsed) {
      if (error) {
        console.log(error, error.stack);
      }
      done(error, wasUsed ? undefined : codeText);
    });
  }

  return function filterOutAlreadyUsed(codeTexts, done) {
    var q = queue();
    codeTexts.forEach(function queueFilter(codeText) {
      q.defer(filterText, codeText);
    });
    q.awaitAll(function queueDone(error, filtered) {
      done(error, _.compact(filtered));
    });
  };
}

module.exports = {
  create: createAlreadyUsedFilter
};
