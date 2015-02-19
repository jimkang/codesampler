var _ = require('lodash');

function getCommitURLsFromEventResponse(eventResponse) {
  var payloads = _.pluck(eventResponse, 'payload');
  var commits = _.compact(_.flatten(_.pluck(payloads, 'commits')));
  return _.pluck(commits, 'url');
}

module.exports = getCommitURLsFromEventResponse;
