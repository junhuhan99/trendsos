require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Routes
const authRoutes = require('./src/routes/auth');
const operatorRoutes = require('./src/routes/operator');
const serviceRoutes = require('./src/routes/service');

// Blockchain layers
const bdidChain = require('./src/blockchain/bdid');
const fabricChain = require('./src/blockchain/fabric');
const ethereumLayer = require('./src/blockchain/ethereum');
const ipfsLayer = require('./src/blockchain/ipfs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BlockPass Ω API is running',
    timestamp: new Date().toISOString(),
    blockchain: {
      bdid: {
        chainLength: bdidChain.getChain().length,
        isValid: bdidChain.validateChain()
      },
      fabric: fabricChain.getChainStats(),
      ethereum: ethereumLayer.getAuditStats(),
      ipfs: ipfsLayer.getStorageStats()
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/operator', operatorRoutes);
app.use('/api/service', serviceRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'BlockPass Ω API',
    version: '1.0.0',
    description: 'Blockchain-based Login Infrastructure',
    slogan: '보이지 않는 블록체인이 당신의 로그인 뒤에서 작동한다.',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      operator: '/api/operator',
      service: '/api/service'
    },
    documentation: 'https://github.com/junhuhan99/tendsos'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize blockchain layers
async function initializeBlockchain() {
  try {
    console.log('[Blockchain] Initializing blockchain layers...');

    // Ethereum layer
    await ethereumLayer.initialize(
      process.env.ETHEREUM_RPC_URL,
      process.env.ETHEREUM_PRIVATE_KEY,
      process.env.CONTRACT_ADDRESS
    );

    // IPFS layer
    await ipfsLayer.initialize({
      host: process.env.IPFS_HOST || 'localhost',
      port: process.env.IPFS_PORT || 5001,
      protocol: process.env.IPFS_PROTOCOL || 'http'
    });

    console.log('[Blockchain] All blockchain layers initialized');
  } catch (error) {
    console.error('[Blockchain] Initialization error:', error.message);
    console.log('[Blockchain] Running in simulation mode');
  }
}

// Start server
async function startServer() {
  try {
    // Initialize blockchain
    await initializeBlockchain();

    // Start HTTP server
    app.listen(PORT, () => {
      console.log('');
      console.log('='.repeat(60));
      console.log('  BlockPass Ω - Blockchain-based Login Infrastructure');
      console.log('='.repeat(60));
      console.log('');
      console.log(`  🚀 Server running on port ${PORT}`);
      console.log(`  🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  🔗 API URL: http://localhost:${PORT}`);
      console.log(`  ✅ Health check: http://localhost:${PORT}/health`);
      console.log('');
      console.log('  📚 API Endpoints:');
      console.log(`     - POST   /api/auth/register       (User registration)`);
      console.log(`     - POST   /api/auth/login          (User login)`);
      console.log(`     - GET    /api/auth/verify         (Session verification)`);
      console.log(`     - POST   /api/operator/register   (Operator registration)`);
      console.log(`     - POST   /api/operator/login      (Operator login)`);
      console.log(`     - POST   /api/service/register    (Service registration)`);
      console.log(`     - GET    /api/service/list        (List services)`);
      console.log('');
      console.log('  🔐 Blockchain Layers:');
      console.log('     - BDID Chain          (Identity)');
      console.log('     - Fabric Auth Chain   (Authentication)');
      console.log('     - Ethereum Layer      (Audit)');
      console.log('     - IPFS Layer          (Logs)');
      console.log('');
      console.log('='.repeat(60));
      console.log('');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('[Server] SIGTERM received, shutting down gracefully...');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('[Server] SIGINT received, shutting down gracefully...');
      process.exit(0);
    });

  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
