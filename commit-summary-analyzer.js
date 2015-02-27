var conformAsync = require('conform-async');
var _ = require('lodash');
var through2 = require('through2');

var commentRegexes = [
  /[^https*:]\/\/.*[^\n]+/g, // C-style
  // /#.*[^\n]+/g // Python, shell.
];

// TODO: Pure regexes are not a good way to find comments.

var functionRegexes = [
  /function\s*.*\(.*\).*[^\n]/g, // JS
  /fn\s*.*\(.*\).*[^\n]/g, // Rust
  /func\s*.*\(.*\).*[^\n]/g, // Swift
];

function createCommitSummaryAnalyzer(opts) {
  function analyze(commitSummary, done) {
    var analysis = {};

    var comments = findInPatches(commitSummary, commentRegexes);
    var functions = findInPatches(commitSummary, functionRegexes);

    if (comments && comments.length > 0) {
      analysis.comments = comments;
    }
    if (functions && functions.length > 0) {
      analysis.functions = functions;
    }

    conformAsync.callBackOnNextTick(done, null, analysis);
  }

  function findInPatches(commitSummary, regexes) {
    var targets = [];
    var curriedFind = _.curry(findInPatchWithRegexes)(regexes);

    if (commitSummary.patches) {
      targets = _.flatten(_.compact(commitSummary.patches.map(curriedFind)));
    }
    return targets;
  }

  function findInPatchWithRegexes(regexes, patch) {
    function findWithRegex(found, regex) {
      return found.concat(patch.match(regex));
    }

    return _.compact(regexes.reduce(findWithRegex, []));
  }

  function findFunctionsInPatch(patch) {
    function findFunctionsWithRegex(found, regex) {
      return found.concat(patch.match(regex));
    }

    return _.compact(functionRegexes.reduce(findFunctionsWithRegex, []));
  }

  function createAnalysisStream(opts) {
    var analysisStream = through2(
      {
        objectMode: true
      },
      function convertToAnalysis(commitSummary, enc, callback) {
        var stream = this;

        analyze(commitSummary, function done(error, analysis) {
          if (error) {
            console.log(error);
          }
          else {
            stream.push(analysis);
          }
          callback();
        });
      }
    );

    return analysisStream;
  }

  return {
    analyze: analyze,
    createAnalysisStream: createAnalysisStream
  };
}

module.exports = {
  create: createCommitSummaryAnalyzer
};
