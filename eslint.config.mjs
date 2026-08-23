import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'public/**', 'out/**', 'next.config.js'],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  reactPlugin.configs.flat.recommended,
  reactHooksPlugin.configs.flat['recommended-latest'],
  nextPlugin.configs.recommended,
  {
    plugins: {
      import: importPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        node: {
          paths: ['components', 'utils'],
        },
      },
    },
    rules: {
      'react/no-unknown-property': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-no-target-blank': 'off',
      'jsx-a11y/alt-text': ['warn', { elements: ['img'], img: ['Image'] }],
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',

      'react/jsx-props-no-spreading': 'off',
      'react/static-property-placement': 'off',
      'react/jsx-filename-extension': 'off',
      'react/forbid-prop-types': 'off',
      'no-param-reassign': 'off',
      'no-underscore-dangle': 'off',
      'import/no-unresolved': 'off',
      'react/state-in-constructor': 'off',
      'react/jsx-fragments': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'react/require-default-props': 'off',
      'react/button-has-type': 'off',
      'react/destructuring-assignment': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'react/no-access-state-in-setstate': 'off',
      'react/no-array-index-key': 'off',
      'no-restricted-globals': 'off',
      'react/sort-comp': 'off',
      'import/prefer-default-export': 'off',
      'import/extensions': 'off',
      'import/no-anonymous-default-export': 'off',
      '@next/next/no-img-element': 'off',
      'react-hooks/exhaustive-deps': 'off',

      // React Compiler lint rules, new in eslint-plugin-react-hooks v7 (pulled in by
      // eslint-config-next 16). They flag 14 real but pre-existing findings in state,
      // effect and memoization code. Deferred so the Next 16 upgrade stays isolated -
      // turn these back on one at a time when addressing them.
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/purity': 'off',
    },
  },
  prettierConfig,
];
