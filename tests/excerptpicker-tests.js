var test = require('tape');
var createExcerptPicker = require('../excerptpicker').create;
var _ = require('lodash');
var conformAsync = require('conform-async');
var createExcerptAnalysisWithCode = require('../commit-summary-analyzer').createExcerptAnalysisWithCode;

var testComments = [
  '\t// BufferedReader br = new BufferedReader(new FileReader(new\r',
  '\t// File(DOCIDX)));\r',
  '\t// TODO Auto-generated catch block\r',
  '\t// TODO Auto-generated catch block\r'
]
.map(createExcerptAnalysisWithCode);

var testFunctions1 = [
  'function(active_calls_by_agent) {',
  'function(agent_name, call_duration) {',
  'function(active_calls_by_agent) {',
  'function(agent_name, call_duration) {',
]
.map(createExcerptAnalysisWithCode);

var testFunctions2 = [
  'function(xml) {',
  'function(xml) {',
  'function(xml) {',
  'function(xml) {',
  'function(xml) {',
  'function(calls, agents) {',
  'function(realtime, agents) {',
  'function(agent_id, call_duration) {',
  'function(agent_id, stats) {',
  'function(active_calls_by_agent) {',
  'function(json) {',
  'function(agent_name, call_duration) {',
  'function(agent_id, info) {',
  'function(xml) {',
  'function(xml) {',
  'function(xml) {',
  'function(xml) {',
  'function(xml) {',
  'function(calls, agents) {',
  'function(realtime, agents) {',
  'function(agent_id, call_duration) {',
  'function(agent_id, stats) {',
  'function(active_calls_by_agent) {',
  'function(json) {',
  'function(agent_name, call_duration) {',
  'function(agent_id, info) {'
]
.map(createExcerptAnalysisWithCode);

function mockCreateTableThatPicksFunctions() {
  return {
    roll: function mockRoll() {
      return 'functions';
    }
  };
}

test('Pick from analysis with only functions', function onlyFunctions(t) {
  t.plan(2);

  var excerptPicker = createExcerptPicker(
    {
      createRangeTableFromDict: mockCreateTableThatPicksFunctions,
      pickFromArray: function mockPickFromArray(array) {
        t.deepEqual(
          _.pluck(array, 'code'),
          [
            'function(active_calls_by_agent) {',
            'function(agent_name, call_duration) {',
          ],
          'Chooses from filtered, uniquified functions.'
        );
        return array[0];
      }
    }
  );

  excerptPicker(
    {
      functions: testFunctions1
    },
    function checkExcerpt(error, excerpt) {
      t.equal(
        excerpt.code,
        'function(active_calls_by_agent) {',
        'Chooses an excerpt.'
      );
    }
  );

});

test('Pick from analysis with only comments', function onlyComments(t) {
  t.plan(2);

  var excerptPicker = createExcerptPicker(
    {
      createRangeTableFromDict: function mockCreateRangeTableFromDict() {
        return {
          roll: function mockRoll() {
            return 'comments';
          }
        };
      },
      pickFromArray: function mockPickFromArray(array) {
        t.deepEqual(
          _.pluck(array, 'code'),
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
  );

  excerptPicker(
    {
      comments: testComments
    },
    function checkExcerpt(error, excerpt) {
      t.equal(
        excerpt.code,
        '\t// BufferedReader br = new BufferedReader(new FileReader(new\r',
        'Chooses an excerpt.'
      );
    }
  );
});

test('Pick from analysis with functions and comments', function both(t) {
  t.plan(2);

  var excerptPicker = createExcerptPicker(
    {
      createRangeTableFromDict: mockCreateTableThatPicksFunctions,
      pickFromArray: function mockPickFromArray(array) {
        t.deepEqual(
          _.pluck(array, 'code'),
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

        return array[0];
      }
    }
  );

  excerptPicker(
    {
      functions: testFunctions2,
      comments: testComments
    },
    function checkExcerpt(error, excerpt) {
      t.equal(excerpt.code, 'function(xml) {', 'Chooses an excerpt.');
    }
  );
});

test('Filter choices using specified filter', function filterUsed(t) {
  t.plan(2);

  var excerptPicker = createExcerptPicker(
    {
      excerptFilter: function isNotUsingAgentId(excerpts, done) {
        var filtered = excerpts.filter(function isNotUsingAgentId(excerpt) {
          return excerpt.code.indexOf('agent_id') === -1;
        });
        conformAsync.callBackOnNextTick(done, null, filtered);
      },
      createRangeTableFromDict: mockCreateTableThatPicksFunctions,
      pickFromArray: function mockPickFromArray(array) {
        t.deepEqual(
          _.pluck(array, 'code'),
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

        return array[0];
      }
    }
  );

  excerptPicker(
    {
      functions: testFunctions2,
      comments: testComments
    },
    function checkExcerpt(error, excerpt) {
      t.equal(excerpt.code, 'function(xml) {', 'Chooses an excerpt.');
    }
  );
});
