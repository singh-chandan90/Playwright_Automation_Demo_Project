import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.ts', '**/*.js'],
    ignores: [
      'node_modules/',
      'test-results/',
      'playwright-report/',
      'dist/',
      'build/'
    ],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2021,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'playwright': playwright,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...playwright.configs.recommended.rules,
    },
  },
  prettier,
];
