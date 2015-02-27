var defaultProbable = require('probable');
var _ = require('lodash');

function createExcerptPicker(opts) {
  var probable = defaultProbable;

  if (opts && opts.probable) {
    probable = opts.probable;
  }

  return function pickExcerptFromAnalysis(analysis) {
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

    return probable.pickFromArray(choices);
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
