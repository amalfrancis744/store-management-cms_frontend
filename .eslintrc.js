module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'prettier', // Keep prettier last to avoid conflicts
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './tsconfig.json',
  },

};
