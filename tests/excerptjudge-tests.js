var test = require('tape');
var createJudge = require('../excerptjudge').create;
var _ = require('lodash');

test('Score excerpts', function scoreExcerpts(t) {
  var excerpts = [
    {
      rarityOfWords: 25,
      numberOfReadableWords: 5,
      featureType: 'functions'
    },
    {
      rarityOfWords: 90,
      numberOfReadableWords: 11,
      featureType: 'comments'
    },
    {
      rarityOfWords: 5,
      numberOfReadableWords: 3,
      featureType: 'preprocessors'
    },
    {
      rarityOfWords: 99,
      numberOfReadableWords: 2,
      featureType: 'logStatements'
    },
    {
      rarityOfWords: 50,
      numberOfReadableWords: 2,
      featureType: 'functions'
    }
  ];

  var expectedScores = [
    5,
    18,
    12,
    27,
    5,
  ];

  t.plan(excerpts.length);

  var judge = createJudge();
  var judgedExcerpts = _.cloneDeep(excerpts).map(judge.scoreExcerpt);

  judgedExcerpts.forEach(function checkScore(judgedExcerpt, i) {
    t.equal(judgedExcerpt.score, expectedScores[i], 'Score is correct.');
  });
});
