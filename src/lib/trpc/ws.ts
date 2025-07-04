import { createBunWSHandler } from "trpc-bun-adapter";
import { appRouter, createContext } from "./router";

const websocket = createBunWSHandler({
  router: appRouter,
  createContext,
  onError: (error: any) => {
    console.error(JSON.stringify(error, null, 2));
  },
  // batching: { enabled: true },
});

Bun.serve({
  port: 3001,
  fetch(request, server) {
    if (server.upgrade(request, { data: { req: request } })) {
      return;
    }

    return new Response("Please use websocket protocol", { status: 404 });
  },
  websocket,
});
