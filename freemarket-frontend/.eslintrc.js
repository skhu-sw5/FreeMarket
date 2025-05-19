
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  plugins: ['vue'],
  rules: {
    'vue/multi-word-component-names': ['error', {
      ignores: []
    }],
    'no-unused-vars': 'warn',
    'no-console': 'off'
  }
}
