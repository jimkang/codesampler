var createSampleCommitStream = require('./sample-commit-stream').create;
var createSummaryAnalyzer = require('./commit-summary-analyzer').create;
var createAnalysisToExcerptStream = require('./analysis-to-excerpt-stream').create;
var seedrandom = require('seedrandom');
var createProbable = require('probable').createProbable;
var createExcerptPicker = require('./excerptpicker').create;

var createAnalysisStream = createSummaryAnalyzer().createAnalysisStream;

function createSampleAnalyzeExcerptStream(done) {
  var probable = createProbable({
    random: seedrandom((new Date).getTime().toString())
  });
  var excerptPicker = createExcerptPicker({
    probable: probable
  });

  var excerptStream = createAnalysisToExcerptStream({
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
      analysisStream.pipe(excerptStream);
      done(null, excerptStream);
    }
  });
}

module.exports = {
  create: createSampleAnalyzeExcerptStream
};
