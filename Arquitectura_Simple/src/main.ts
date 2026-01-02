import { buildContainer } from '@composition/container';
import { buildServer } from '@infrastructure/http/server';

async function main(): Promise<void> {
    try {
        // Composition Root - Dependency Injection
        const dependencies = buildContainer();

        // Build server with injected dependencies
        const server = buildServer(dependencies);

        const host = process.env.HOST || '127.0.0.1';
        const port = parseInt(process.env.PORT || '3000', 10);

        await server.listen({ host, port });

        // eslint-disable-next-line no-console
        console.log(`🚀 Server running at http://${host}:${port}`);
        // eslint-disable-next-line no-console
        console.log(`📋 Health check: http://${host}:${port}/check`);
        // eslint-disable-next-line no-console
        console.log(`📦 Orders API: http://${host}:${port}/orders`);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    // eslint-disable-next-line no-console
    console.log('🛑 SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    // eslint-disable-next-line no-console
    console.log('🛑 SIGINT received, shutting down gracefully');
    process.exit(0);
});

main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('💥 Unhandled error in main:', error);
    process.exit(1);
});
