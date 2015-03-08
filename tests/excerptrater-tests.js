var test = require('tape');
var createExcerptRater = require('../excerptrater').create;
var createExcerptAnalysisWithCode = require('../commit-summary-analyzer').createExcerptAnalysisWithCode;
var conformAsync = require('conform-async');

test('Rate functions', function rateFunctions(t) {
  var unratedAnalysis = [
    "function validateEmailAddress (emailAddress) {",
    "function likeUser(data, cb) {",
    "function findUmatched(data, uuid) {",
    "function matches(data, uuid) {",
    "function usersLikes(userData) {",
    "function usersDislikes(userData) {",
    "function goToLoginPage() {",
    'fn write_stream<T: Stream>(stream: &mut BufferedStream<T>, data: &Vec<u8>) {',
    'func TransportFor(config *Config) (http.RoundTripper, error) {'
  ]
  .map(createExcerptAnalysisWithCode);

  var expectedAnalysis = {
    functions: [
      {
        code: 'function validateEmailAddress (emailAddress) {',
        numberOfReadableWords: 1,
        rarityOfWords: 12.429216196844383
      },
      {
        code: 'function likeUser(data, cb) {',
        numberOfReadableWords: 2,
        rarityOfWords: 23.472138032568875
      },
      {
        code: 'function findUmatched(data, uuid) {',
        numberOfReadableWords: 3,
        rarityOfWords: 33.99181172452882
      },
      {
        code: 'function matches(data, uuid) {',
        numberOfReadableWords: 4,
        rarityOfWords: 44.17168734289797
      },
      {
        code: 'function usersLikes(userData) {',
        numberOfReadableWords: 5,
        rarityOfWords: 54.098891422051416
      },
      {
        code: 'function usersDislikes(userData) {',
        numberOfReadableWords: 6,
        rarityOfWords: 63.82474036569796
      },
      {
        code: 'function goToLoginPage() {',
        numberOfReadableWords: 7,
        rarityOfWords: 73.38314233452348
      },
      {
        code: 'fn write_stream<T: Stream>(stream: &mut BufferedStream<T>, data: &Vec<u8>) {',
        numberOfReadableWords: 8,
        rarityOfWords: 82.79819724131637
      },
      {
        code: 'func TransportFor(config *Config) (http.RoundTripper, error) {',
        numberOfReadableWords: 9,
        rarityOfWords: 92.08792457557347
      }
    ]
  };

  t.plan(expectedAnalysis.functions.length + 1);

  function checkAnalysis(error, ratedAnalysis) {
    t.ok(!error, 'No error occurs while rating analysis.');

    ratedAnalysis.functions.forEach(checkExcerptAnalysis);

    function checkExcerptAnalysis(excerptAnalysis, i) {
      t.deepEqual(
        excerptAnalysis,
        expectedAnalysis.functions[i],
        'Function excerpt analysis is correct.'
      );
    }
  }

  var getWordFrequenciesCallCount = 0;

  var mockWordnok = {
    getWordFrequencies: function mockGetWordFrequencies(words, done) {
      var frequencies = [];
      getWordFrequenciesCallCount += 1;
      for (var i = 0; i < getWordFrequenciesCallCount; ++i) {
        frequencies.push(getWordFrequenciesCallCount);
      }
      conformAsync.callBackOnNextTick(done, null, frequencies);
    }
  };

  var judge = createExcerptRater({
    wordnok: mockWordnok
  });

  judge.rateAnalysis(
    {
      functions: unratedAnalysis
    },
    checkAnalysis
  );
});
