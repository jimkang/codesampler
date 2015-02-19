var test = require('tape');
var createCommitSeeker = require('../commit-stream').create;
var conformAsync = require('conform-async');
var _ = require('lodash');

test('Commit stream from URLs', function commitStream(t) {
  urls = [
    "https://api.github.com/repos/mikermcneil/sails-hook-apianalytics/commits/e62de63b967911c5e196cc50d2aa959ff411c89f",
    "https://api.github.com/repos/mikermcneil/sails-hook-apianalytics/commits/06f75a7826fafa9a50fbd16514e12314e167d505",
    "https://api.github.com/repos/mikermcneil/sails-hook-apianalytics/commits/8010103587c553efbcf9cd48ec322a20c93df414",
    "https://api.github.com/repos/kdemi/business-services-child-theme/commits/9ab822e00fba27ab4ca7f5e33f486388b7f434ab",
    "https://api.github.com/repos/asakusuma/ember-pods-shared/commits/a19c16bc956878b37fe53c5884a945719d983b0b",
    "https://api.github.com/repos/martinhynar/blackhair/commits/6ce9963b7c871280afead261503a7bf023d7d113",
    "https://api.github.com/repos/rhodgkins/RDHCollectionViewGridLayout/commits/12cd62c13f818676413035941dabd03aff8514f0",
    "https://api.github.com/repos/rhodgkins/RDHCollectionViewGridLayout/commits/4f8f6f71241f0c238599c66575be56b198066c52",
    "https://api.github.com/repos/solomonatron/jetswengine/commits/0ad2fcca947dc7bdd629ebeb3bd610fd01b0a178",
    "https://api.github.com/repos/Soostone/aws-cloudfront/commits/a4eea4122db8fbffe4cf2050c77280a71ae7b26c",
    "https://api.github.com/repos/sepro/small_projects/commits/9f35d9e4def25d9e0046369efc0428fcf696e081",
    "https://api.github.com/repos/wikimedia/mediawiki-extensions-ContactPage/commits/28886112b16771f2e276e2ee00d66815183e6903",
    "https://api.github.com/repos/guerillaMan/mustached-boo/commits/431e37fd70bb165194f71043cf963dba05df224a",
    "https://api.github.com/repos/onsi/ginkgo/commits/926f5d5854aa867dd8a35f781cc91155606de227",
    "https://api.github.com/repos/onsi/ginkgo/commits/e57363034d6f4d61cd9ef0b6917f69ad03977914",
    "https://api.github.com/repos/AQM-WorkshopRepo/Berk_Kirikoglu_AQM/commits/0596cd6475c1261efb6fa111aca37fa19d165e70",
    "https://api.github.com/repos/unl/UNL_UndergraduateBulletin/commits/096c70c326cea11ac0b1f1fcca3557894e75a9b8",
    "https://api.github.com/repos/unl/UNL_UndergraduateBulletin/commits/f53693c73d0d3b14dc8b7f26e51923eb378decda",
    "https://api.github.com/repos/unl/UNL_UndergraduateBulletin/commits/38350ab785a319a60014f05aaf4e7efc8504fb93",
    "https://api.github.com/repos/apiaryio/protagonist/commits/494e165ddbac78eaa1bc454d29f7c54f49f17afb",
    "https://api.github.com/repos/marcin-saja/utils/commits/5ccf33833ccc16886d32f8698251d39c723a6753"
  ];

  var mockCommits = [];

  for (var i = 0; i < urls.length; ++i) {
    mockCommits.push({
      sha: i.toString()
    });
  }

  var authParams = {
    user: 'smidgeo',
    pass: 'skerpin'
  };

  t.plan(mockCommits.length * 2);

  var mockRequestIndex = 0;
  var emittedCommits = [];

  var c = 0;

  var seeker = createCommitSeeker({
    request: function mockRequest(opts, done) {
      c += 1;
      t.deepEqual(opts.auth, authParams, 'Uses basic auth params in request.');

      conformAsync.callBackOnNextTick(done,
        null,
        {
          url: opts.url
        },
        mockCommits[mockRequestIndex]
      );
      mockRequestIndex += 1;
    },
    authParams: authParams
  });

  var commitStream = seeker.createCommitStream({
    urls: urls
  });

  commitStream.on('data', function checkData(commit) {
    emittedCommits.push(commit);
  });

  commitStream.on('end', function onEnd() {
    console.log('Called request', c, 'times.');

    mockCommits.forEach(function findMockCommitInEmittedCommits(mockCommit) {
      t.ok(
        _.findWhere(emittedCommits, mockCommit),
        'Commit received from request was emitted.'
      );
    });
  });
});
