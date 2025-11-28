const js = require('@eslint/js')
const tsParser = require('@typescript-eslint/parser')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const prettierPlugin = require('eslint-plugin-prettier')

module.exports = [
	js.configs.recommended,

	{
		files: ['src/**/*.ts'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 'latest'
			}
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			prettier: prettierPlugin
		},
		rules: {
			...tsPlugin.configs.recommended.rules,

			// нужные правки:
			'no-undef': 'off', // TS проверяет это лучше, чем ESLint

			// Твоя конфигурация:
			'prettier/prettier': 'error',
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/no-explicit-any': 'off'
		}
	}
]
