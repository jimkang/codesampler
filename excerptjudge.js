function createExcerptJudge() {
  function scoreExcerpt(excerpt) {
    excerpt.score = getScoreForExcerpt(excerpt);
    return excerpt;
  }

  function getScoreForExcerpt(excerpt) {
    var score = 0;
    if (excerpt.rarityOfWords > 80) {
      score += (excerpt.rarityOfWords - 80);
    }
    if (excerpt.numberOfReadableWords > 10) {
      score += Math.min(excerpt.numberOfReadableWords - 10, 10);
    }
    switch (excerpt.featureType) {
      case 'preprocessors':
        score += 12;
        break;
      case 'logStatements':
        score += 8;
        break;
      case 'functions':
        score += 5;
        break;
      case 'comments':
        // If word analysis ever comes back, this can probably be dropped.
        score += 7;
        break;
    }
    return score;
  }

  return {
    scoreExcerpt: scoreExcerpt
  };
}

module.exports = {
  create: createExcerptJudge
};
