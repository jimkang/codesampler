var _ = require('lodash');
var Readable = require('stream').Readable;
var queue = require('queue-async');

function createCommitHeadwaters(ctorOpts) {
  var request;
  var authParams;

  if (ctorOpts) {
    if (ctorOpts.request) {
      request = ctorOpts.request;
    }
    if (ctorOpts.authParams) {
      authParams = ctorOpts.authParams;
    }
  }

  if (!request) {
    throw new Error('No request object provided.');
  }

  function getCommitURLsFromEventResponse(eventResponse, done) {
    var payloads = _.pluck(eventResponse, 'payload');
    var commits = _.compact(_.flatten(_.pluck(payloads, 'commits')));
    return _.pluck(commits, 'url');
  }

  function createCommitStream(opts) {
    if (!opts || !opts.urls) {
      throw new Error('createCommitStream not give opts.urls');
    }

    var maxConcurrentRequests = 3;
    if (opts.maxConcurrentRequests) {
      maxConcurrentRequests = opts.maxConcurrentRequests;
    }

    var urls = opts.urls;

    var stream = Readable({
      objectMode: true
    });

    var started = false;
    var responsesReceived = 0;
    var queuedURLs = [];
    var outstandingRequests = 0;

    function makeRequest(url, tellQueueDone) {
      // if (outstandingRequests >= maxConcurrentRequests) {
      //   queuedURLs.push(url);
      // }
      // else {
      //   outstandingRequests += 1;
        var requestOpts = {
          url: url,
          headers: {
            'user-agent': 'commit-seeker'
          }
        };

        if (authParams) {
          requestOpts.auth = authParams;
        }

        function saveCommitFromResponse(error, response, body) {
          // responsesReceived += 1;
          // outstandingRequests -= 1;

          if (!error) {
            stream.push(body);
          }
          // if (responsesReceived >= URLs.length) {
          //   console.log('URLs.length:', URLs.length);
          //   console.log('responsesReceived:', responsesReceived);
          //   stream.push(null);
          // }

          // dequeueURL(response.url);
          tellQueueDone(error);
        }

        request(requestOpts, saveCommitFromResponse);
      // }
    }

    // function dequeueURL(url) {
    //   var index = queuedURLs.indexOf(url);
    //   if (index !== -1) {
    //     queuedURLs.splice(index, 1);
    //   }

    //   if (queuedURLs.length > 0) {
    //     makeRequest(queuedURLs.shift());
    //   }
    // }

    var q = queue(maxConcurrentRequests);

    function queueRequest(url) {
      q.defer(makeRequest, url);
    }

    function endStream(error) {
      if (error) {
        console.log(error, error.stack);
      }
      stream.push(null);
    }

    stream._read = function readFromStream() {
      if (!started) {
        started = true;
        urls.forEach(queueRequest);
        q.awaitAll(endStream);
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
  create: createCommitHeadwaters
};
