var test = require('tape');
var createExcerptRater = require('../../excerptrater').create;
var createExcerptAnalysisWithCode = require('../../commit-summary-analyzer').createExcerptAnalysisWithCode;
var conformAsync = require('conform-async');

test('Rate functions', function rateFunctions(t) {
  var unratedAnalysis = {
    functions: 
      [
        'if !flag(BuildDemo)'
      ]
      .map(createExcerptAnalysisWithCode)
  };

  var expectedRatings = [
    {
      numberOfReadableWords: 4,
      rarityOfWords: 24.61202774745051
    }
  ];

  t.plan(2 * expectedRatings.length + 1);

  function checkAnalysis(error, ratedAnalysis) {
    t.ok(!error, 'No error occurs while rating analysis.');

    ratedAnalysis.functions.forEach(checkExcerptAnalysis);

    function checkExcerptAnalysis(excerptAnalysis, i) {
      t.equal(
        excerptAnalysis.numberOfReadableWords,
        expectedRatings[i].numberOfReadableWords,
        'The number of readable words is correct.'
      );
      t.equal(
        excerptAnalysis.rarityOfWords,
        expectedRatings[i].rarityOfWords,
        'The rarity of words is correct.'
      );
    }
  }

  var judge = createExcerptRater();

  judge.rateAnalysis(unratedAnalysis, checkAnalysis);
});
