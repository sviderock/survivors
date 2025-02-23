import { defineConfig } from '@solidjs/start/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { comlink } from 'vite-plugin-comlink';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
	middleware: './src/middleware.ts',
	server: {
		experimental: {
			websocket: true,
		},
	},
	solid: {
		babel: {
			compact: true,
		},
	},

	vite: {
		ssr: { external: ['drizzle-orm'] },
		plugins: [tsconfigPaths(), comlink()],
		worker: {
			plugins: () => [comlink()],
		},
	},
}).addRouter({
	name: '_ws',
	type: 'http',
	handler: './src/ws.ts',
	target: 'server',
	base: '/_ws',
	plugins: () => [tsconfigPaths()],
});
