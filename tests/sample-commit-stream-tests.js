var test = require('tape');
var createSampleCommitStream = require('../sample-commit-stream').create;
var conformAsync = require('conform-async');
var Readable = require('stream').Readable;
// var jsonfile = require('jsonfile');

// var sampe = jsonfile.readFileSync(__dirname + '/sample-commits.json');

var commits = [
  {
    sha: '29a',
    html_url: 'http://cool-stuff.beef',
    extraneous: 'metametametadata',
    files: [
      {
        name: 'wizard.js',
        patch: '++//var wizard = createWizard();\nwizard.blast();'
      },
      {
        name: 'magick.txt',
        patch: 'First, install some crystals.\\nThen, activate them.'
      }
    ]
  },
  {
    sha: 'a5d3',
    html_url: 'http://butts.butt',
    files: [
      {
        name: 'butt.php',
        patch: '<? butt(); ?>'
      }
    ]
  },
  {
    sha: '7896',
    html_url: 'http://github.com/commits/this-one',
    files: [
      {
        name: 'SmRotatingColoredBarsController.m',
        patch: '++[[ColorBar setColor:[UIColor red]] refresh];\\nNSLog("hey");'
      },
      {
        name: 'balloons.pch',
        patch: '--//TODO.'
      },
      {
        name: 'balloons.plist',
        patch: '<xml>\\n<something>ok</something>'
      }
    ]
  }  
];

var expectedSummaryPatches = [
  [
    '++//var wizard = createWizard();\nwizard.blast();',
    'First, install some crystals.\nThen, activate them.'
  ],
  [
    '<? butt(); ?>'
  ],
  [
    '++[[ColorBar setColor:[UIColor red]] refresh];\nNSLog("hey");',
    '--//TODO.',
    '<xml>\n<something>ok</something>'
  ]
];

test('Get sample commit stream', function sampleCommitStreamTest(t) {
  t.plan(11);

  createSampleCommitStream(
    {
      github: {
        authenticate: function noOp() {
        },
        events: {
          get: function mockGet(optsThatWillBeIgnored, done) {
            conformAsync.callBackOnNextTick(done, null, {});
          }
        }
      },
      urlBodyHeadwaters: {
        createURLBodyStream: function mockCreateURLBodyStream(opts) {
          var stream = Readable({
            objectMode: true
          });

          stream._read = function readFromStream() {
            process.nextTick(function pushStuff() {
              // The fact that this would fail without bind is an example of 
              // prototypal inheritance's fragililty.
              commits.forEach(stream.push.bind(stream));
              stream.push(null);
            });
          };

          return stream;
        }
      }
    },
    function checkSampleCommitStream(error, sampleCommitStream) {
      t.ok(!error, 'Creates stream without error.');

      var summaryIndex = 0;

      sampleCommitStream.on('data', function checkCommitSummary(summary) {
        t.equal(summary.sha, commits[summaryIndex].sha, 'SHA is correct.');
        t.equal(summary.url, commits[summaryIndex].html_url, 'URL is correct.');
        t.deepEqual(
          summary.patches, 
          expectedSummaryPatches[summaryIndex],
          'Patches are correct.'
        );

        summaryIndex += 1;
      });

      sampleCommitStream.on('end', function endTest() {
        t.pass('Stream ends.');
      });      
    }
  );

});
