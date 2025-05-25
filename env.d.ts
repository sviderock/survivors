/// <reference types="vinxi/types/client" />

interface ImportMetaEnv {
  SESSION_SECRET: string;
  DB_URL: string;
  VITE_CONVEX_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly SESSION_SECRET: string;
    readonly DB_URL: string;
    readonly VITE_CONVEX_URL: string;
  }
}
