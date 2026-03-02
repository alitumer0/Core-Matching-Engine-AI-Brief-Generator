export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow AI brief generation up to 60s
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';

const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext: () => ({}),
    });

export { handler as GET, handler as POST };
