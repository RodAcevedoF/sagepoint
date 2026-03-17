import { setupServer } from "msw/node";

/**
 * Shared MSW server — starts empty.
 * Each test file adds its own handlers via `server.use(...)`.
 */
export const server = setupServer();
