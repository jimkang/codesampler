var TwitModule = require('twit');

function createTweetPoster(opts) {
  var Twit = TwitModule;
  var log = console.log;

  if (opts) {
    if (opts.log) {
      log = opts.log;
    }
  }

  var twit = new Twit(opts.twitterConfig);

  function postTweet(text) {
    if (opts.dryRun) {
      log('Would have tweeted:', text);
    }
    else {
      twit.post(
        'statuses/update',
        {
          status: text
        },
        function done(twitterError, data, response) {
          if (twitterError) {
            log(twitterError);
            log('data:', data);
          }
          else {
            log('Posted to Twitter:', text);
          }
        }
      );
    }
  }

  return postTweet;
}

module.exports = {
  create: createTweetPoster
};
