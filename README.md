codesampler
==================

Samples publicly available code from Github.

Installation
------------

Clone this repo.

Then, create a `config.js` file in the project root that contains your Github, [Twitter API keys](https://apps.twitter.com/), and [Wordnik API key](http://developer.wordnik.com/). Example:

    module.exports = {
      github: {
        user: 'wizard',
        pass: 'magic'
      },
      twitter: {
        consumer_key: 'asdfkljqwerjasdfalpsdfjas',
        consumer_secret: 'asdfasdjfbkjqwhbefubvskjhfbgasdjfhgaksjdhfgaksdxvc',
        access_token: '9999999999-zxcvkljhpoiuqwerkjhmnb,mnzxcvasdklfhwer',
        access_token_secret: 'opoijkljsadfbzxcnvkmokwertlknfgmoskdfgossodrh'
      },
      wordnikAPIKey: 'mkomniojnnuibiybvuytvutrctrxezewarewetxyfcftvuhbg'
    };

Usage
-----

    make run

Tests
-----

Run tests with `make test`.

License
-------

MIT.
