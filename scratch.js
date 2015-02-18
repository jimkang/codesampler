var GitHubApi = require("github");
var _ = require('lodash');
var queue = require('queue-async');

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

github.events.get(
            {
                page: 1,
                per_page: 30
            },
            function(err, res) {
                console.log(JSON.stringify(res, null, '  '));
                var payloads = _.pluck(res, 'payload');
                var commits = _.compact(_.flatten(_.pluck(payloads, 'commits')));
                var commitURLs = _.pluck(commits, 'url');
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
