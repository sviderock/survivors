import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/singlestore';

const pool = mysql.createPool(process.env.DB_URL);
export const db = drizzle({ client: pool });
