var cStyleCommentRegex = /\/\/.*[^\n]/g;
var httpLength = 'http:'.length;
var httpsLength = 'https:'.length;

var identifiers = {
  comments: {
    regexes: [,
      /""".*"""/g, // Long Python comments
      // /#.*[^\n]+/g // Python, shell.
    ],
    findFns: [
      function findCommentsInPatch(patch) {
        var comments = [];
        var results;

        while ((results = cStyleCommentRegex.exec(patch)) !== null) {
          if (results.index >= httpsLength &&
            patch.substr(results.index - httpsLength)
            .indexOf('https://') === 0) {
              // It's a url, not a comment.
              continue;
          }
          if (results.index >= httpLength &&
            patch.substr(results.index - httpLength).indexOf('http://') === 0) {
              // It's a url, not a comment.
              continue;
          }
          comments.push(results[0]);
        }
        return comments;
      }
    ]
  },
  functions: {
    regexes: [
      /function\s*\w[\w\d_].*\(.*[^\n]/g, // JS
      /fn\s*.*\(.*\).*[^\n]/g, // Rust
      /func[^tion]\s*.*\(.*\).*[^\n]/g, // Swift
      /def\s\w+\(.*\):/g // Python
    ]
  },
  logStatements: {
    regexes: [
      /console\.log\((.*)\)/g, // JS
      /NSLog\((.*)\);/g, // Objective-C
      /dump\((.*)\)/g, // Misc.
      /stderr.write\((.*)\)/g, // Node
      /debug\((.*)\)/g, // Misc.
    ]
  },
  // assignments: {
  //   regexes: [
  //     /((var|int|char)\s*)*\w(\w|\d)*\s*=[^=]\s*[\w\d\[\]\'"]+/g
  //   ]
  // },
  classes: {
    regexes: [
      /(?:class|struct)\s+\w[\w\d-]*.*{*/g
    ]
  },
  controlFlow: {
    regexes: [
      /(?:if|while)[\s|\(].*\n/g,
      /\bfor\s*\(.*\n/g,
      /\w[\w\d_]*\.(?:forEach|map|reduce).*\n/g
    ]
  },
  preprocessors: {
    regexes: [
      /#(?:define|ifdef|if|else|elif|ifndef).*\n/g
    ]
  }
};

var featureProbabilities = {
  comments: 0, //30,
  functions: 0, //40,
  // Prefer this if it actually is present, which it usually isn't.
  logStatements: 200,
  // assignments: 5,
  classes: 0, //10,
  controlFlow: 0, //5,
  preprocessors: 0 //300
};

module.exports = {
  identifiers: identifiers,
  featureProbabilities: featureProbabilities
};
