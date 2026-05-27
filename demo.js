const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('./app');

const startDemoServer = async () => {
  try {
    console.log('Starting in-memory MongoDB Server for manual testing...');
    // Create an in-memory database instance
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    await mongoose.connect(uri);
    console.log('MOCK MongoDB Connected (In-Memory Database Ready!)');
    
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Demo Server running on port ${PORT}`);
      console.log(`You can now test endpoints using Postman or curl at http://localhost:${PORT}/api/users`);
      console.log('Press Ctrl+C to stop the server.');
    });

    // Handle process termination cleanly
    const shutdown = async () => {
      console.log('\nShutting down demo server...');
      await mongoose.disconnect();
      await mongoServer.stop();
      server.close(() => {
        console.log('Server stopped cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    console.error('Error starting demo server:', error);
    process.exit(1);
  }
};

startDemoServer();
