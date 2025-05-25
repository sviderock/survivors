import { ConvexClient } from "convex/browser";

const convexClient = new ConvexClient(process.env.VITE_CONVEX_URL);
export default convexClient;
