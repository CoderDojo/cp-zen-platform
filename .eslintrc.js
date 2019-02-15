module.exports = {
  root: true,
  extends: ['coderdojo', 'eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        semi: true,
        trailingComma: 'es5',
      },
    ],
  },
};
