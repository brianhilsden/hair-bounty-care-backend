import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { startJobs } from './jobs';

const PORT = env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Hair Bounty Care API is running!`);
      console.log(`📍 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`🔗 API: http://localhost:${PORT}/api/${env.API_VERSION}`);
      console.log(`💚 Health: http://localhost:${PORT}/api/${env.API_VERSION}/health\n`);
      startJobs();
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
