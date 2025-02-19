/// <reference types="vinxi/types/client" />

interface ImportMetaEnv {
	SESSION_SECRET: string;
	DB_URL: string;
	VITE_REOWN_PROJECT_ID: string;
	VITE_ZERION_API_URL: string;
	VITE_ZERION_API_KEY: string;
	REFERRER_ADDRESS: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
	interface ProcessEnv {
		readonly SESSION_SECRET: string;
		readonly DB_URL: string;
		readonly VITE_REOWN_PROJECT_ID: string;
		readonly VITE_ZERION_API_URL: string;
		readonly VITE_ZERION_API_KEY: string;
		readonly REFERRER_ADDRESS: string;
	}
}
