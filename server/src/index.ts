import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createCodeCheckpointInputSchema, 
  updateCodeCheckpointInputSchema,
  searchCodeCheckpointsInputSchema 
} from './schema';

// Import handlers
import { createCodeCheckpoint } from './handlers/create_code_checkpoint';
import { getCodeCheckpoints } from './handlers/get_code_checkpoints';
import { getCodeCheckpointById } from './handlers/get_code_checkpoint_by_id';
import { searchCodeCheckpoints } from './handlers/search_code_checkpoints';
import { updateCodeCheckpoint } from './handlers/update_code_checkpoint';
import { deleteCodeCheckpoint } from './handlers/delete_code_checkpoint';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Create a new code checkpoint
  createCodeCheckpoint: publicProcedure
    .input(createCodeCheckpointInputSchema)
    .mutation(({ input }) => createCodeCheckpoint(input)),

  // Get all code checkpoints
  getCodeCheckpoints: publicProcedure
    .query(() => getCodeCheckpoints()),

  // Get a specific code checkpoint by ID
  getCodeCheckpointById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getCodeCheckpointById(input.id)),

  // Search code checkpoints with various filters
  searchCodeCheckpoints: publicProcedure
    .input(searchCodeCheckpointsInputSchema)
    .query(({ input }) => searchCodeCheckpoints(input)),

  // Update an existing code checkpoint
  updateCodeCheckpoint: publicProcedure
    .input(updateCodeCheckpointInputSchema)
    .mutation(({ input }) => updateCodeCheckpoint(input)),

  // Delete a code checkpoint
  deleteCodeCheckpoint: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteCodeCheckpoint(input.id)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`Code Checkpoints TRPC server listening at port: ${port}`);
}

start();