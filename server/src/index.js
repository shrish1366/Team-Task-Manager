const app = require('./app');
const prisma = require('./config/prisma');

const PORT = parseInt(process.env.PORT) || 5000;

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

main();
