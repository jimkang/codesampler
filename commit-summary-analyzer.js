var conformAsync = require('conform-async');
var _ = require('lodash');

var cStyleCommentsRegex = /\/\/.*[^\n]+/g;
// TODO: Other kinds of comments.

var functionRegexes = [
  /function\s*.*\(.*\).*[^\n]/g, // JS
  /fn\s*.*\(.*\).*[^\n]/g, // Rust
  /func\s*.*\(.*\).*[^\n]/g, // Swift
];

function createCommitSummaryAnalyzer(opts) {

  function analyze(commitSummary, done) {
    var analysis = {};

    var comments = findInPatches(commitSummary, findCommentsInPatch);
    var functions = findInPatches(commitSummary, findFunctionsInPatch);

    if (comments) {
      analysis.comments = comments;
    }
    if (functions) {
      analysis.functions = functions;
    }

    conformAsync.callBackOnNextTick(done, null, analysis);
  }

  function findInPatches(commitSummary, patchSearcher) {
    var targets = [];
    if (commitSummary.patches) {
      targets = _.flatten(_.compact(
        commitSummary.patches.map(patchSearcher)
      ));
    }
    return targets;
  }

  function findCommentsInPatch(patch) {
    return patch.match(cStyleCommentsRegex);
  }

  function findFunctionsInPatch(patch) {
    function findFunctionsWithRegex(found, regex) {
      return found.concat(patch.match(regex));
    }

    return _.compact(functionRegexes.reduce(findFunctionsWithRegex, []));
  }

  return {
    analyze: analyze
  };
}

module.exports = {
  create: createCommitSummaryAnalyzer
};
