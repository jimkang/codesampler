var GitHubApi = require('github');
var _ = require('lodash');
var commitsFromEvents = require('./commits-from-events');
var createBodyHeadwaters = require('url-body-stream').create;
var request = require('request');
var config = require('./config.js');
var through2 = require('through2');

function createSampleCommitStream(opts, done) {
  var github;
  var urlBodyHeadwaters;

  if (opts) {
    if (opts.github) {
      github = opts.github;
    }
    if (opts.urlBodyHeadwaters) {
      urlBodyHeadwaters = opts.urlBodyHeadwaters;
    }
  }
  
  if (!github) {
    github = new GitHubApi({
      version: '3.0.0',
      protocol: 'https',
      timeout: 5000,
      headers: {
      'user-agent': 'codesampler'
      }
    });
  }

  if (!urlBodyHeadwaters) {
    urlBodyHeadwaters = createBodyHeadwaters({
      request: request,
      authParams: config.github,
      parseJson: true
    });
  }

  github.authenticate({
    type: 'basic',
    username: config.github.user,
    password: config.github.pass
  });

  github.events.get(
    {
      page: 1,
      per_page: 30
    },
    getCommitSummariesFromEvents
  );

  function getCommitSummariesFromEvents(error, res) {
    if (error) {
      done(error);
    }

    var bodyStream = urlBodyHeadwaters.createURLBodyStream({
      urls: commitsFromEvents(res)
    });

    var summaryStream = through2(
      {
        objectMode: true
      },
      transformCommitBodyToSummary
    );

    bodyStream.pipe(summaryStream);

    done(null, summaryStream);
  }
}

function transformCommitBodyToSummary(body, encoding, callback) {
  this.push(createCommitSummary(body));
  callback();
}

function createCommitSummary(commit) {
  var patches = _.compact(_.pluck(commit.files, 'patch'));
  var formattedPatches = patches.map(formatPatch);

  return {
    sha: commit.sha,
    url: commit.html_url,
    patches: formattedPatches
  };
}

function formatPatch(patch) {
  var replacement = patch.replace(/\\n/g, '\n');
  return replacement;
}

module.exports = {
  create: createSampleCommitStream
};
