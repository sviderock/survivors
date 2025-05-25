import { createTRPCClient, createWSClient, wsLink } from "@trpc/client";
import SuperJSON from "superjson";
import type { AppRouter } from "~/lib/trpc/router";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    wsLink<AppRouter>({
      client: createWSClient({
        url: "ws://localhost:3001",
        onOpen: () => {
          console.log("open");
        },
        onError(evt) {
          console.log("errror");
        },
        onClose(cause) {
          console.log("close");
        },
      }),
      transformer: SuperJSON,
    }),
  ],
});
