var TwitModule = require('twit');

function createTweetPoster(opts) {
  var Twit = TwitModule;
  var log = console.log;

  var localCodePostedCache = {};

  if (opts) {
    if (opts.log) {
      log = opts.log;
    }
  }

  var twit = new Twit(opts.twitterConfig);

  function postTweet(text, done) {
    if (text in localCodePostedCache) {
      log('Already posted in this run:', text);
    }
    else if (opts.dryRun) {
      log('Would have tweeted:', text);
      localCodePostedCache[text] = true;
    }
    else {
      twit.post(
        'statuses/update',
        {
          status: text
        },
        function tweetDone(twitterError, data, response) {
          if (twitterError) {
            log(twitterError);
            log('data:', data);
          }
          else {
            localCodePostedCache[text] = true;
            log('Posted to Twitter:', text);
          }
          done(twitterError);
        }
      );
    }
  }

  return postTweet;
}

module.exports = {
  create: createTweetPoster
};
