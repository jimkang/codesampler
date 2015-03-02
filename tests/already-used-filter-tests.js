var test = require('tape');
var createAlreadyUsedFilter = require('../already-used-filter').create;
var conformAsync = require('conform-async');

var usedList = [
  'function done(error, result) {',
  'function (event) {'
];

function mockIsUsed(text, done) {
  conformAsync.callBackOnNextTick(done, null, usedList.indexOf(text) !== -1);
}

test('Filter out used choices', function filterUsed(t) {
  t.plan(1);

  var filter = createAlreadyUsedFilter({
    db: {
      topicWasUsedInTribute: mockIsUsed
    }
  });

  filter(
    [
      'func something(bulbabulba) {',
      'function (d) {',
      'function done(error, result) {',
      'fn helloWorld(d)',
      'function (event) {'      
    ],
    function done(error, filtered) {
      t.deepEqual(
        filtered,
        [
          'func something(bulbabulba) {',
          'function (d) {',
          'fn helloWorld(d)'
        ]
      );
    }
  );
});
