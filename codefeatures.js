var identifiers = {
  comments: {
    regexes: [
      /[^https*:]\/\/.*[^\n]+/g, // C-style
      /""".*"""/g, // Long Python comments
      // /#.*[^\n]+/g // Python, shell.
    ]
  },
  functions: {
    regexes: [
      /function\s*.*\(.*\).*[^\n]/g, // JS
      /fn\s*.*\(.*\).*[^\n]/g, // Rust
      /func\s*.*\(.*\).*[^\n]/g, // Swift
      /def\s\w+\(.*\):/g // Python
    ]
  },
  logStatements: {
    regexes: [
      /console\.log\(.*\)/g, // JS
      /NSLog\(.*\);/g, // Objective-C
      /dump\(.*\)/g, // Misc.
      /stderr.write\(.*\)/g, // Node
      /debug\(.*\)/g, // Misc.
    ]
  },
  // assignments: {
  //   regexes: [
  //     /((var|int|char)\s*)*\w(\w|\d)*\s*=[^=]\s*[\w\d\[\]\'"]+/g
  //   ]
  // },
  classes: {
    regexes: [
      /(class|struct)\s+\w[\w\d-]*.*{*/g
    ]
  }
};

var featureProbabilities = {
  comments: 30,
  functions: 40,
  // Prefer this if it actually is present, which it usually isn't.
  logStatements: 200,
  // assignments: 5,
  classes: 30
};

module.exports = {
  identifiers: identifiers,
  featureProbabilities: featureProbabilities
};
