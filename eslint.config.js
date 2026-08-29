const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const importPlugin = require('eslint-plugin-import');
const unusedImports = require('eslint-plugin-unused-imports');
const prettierConfig = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'reports/**',
      'test-results/**',
      'evidence/**',
      'allure-results/**',
      'app/android/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs['recommended-type-checked'].rules,
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { vars: 'all', args: 'after-used', argsIgnorePattern: '^_' },
      ],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'no-console': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.object.name='browser'][callee.property.name='pause']",
          message: 'browser.pause is not allowed. Use an explicit wait instead.',
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['*.js', 'eslint.config.js', 'prettier.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
  prettierConfig,
];
