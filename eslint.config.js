import pluginJs from '@eslint/js';
import pluginQuery from '@tanstack/eslint-plugin-query';
import eslintConfigPrettier from 'eslint-config-prettier';
import solid from 'eslint-plugin-solid';
import tseslint from 'typescript-eslint';

/**
 * @type {import('typescript-eslint').Config}
 */
const config = [
	...pluginQuery.configs['flat/recommended'],
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	solid.configs['flat/typescript'],
	eslintConfigPrettier,
	{
		rules: {
			'@typescript-eslint/consistent-type-imports': ['warn', { fixStyle: 'inline-type-imports' }],
		},
	},
];

export default config;
