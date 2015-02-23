var conformAsync = require('conform-async');
var _ = require('lodash');

var findCStyleCommentsRegex = /\/\/.*[^\n]+/g;

function createCommitSummaryAnalyzer(opts) {

  function analyze(commitSummary, done) {
    var analysis = {};

    var comments = findComments(commitSummary);
    if (comments) {
      analysis.comments = comments;
    }

    conformAsync.callBackOnNextTick(done, null, analysis);
  }

  function findComments(commitSummary) {
    var comments = [];
    if (commitSummary.patches) {
      comments = _.flatten(_.compact(
        commitSummary.patches.map(findCommentsInPatch)
      ));
    }
    return comments;
  }

  function findCommentsInPatch(patch) {
    return patch.match(findCStyleCommentsRegex);
  }

  return {
    analyze: analyze
  };
}

module.exports = {
  create: createCommitSummaryAnalyzer
};
