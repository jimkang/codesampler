var defaultProbable = require('probable');
var _ = require('lodash');
var conformAsync = require('conform-async');

function createExcerptPicker(opts) {
  var probable = defaultProbable;
  var excerptFilter;

  if (opts) {
    if (opts.probable) {
      probable = opts.probable;
    }
    if (opts.excerptFilter) {
      excerptFilter = opts.excerptFilter;
    }
  }
  
  return function pickExcerptFromAnalysis(analysis, done) {
    var chosenExcerptType;
    var fns = analysis.functions;
    var comments = analysis.comments;
    var choices;

    if (fns && comments) {
      chosenExcerptType = probable.pickFromArray(['fns', 'comments']);
    }
    else if (fns) {
      chosenExcerptType = 'fns';
    }
    else {
      chosenExcerptType = 'comments';
    }

    if (chosenExcerptType === 'fns') {
      choices = _.uniq(fns);
      choices = choices.filter(filterBoringFunctions);
    }
    else {
      choices = _.uniq(comments);
    }
    
    if (excerptFilter) {
      excerptFilter(choices, function pickFromFiltered(error, filteredChoices) {
        if (error) {
          done(error);
        }
        else {
          done(null, probable.pickFromArray(filteredChoices));
        }
      });
    }
    else {
      conformAsync.callBackOnNextTick(
        done, null, probable.pickFromArray(choices)
      );
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
