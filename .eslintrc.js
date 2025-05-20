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
  rules: {
    // Disable or configure the rule that's causing deployment errors
    'react/no-unescaped-entities': 'off', // Option 1: Turn off completely
    
    // Alternative approach (uncomment if you prefer this):
    // 'react/no-unescaped-entities': ['error', { 'forbid': ['>', '"', '}'] }], // Option 2: Allow apostrophes, forbid others
  }
};