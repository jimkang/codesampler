var defaultProbable = require('probable');
var _ = require('lodash');
var conformAsync = require('conform-async');

function createExcerptPicker(opts) {
  var probable = defaultProbable;

  if (opts && opts.probable) {
    probable = opts.probable;
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

    conformAsync.callBackOnNextTick(done, null, probable.pickFromArray(choices));
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
