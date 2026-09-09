const config = {
  extends: ['@commitlint/config-conventional'],
  // GitHub's standard Co-authored-by trailer is longer than conventional's 100-char default.
  rules: {
    'footer-max-line-length': [2, 'always', 120],
  },
};

export default config;
