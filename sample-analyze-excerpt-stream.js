var createSampleCommitStream = require('./sample-commit-stream').create;
var createSummaryAnalyzer = require('./commit-summary-analyzer').create;
var createAnalysisToPostableStream = require('./analysis-to-postable-stream').create;
var seedrandom = require('seedrandom');
var createProbable = require('probable').createProbable;
var createExcerptPicker = require('./excerptpicker').create;
var createAlreadyUsedFilter = require('./already-used-filter').create;

var createAnalysisStream = createSummaryAnalyzer().createAnalysisStream;

function createSampleAnalyzeExcerptStream(opts, done) {
  var db;

  if (opts) {
    db = opts.db;
  }
  if (!db) {
    throw new Error('No db passed to createSampleAnalyzeExcerptStream.');
  }

  var probable = createProbable({
    random: seedrandom((new Date).getTime().toString())
  });
  var excerptPicker = createExcerptPicker({
    probable: probable,
    filter: createAlreadyUsedFilter({
      db: db
    })
  });

  var postableStream = createAnalysisToPostableStream({
    excerptPicker: excerptPicker,
    log: console.log
  });

  var analysisStream = createAnalysisStream();

  createSampleCommitStream({}, function connectPipe(error, sampleCommitStream) {
    if (error) {
      done(error);
    }
    else {
      sampleCommitStream.pipe(analysisStream);
      analysisStream.pipe(postableStream);
      done(null, postableStream);
    }
  });
}

module.exports = {
  create: createSampleAnalyzeExcerptStream
};
