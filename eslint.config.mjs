import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      prettier
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly'
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'error',

      // React rules
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Accessibility rules
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',

      // Custom rules to prevent nested <p> elements
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXElement[openingElement.name.name="Typography"] JSXElement[openingElement.name.name="Typography"]',
          message: 'Avoid nesting Typography components as they both render <p> elements by default, which creates invalid HTML.'
        },
        {
          selector: 'JSXElement[openingElement.name.name="ListItemText"] JSXAttribute[name.name="secondary"] JSXElement[openingElement.name.name="Typography"]',
          message: 'Do not use Typography component inside ListItemText secondary prop. ListItemText renders secondary as <p>, and Typography also renders as <p> by default, creating invalid nested <p> elements. Use Box component instead.'
        },
        {
          selector: 'JSXElement[openingElement.name.name="ListItemText"] JSXAttribute[name.name="primary"] JSXElement[openingElement.name.name="Typography"]',
          message: 'Do not use Typography component inside ListItemText primary prop. ListItemText renders primary as <span>, but avoid Typography nesting for consistency. Use Box component instead.'
        },
        {
          selector: 'JSXElement[openingElement.name.name="ListItemText"] JSXAttribute[name.name="secondary"] JSXElement[openingElement.name.name="Box"][openingElement.attributes.1.value.value="div"]',
          message: 'Do not use Box component="div" inside ListItemText secondary prop. ListItemText renders secondary as <p>, creating invalid nested <div> inside <p>. Use Box component="span" instead.'
        },
        {
          selector: 'JSXElement[openingElement.name.name="ListItemText"] JSXAttribute[name.name="secondary"] JSXElement[openingElement.name.name="div"]',
          message: 'Do not use div elements inside ListItemText secondary prop. ListItemText renders secondary as <p>, creating invalid nested <div> inside <p>. Use span elements instead.'
        }
      ]
    }
  }
];
