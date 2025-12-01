const js = require('@eslint/js')
const tsParser = require('@typescript-eslint/parser')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const prettierPlugin = require('eslint-plugin-prettier')

module.exports = [
	{
		ignores: ['eslint.config.cjs']
	},

	js.configs.recommended,

	{
		files: ['src/**/*.ts'],

		languageOptions: {
			parser: tsParser,
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 'latest'
			},
			globals: {
				require: 'readonly',
				module: 'readonly',
				__dirname: 'readonly',
				process: 'readonly'
			}
		},

		plugins: {
			'@typescript-eslint': tsPlugin,
			prettier: prettierPlugin
		},

		rules: {
			...tsPlugin.configs.recommended.rules,
			'no-undef': 'off',
			'prettier/prettier': 'error',
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/no-explicit-any': 'off'
		}
	}
]
