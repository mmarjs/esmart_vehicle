module.exports = {
  extends: 'airbnb',
  parser: "vue-eslint-parser",
  parserOptions: {
    sourceType: 'module',
  },
  extends: [
    "plugin:vue/vue3-essential",
  ],
  root: true,
  env: {
    node: true,
    browser: true
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
};