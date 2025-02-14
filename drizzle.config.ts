import type { Config } from 'drizzle-kit';

export default {
	dialect: 'singlestore',
	schema: './drizzle/schema.ts',
	dbCredentials: { url: process.env.DB_URL },
} satisfies Config;
