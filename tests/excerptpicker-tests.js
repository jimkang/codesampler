var test = require('tape');
var createExcerptPicker = require('../excerptpicker').create;
var _ = require('lodash');
var conformAsync = require('conform-async');

var testComments = [
  '\t// BufferedReader br = new BufferedReader(new FileReader(new\r',
  '\t// File(DOCIDX)));\r',
  '\t// TODO Auto-generated catch block\r',
  '\t// TODO Auto-generated catch block\r'
];

var testFunctions1 = [
  'function() {',
  'function() {',
  'function(active_calls_by_agent) {',
  'function(agent_name, call_duration) {',
  'function() {',
  'function() {',
  'function() {',
  'function(active_calls_by_agent) {',
  'function(agent_name, call_duration) {',
  'function() {'
];

var testFunctions2 = [
  'function() {',
  'function(xml) {',
  'function(xml) {',
  'function(xml) {',
  'function() {',
  'function() {',
  'function(xml) {',
  'function(xml) {',
  'function() {',
  'function() {',
  'function(calls, agents) {',
  'function(realtime, agents) {',
  'function(agent_id, call_duration) {',
  'function(agent_id, stats) {',
  'function(active_calls_by_agent) {',
  'function(json) {',
  'function(agent_name, call_duration) {',
  'function(agent_id, info) {',
  'function() {',
  'function(xml) {',
  'function(xml) {',
  'function(xml) {',
  'function() {',
  'function() {',
  'function(xml) {',
  'function(xml) {',
  'function() {',
  'function() {',
  'function(calls, agents) {',
  'function(realtime, agents) {',
  'function(agent_id, call_duration) {',
  'function(agent_id, stats) {',
  'function(active_calls_by_agent) {',
  'function(json) {',
  'function(agent_name, call_duration) {',
  'function(agent_id, info) {'
];

test('Pick from analysis with only functions', function onlyFunctions(t) {
  t.plan(2);

  var excerptPicker = createExcerptPicker({
    probable: {
      pickFromArray: function mockPickFromArray(array) {
        t.deepEqual(
          array,
          [
            'function(active_calls_by_agent) {',
            'function(agent_name, call_duration) {',
          ],
          'Chooses from filtered, uniquified functions.'
        );

        return array[0];
      }
    }
  });

  excerptPicker(
    {
      functions: testFunctions1
    },
    function checkExcerpt(error, excerpt) {
      t.equal(
        excerpt,
        'function(active_calls_by_agent) {',
        'Chooses an excerpt.'
      );
    }
  );

});

test('Pick from analysis with only comments', function onlyComments(t) {
  t.plan(2);

  var excerptPicker = createExcerptPicker({
    probable: {
      pickFromArray: function mockPickFromArray(array) {
        t.deepEqual(
          array,
          [
            '\t// BufferedReader br = new BufferedReader(new FileReader(new\r',
            '\t// File(DOCIDX)));\r',
            '\t// TODO Auto-generated catch block\r',
          ],
          'Chooses from uniquified comments.'
        );

        return array[0];
      }
    }
  });

  excerptPicker(
    {
      comments: testComments
    },
    function checkExcerpt(error, excerpt) {
      t.equal(
        excerpt,
        '\t// BufferedReader br = new BufferedReader(new FileReader(new\r',
        'Chooses an excerpt.'
      );
    }
  );
});

test('Pick from analysis with functions and comments', function both(t) {
  t.plan(2);

  var pickCallCount = 0;

  var excerptPicker = createExcerptPicker({
    probable: {
      pickFromArray: function mockPickFromArray(array) {
        if (pickCallCount == 1) {
          t.deepEqual(
            array,
            [
              'function(xml) {',
              'function(calls, agents) {',
              'function(realtime, agents) {',
              'function(agent_id, call_duration) {',
              'function(agent_id, stats) {',
              'function(active_calls_by_agent) {',
              'function(json) {',
              'function(agent_name, call_duration) {',
              'function(agent_id, info) {'
            ],
            'Chooses from uniquified and filtered functions.'
          );
        }

        pickCallCount += 1;

        return array[0];
      }
    }
  });

  excerptPicker(
    {
      functions: testFunctions2,
      comments: testComments
    },
    function checkExcerpt(error, excerpt) {
      t.equal(excerpt, 'function(xml) {', 'Chooses an excerpt.');
    }
  );
});

test('Filter choices using specified filter', function filterUsed(t) {
  t.plan(2);

  var pickCallCount = 0;

  var excerptPicker = createExcerptPicker({
    excerptFilter: function isNotUsingAgentId(excerpts, done) {
      var filtered = excerpts.filter(function isNotUsingAgentId(excerpt) {
        return excerpt.indexOf('agent_id') === -1;
      });
      debugger;
      conformAsync.callBackOnNextTick(done, null, filtered);
    },
    probable: {
      pickFromArray: function mockPickFromArray(array) {
        if (pickCallCount == 1) {
          t.deepEqual(
            array,
            [
              'function(xml) {',
              'function(calls, agents) {',
              'function(realtime, agents) {',
              'function(active_calls_by_agent) {',
              'function(json) {',
              'function(agent_name, call_duration) {',
            ],
            'Chooses from uniquified and filtered functions.'
          );
        }

        pickCallCount += 1;

        return array[0];
      }
    }
  });

  excerptPicker(
    {
      functions: testFunctions2,
      comments: testComments
    },
    function checkExcerpt(error, excerpt) {
      t.equal(excerpt, 'function(xml) {', 'Chooses an excerpt.');
    }
  );
});
