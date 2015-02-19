var _ = require('lodash');
var Readable = require('stream').Readable;

function createCommitSeeker(ctorOpts) {
  var request;

  if (ctorOpts && ctorOpts.request) {
    request = ctorOpts.request;
  }

  function getCommitURLsFromEventResponse(eventResponse, done) {
    var payloads = _.pluck(eventResponse, 'payload');
    var commits = _.compact(_.flatten(_.pluck(payloads, 'commits')));
    return _.pluck(commits, 'url');
  }

  function createCommitStream(opts) {
    if (!opts || !opts.URLs) {
      throw new Error('createCommitStream not give opts.URLs');
    }

    var maxConcurrentRequests = 3;
    if (opts.maxConcurrentRequests) {
      maxConcurrentRequests = opts.maxConcurrentRequests;
    }

    var URLs = opts.URLs;

    var stream = Readable({
      objectMode: true
    });

    var started = false;
    var responsesReceived = 0;
    var queuedURLs = [];
    var outstandingRequests = 0;

    function makeRequest(url) {
      if (outstandingRequests >= maxConcurrentRequests) {
        queuedURLs.push(url);
      }
      else {
        outstandingRequests += 1;
        request(url, saveCommitFromResponse);
      }
    }

    function dequeueURL(url) {
      var index = queuedURLs.indexOf(url);
      if (index !== -1) {
        queuedURLs.splice(index, 1);
      }

      if (queuedURLs.length > 0) {
        makeRequest(queuedURLs.shift());
      }
    }

    function saveCommitFromResponse(error, response, body) {
      responsesReceived += 1;
      outstandingRequests -= 1;

      if (error) {
        console.log(error, error.stack);
      }
      else {
        stream.push(body);
      }
      if (responsesReceived >= URLs.length) {
        stream.push(null);
      }

      dequeueURL(response.url);
    }

    stream._read = function readFromStream() {
      if (!started) {
        started = true;
        URLs.forEach(makeRequest);
      }
    };

    return stream;
  }

  return {
    getCommitURLsFromEventResponse: getCommitURLsFromEventResponse,
    createCommitStream: createCommitStream
  };
}

module.exports = {
  create: createCommitSeeker
};
