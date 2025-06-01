module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true  // 'process' 변수를 사용할 수 있도록 node 환경 추가
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
  },
  globals: {
    process: true  // 'process' 전역 변수 추가
  }
}
