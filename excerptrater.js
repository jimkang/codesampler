var _ = require('lodash');
var queue = require('queue-async');
var createWordnok = require('wordnok');
var changeCase = require('change-case');
var config = require('./config');

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

    if (rated.functions) {
      q.defer(addWordStatsToExcerpts, rated.functions);
    }
    if (rated.comments) {
      q.defer(addWordStatsToExcerpts, rated.comments);
    }

    q.await(function attachResultsToRated(error, functions, comments) {
      if (error) {
        done(error);        
      }
      else {
        if (isNonEmptyArray(functions)) {
          rated.functions = functions;
        }
        if (isNonEmptyArray(comments)) {
          rated.comments = comments;
        }
        done(error, rated);
      }
    });
  }

  function addWordStatsToExcerpts(excerpts, done) {
    var q = queue(2);
    excerpts.forEach(function queueLookup(excerpt) {
      q.defer(addWordStatsToExcerpt, excerpt);
    });
    q.awaitAll(done);
  }

  function addWordStatsToExcerpt(excerpt, done) {
    // TODO: Caching.
    var ratebleText = excerpt.code.substr(0, numberOfCharsToScanInEachExcerpt);
    var spaceSeparatedCode = changeCase.sentenceCase(ratebleText);
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
  debugger;
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
