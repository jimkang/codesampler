var _ = require('lodash');
var queue = require('queue-async');
var createWordnok = require('wordnok');
var changeCase = require('change-case');
var config = require('./config');
var codeFeatures = require('./codefeatures');
var conformAsync = require('conform-async');

var featureNames = Object.keys(codeFeatures.identifiers);

function createExcerptRater(opts) {
  var wordnok = createWordnok({
    apiKey: config.wordnikAPIKey
  });

  if (opts && opts.wordnok) {
    wordnok = opts.wordnok;
  }

  var numberOfCharsToScanInEachExcerpt = 200;

  if (opts && opts.numberOfCharsToScanInEachExcerpt) {
    numberOfCharsToScanInEachExcerpt = opts.numberOfCharsToScanInEachExcerpt;
  }

  function rateAnalysis(analysis, done) {
    var rated = _.cloneDeep(analysis);

    var q = queue(1);

    featureNames.forEach(function queueAddWordStats(feature) {
      q.defer(addWordStatsToExcerpts, rated[feature]);
    });

    q.awaitAll(function attachResultsToRated(error, featureExcerptGroups) {
      if (error) {
        done(error);
      }
      else {
        featureNames.forEach(function attachExcerptsForFeature(feature, i) {
          var featureExcerpts = featureExcerptGroups[i];
          if (isNonEmptyArray(featureExcerpts)) {
            rated[feature] = featureExcerpts;
          }
        });
        done(error, rated);
      }
    });
  }

  function addWordStatsToExcerpts(excerpts, done) {
    if (!Array.isArray(excerpts)) {
      conformAsync.callBackOnNextTick(done, null);
      return;
    }

    var q = queue(2);
    excerpts.forEach(function queueLookup(excerpt) {
      q.defer(addWordStatsToExcerpt, excerpt);
    });
    q.awaitAll(done);
  }

  function addWordStatsToExcerpt(excerpt, done) {
    // TODO: Caching.
    var ratableText = excerpt.code.substr(0, numberOfCharsToScanInEachExcerpt);
    var spaceSeparatedCode = changeCase.sentenceCase(ratableText);
    var words = getWordTokensFromCode(spaceSeparatedCode);
    words = _.uniq(words);

    wordnok.getWordFrequencies(words, function addFrequencies(error, freqs) {
      if (error) {
        done(error);
      }
      else {
        excerpt.rarityOfWords = rarityFromFrequencies(freqs);
        excerpt.numberOfReadableWords = _.compact(freqs).length;
        done(error, excerpt);
      }
    });
  }

  return {
    rateAnalysis: rateAnalysis
  };
}

function isNonEmptyArray(array) {
  return (array && Array.isArray(array) && array.length > 0);
}

function rarityFromFrequencies(frequencies) {
  var noZeroes = _.compact(frequencies);
  var logged = noZeroes.map(Math.log);
  var inverses = logged.map(invertFrequency);

  return inverses.reduce(add, 0);
}

function add(memo, number) {
  return memo + number;
}

var maxFrequency = Math.log(250000);

function invertFrequency(frequency) {
  return maxFrequency - frequency;
}

var wordRegex = /\w+/g;

var keywords = [
  'function',
  'func',
  'fn'
];

// Assumes word is lowercase.
function notAKeyword(word) {
  return (keywords.indexOf(word) === -1);
}

function getWordTokensFromCode(code) {
  var justWordsFromCode = code.match(wordRegex);
  var tokens = [];
  if (justWordsFromCode) {
    tokens = justWordsFromCode.filter(notAKeyword);
  }
  return tokens;
}

module.exports = {
  create: createExcerptRater  
};
