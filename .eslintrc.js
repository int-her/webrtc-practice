module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: [
    'airbnb',
    'airbnb-typescript',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    'no-console': 'off',
    'import/prefer-default-export': 'off',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'parent', 'sibling'],
        'newlines-between': 'always',
      },
    ],
    'react/jsx-boolean-value': 'off',
    'react-hooks/exhaustive-deps': 'error',
  },
}
