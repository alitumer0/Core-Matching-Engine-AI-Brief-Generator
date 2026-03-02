import { router, publicProcedure } from '../trpc';
import { matchingRouter } from './matching';
import { briefRouter } from './brief';

export const appRouter = router({
    healthcheck: publicProcedure.query(() => {
        return 'ok';
    }),
    matching: matchingRouter,
    brief: briefRouter,
});

export type AppRouter = typeof appRouter;
