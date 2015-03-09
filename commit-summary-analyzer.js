var conformAsync = require('conform-async');
var _ = require('lodash');
var through2 = require('through2');
var codefeatures = require('./codefeatures');
var createExcerptRater = require('./excerptrater').create;

function createCommitSummaryAnalyzer(opts) {
  var excerptRater;

  if (opts && opts.excerptRater) {
    excerptRater = opts.excerptRater;
  }
  else {
    excerptRater = createExcerptRater({
      // !! Disabling word lookup stuff for now. It's just too slow and 
      // doesn't really distinguish good stuff from bad stuff that well.
      wordnok: {
        getWordFrequencies: function dummyGetWordFrequences(words, done) {
          conformAsync.callBackOnNextTick(done, null, words.map(getZero));
        }
      }
    });
  }

  function analyze(commitSummary, done) {
    var analysis = _.pick(commitSummary, 'sha', 'url');

    for (feature in codefeatures.identifiers) {
      var instances = findInPatches(
        commitSummary, codefeatures.identifiers[feature].regexes
      );

      var moreInstances = runFnsOnPatches(
        commitSummary,
        codefeatures.identifiers[feature].findFns
      );

      if (moreInstances) {
        instances = instances.concat(moreInstances);
      }

      if (instances.length > 0) {
        analysis[feature] = instances.map(createExcerptAnalysisWithCode);
      }
    }
    excerptRater.rateAnalysis(analysis, done);
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

  function runFnsOnPatches(commitSummary, fns) {
    var targets = [];
    if (fns && commitSummary && commitSummary.patches) {
      for (var i = 0; i < fns.length; ++i) {
        for (var j = 0; j < commitSummary.patches.length; ++j) {
          var findings = _.compact(fns[i](commitSummary.patches[j]));
          targets = targets.concat(findings);
        }
      }
    }
    return targets;
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

function createExcerptAnalysisWithCode(code) {
  return {
    code: code
  };
}

function getZero() {
  return 0;
}

module.exports = {
  create: createCommitSummaryAnalyzer,
  createExcerptAnalysisWithCode: createExcerptAnalysisWithCode
};
