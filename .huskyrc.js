module.exports = {
  hooks: {
    'pre-commit': 'run-p test lint format',
    'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS',
  },
}

