import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import prettierPlugin from 'eslint-plugin-prettier'

export default defineConfig([
	...js.configs.recommended,
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
])
