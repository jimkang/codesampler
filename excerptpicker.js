var probable = require('probable');
var _ = require('lodash');
var conformAsync = require('conform-async');
var featureProbabilities = require('./codefeatures').featureProbabilities;

function createExcerptPicker(opts) {
  var createRangeTableFromDict = probable.createRangeTableFromDict;
  var pickFromArray = probable.pickFromArray;
  var excerptFilter;

  if (opts) {
    if (opts.createRangeTableFromDict) {
      createRangeTableFromDict = opts.createRangeTableFromDict;
    }
    if (opts.excerptFilter) {
      excerptFilter = opts.excerptFilter;
    }
    if (opts.pickFromArray) {
      pickFromArray = opts.pickFromArray;
    }
  }
  
  return function pickExcerptFromAnalysis(analysis, done) {
    var chosenExcerptType;
    var choices;

    var presentFeatures = _.intersection(
      Object.keys(analysis), Object.keys(featureProbabilities)
    );

    if (presentFeatures.length < 1) {
      conformAsync.callBackOnNextTick(done, null, null);
      return;
    }

    var featureTable = createRangeTableFromDict(
      _.pick.apply(_, [featureProbabilities].concat(presentFeatures))
    );

    var chosenExcerptType = featureTable.roll();
    choices = _.uniq(analysis[chosenExcerptType]);

    if (chosenExcerptType === 'functions') {
      choices = choices.filter(filterBoringFunctions);
    }

    var choice;
    
    if (excerptFilter) {
      excerptFilter(choices, function pickFromFiltered(error, filteredChoices) {
        if (error) {
          done(error);
        }
        else {
          choice = pickFromArray(filteredChoices);
          done(null, choice);
        }
      });
    }
    else {
      choice = pickFromArray(choices);
      conformAsync.callBackOnNextTick(done, null, choice);
    }
  }
}

function filterBoringFunctions(fn) {
  var isOK = true;

  if (fn.match(noParamAnonymousRegex)) {
    isOK = false;
  }

  return isOK;
}

var noParamAnonymousRegex = /function\s*\(\s*\)/;

module.exports = {
  create: createExcerptPicker
};
