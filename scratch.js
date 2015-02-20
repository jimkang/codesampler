var GitHubApi = require("github");
var _ = require('lodash');
var commitsFromEvents = require('./commits-from-events');
var createCommitHeadwaters = require('./commit-stream').create;
var request = require('request');
var config = require('./config.js');

var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    // debug: true,
    protocol: "https",
    // host: "github.my-GHE-enabled-company.com",
    // pathPrefix: "/api/v3", // for some GHEs
    timeout: 5000,
    headers: {
        "user-agent": "My-Cool-GitHub-App-smidgeo" // GitHub is happy with a unique user agent
    }
});

github.authenticate({
    type: "basic",
    username: config.github.user,
    password: config.github.pass
});

github.events.get(
            {
                page: 1,
                per_page: 30
            },
            function(error, res) {
                if (error) {
                  console.log(error);
                }

                var commitHeadwaters = createCommitHeadwaters({
                  request: request,
                  authParams: config.github
                });

                var commitStream = commitHeadwaters.createCommitStream({
                  urls: commitsFromEvents(res)
                });

                commitStream.on('data', function checkData(commit) {
                  var commit = JSON.parse(commit);
                  var patches = _.compact(_.pluck(commit.files, 'patch'));
                  formattedPatches = patches.map(function formatPatch(patch) {
                    var replacement = patch.replace(/\\n/g, '\n');
                    return replacement;
                  });

                  
                  formattedPatches.forEach(function logIt(formattedPatch) {
                    console.log(formattedPatch);
                  });
                });

                commitStream.on('end', function onEnd() {
                    console.log('Stream complete!');
                });

                // console.log(JSON.stringify(res, null, '  '));
                // var payloads = _.pluck(res, 'payload');
                // var commits = _.compact(_.flatten(_.pluck(payloads, 'commits')));
                // var commitURLs = _.pluck(commits, 'url');
                // console.log(commitURLs);
                // // other assertions go here
                // Assert.equal(err, null);
                // Assert.ok(res.length > 1);
                // Assert.equal(typeof res[0].type, "string");
                // Assert.equal(typeof res[0].created_at, "string");
                // Assert.equal(typeof res[0]["public"], "boolean");
                // Assert.equal(typeof res[0].id, "string");
                // Assert.ok("actor" in res[0]);
                // Assert.ok("repo" in res[0]);
                // next();
            }
);
