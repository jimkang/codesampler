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
      {code: 'func something(bulbabulba) {'},
      {code: 'function (d) {'},
      {code: 'function done(error, result) {'},
      {code: 'fn helloWorld(d)'},
      {code: 'function (event) {'     } 
    ],
    function done(error, filtered) {
      t.deepEqual(
        filtered,
        [
          {code: 'func something(bulbabulba) {'},
          {code: 'function (d) {'},
          {code: 'fn helloWorld(d)'}
        ]
      );
    }
  );
});
