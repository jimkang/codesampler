var _ = require('lodash');

function createCommitSeeker(opts) {
  var request;

  if (opts && opts.request) {
    request = opts.request;
  }

  function getCommitURLsFromEventResponse(eventResponse, done) {
    var payloads = _.pluck(eventResponse, 'payload');
    var commits = _.compact(_.flatten(_.pluck(payloads, 'commits')));
    return _.pluck(commits, 'url');
  }

  return {
    getCommitURLsFromEventResponse: getCommitURLsFromEventResponse
  };
}

module.exports = {
  create: createCommitSeeker
};
