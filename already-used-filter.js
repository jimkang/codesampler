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

  function filterText(excerpt, done) {
    db.topicWasUsedInTribute(excerpt.code, checkResult);

    function checkResult(error, wasUsed) {
      if (error) {
        console.log(error, error.stack);
      }
      if (wasUsed) {
        console.log('Filtering already used code:', excerpt.code);
      }
      done(error, wasUsed ? undefined : excerpt);
    }
  }

  return function filterOutAlreadyUsed(excerpts, done) {
    var q = queue();
    excerpts.forEach(function queueFilter(excerpt) {
      q.defer(filterText, excerpt);
    });
    q.awaitAll(function queueDone(error, filtered) {
      done(error, _.compact(filtered));
    });
  };
}

module.exports = {
  create: createAlreadyUsedFilter
};
