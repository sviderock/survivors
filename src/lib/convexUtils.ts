// import type { ConvexClient } from "convex/browser";
// import type { FunctionReference } from "convex/server";
// import { type Context, createContext, from, useContext } from "solid-js";

// type EmptyObject = Record<string, never>;
// type OptionalRestArgs<FuncRef extends FunctionReference<any>> = FuncRef["_args"] extends EmptyObject
//   ? [args?: EmptyObject]
//   : [args: FuncRef["_args"]];

// export const ConvexContext: Context<ConvexClient | undefined> = createContext();

// export function createQuery<Query extends FunctionReference<"query">>(
//   query: Query,
//   ...args: OptionalRestArgs<Query>
// ): Query["_returnType"] {
//   const convex = useContext(ConvexContext);
//   if (convex === undefined) {
//     throw "No convex context";
//   }

//   let fullArgs = args ?? {};
//   return from((setter) => {
//     const unsubber = convex.onUpdate(query, fullArgs, setter);
//     return unsubber;
//   });
// }

// export function createMutation<Mutation extends FunctionReference<"mutation">>(mutation: Mutation) {
//   const convex = useContext(ConvexContext);
//   if (convex === undefined) {
//     throw "No convex context";
//   }

//   return (args: Mutation["_args"]) => {
//     let fullArgs = args ?? {};
//     return convex.mutation(mutation, fullArgs);
//   };
// }

// export function createAction<Action extends FunctionReference<"action">>(
//   action: FunctionReference<"action">
// ) {
//   const convex = useContext(ConvexContext);
//   if (convex === undefined) {
//     throw "No convex context";
//   }
//   return (...args: Action["_args"]) => {
//     let fullArgs = args ?? {};
//     return convex.action(action, fullArgs);
//   };
// }
