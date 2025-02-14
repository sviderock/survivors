import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import solid from 'eslint-plugin-solid';
import tseslint from 'typescript-eslint';

/**
 * @type {import('typescript-eslint').Config}
 */
const config = [
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	solid.configs['flat/typescript'],
	eslintConfigPrettier,
];

export default config;
