# HSuite Programmatic Swaps - Non-Provider Implementation

A comprehensive Node.js implementation for performing programmatic swaps on HSuite's zero-slippage DEX (Decentralized Exchange) using any Hedera wallet, designed for non-DEX-providers on the Hedera Hashgraph network.

## 🌟 Branch Overview

This branch (`features/programmatic_swaps`) provides an **alternative implementation** for users who want to perform programmatic swaps **without becoming DEX providers**. 

### Key Differences from Master Branch:

| Feature | Master Branch (Providers) | This Branch (Non-Providers) |
|---------|---------------------------|------------------------------|
| **Target Users** | DEX service providers | Any developer/trader |
| **API Access** | Full HTTP REST API (read/write) | WebSocket for writes, HTTP for reads |
| **Authentication** | Provider credentials required | Standard Hedera wallet only |
| **Fee Structure** | Earn 0.3% provider fees | Pay standard swap fees |
| **Use Case** | Provide DEX services to others | Direct personal/bot trading |

## 🚀 What This Implementation Provides

- 🔗 **WebSocket Integration**: Real-time swap execution for non-providers
- 💱 **Direct Swaps**: Execute swaps with any Hedera wallet as operator  
- 🌐 **Multi-Network**: Support for both Hedera mainnet and testnet
- 🔐 **Secure**: Environment-based configuration and robust authentication
- ⚡ **Real-time**: WebSocket-based communication for write operations
- 🛡️ **Error Handling**: Comprehensive error catching with detailed reporting
- 📊 **Read Access**: HTTP REST API for pool data and market information

**Important**: This implementation is for **non-DEX-providers** who want to perform direct swaps using their own Hedera wallets. You don't need special provider credentials - just a standard Hedera account with HBAR for transaction fees.

## 🎯 Use Cases & Target Audience

### This Branch: Non-Provider Programmatic Swaps
- **Requires Provider Credentials**: ❌ No
- **Purpose**: Direct swap execution for personal/business use
- **Benefits**: Zero-slippage swaps, real-time execution, full control
- **Authentication**: Standard Hedera wallet (any account with HBAR)
- **API Access**: WebSocket for swaps, HTTP for pool data
- **Target Users**: 
  - Individual traders
  - Trading bots and algorithms
  - DeFi applications
  - Arbitrage systems
  - Any developer wanting direct swap access

### Master Branch: DEX Provider Services
- **Requires Provider Credentials**: ✅ Yes (contact HSuite)
- **Purpose**: Provide DEX services to end-users and earn fees
- **Benefits**: Earn 0.3% fee on facilitated swaps, full HTTP API access
- **Authentication**: Provider-level WebSocket authentication
- **API Access**: Full HTTP REST API (read/write operations)
- **Target Users**: Businesses offering DEX services to customers

## 🏗️ Technical Architecture

This implementation uses a **hybrid approach** optimized for non-provider access:

### Core Components

1. **SmartNodeSocket Class**: Manages WebSocket connections for swap execution
2. **HTTP Client**: Handles read-only operations (pool data, token info)
3. **Transaction Management**: Orchestrates swap requests and execution
4. **Error Handling System**: Comprehensive error catching and recovery

### API Access Pattern

```
Non-Provider Access Pattern:
├── HTTP REST API (Read-Only)
│   ├── GET /pools/list - Available trading pools
│   ├── GET /tokens/list - Token information  
│   └── GET /pools/stats - Pool statistics
│
└── WebSocket Connection (Write Operations)
    ├── swapPoolRequest - Create swap transaction
    ├── swapPoolExecute - Execute signed transaction
    └── Real-time updates and error handling
```

**Why This Approach?**
- Non-providers don't have HTTP write access to Smart Nodes
- WebSocket provides real-time execution for swap operations
- HTTP remains available for data queries and pool information

## 🔧 Prerequisites

- **Node.js** (v14 or higher)
- **Hedera Account**: Any Hedera account with HBAR balance for transaction fees
- **Basic Knowledge**: Understanding of Hedera Hashgraph and token operations
- **Environment Setup**: Ability to configure environment variables

### What You DON'T Need
- ❌ HSuite provider credentials or API keys
- ❌ Special permissions or approvals
- ❌ Minimum account balance requirements (beyond transaction fees)
- ❌ Business verification or KYC processes

### What You DO Need
- ✅ Standard Hedera account (testnet or mainnet)
- ✅ HBAR for transaction fees (typically < 0.1 HBAR per swap)
- ✅ Private key access for transaction signing
- ✅ Node.js development environment

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hsuite_dex_provider
```

2. Install dependencies:
```bash
npm install
```

## ⚙️ Environment Configuration

This implementation uses **environment variables** for secure credential management. No hardcoded credentials or API keys required!

### 1. Create Environment File
Create a `.env` file in the project root:

```bash
# HSuite Programmatic Swaps Configuration
# Copy this template and fill in your Hedera account details

# =================================================================
# MAINNET CONFIGURATION (for production swaps)
# =================================================================
MAINNET_OPERATOR_ID=0.0.123456
MAINNET_OPERATOR_PRIVATE_KEY=302e020100300506032b657004220420YOUR_MAINNET_PRIVATE_KEY

# =================================================================
# TESTNET CONFIGURATION (for development and testing)
# =================================================================
TESTNET_OPERATOR_ID=0.0.123456
TESTNET_OPERATOR_PRIVATE_KEY=302e020100300506032b657004220420YOUR_TESTNET_PRIVATE_KEY
```

### 2. Security Features
- ✅ **No API Keys Required**: Standard Hedera accounts only
- ✅ **Environment Variables**: Credentials never hardcoded
- ✅ **Git Protection**: `.gitignore` prevents credential commits
- ✅ **Network Separation**: Different accounts for mainnet/testnet

### 3. Getting Your Credentials
1. **Account ID**: Your Hedera account ID (format: `0.0.123456`)
2. **Private Key**: DER-encoded hex string from your Hedera wallet
   - Export from HashPack, Blade, or other Hedera wallet
   - Or generate programmatically: `PrivateKey.generate().toString()`

## 🚀 Usage

### Quick Start

```bash
# Run on mainnet (production swaps)
node index.js

# For testnet development, modify the main() call in index.js:
# main('testnet') instead of main('mainnet')
```

### What Happens During Execution

1. **🌐 HTTP Client Setup**: Connects to Smart Node REST API for data queries
2. **🔐 WebSocket Authentication**: Establishes authenticated connection for swaps
3. **⚙️ Hedera Client Configuration**: Sets up transaction signing with your wallet
4. **💱 Swap Configuration**: Defines token pair and amounts to swap
5. **📝 Transaction Creation**: Requests swap transaction from Smart Node
6. **✍️ Transaction Signing**: Signs transaction with your private key
7. **🚀 Swap Execution**: Executes the swap through WebSocket
8. **📊 Result Processing**: Reports swap results and cleans up connections

### Example Swap Process

The demo performs a sample swap: **5000 HSUITE → HBAR**

```javascript
// Current demo configuration
let swapObj = {
    baseToken: {
        details: { id: "0.0.786931", symbol: "HSUITE", decimals: 4 },
        amount: { value: new Decimal(5000) }  // Spending 5000 HSUITE
    },
    swapToken: {
        details: { id: "HBAR", symbol: "HBAR", decimals: 8 },
        amount: { value: null }  // Receiving calculated HBAR amount
    }
};
```

## 📡 API Endpoints & Communication

### WebSocket Events (Write Operations)
Non-providers use WebSocket events for swap operations:

- **`swapPoolRequest`**: Creates a swap transaction
- **`swapPoolExecute`**: Executes the signed swap transaction
- **`authenticate`**: Handles authentication challenge/response

### HTTP REST API (Read Operations)
Available for data queries without authentication:

- **`GET /pools/list`**: Fetches available token pools
- **`GET /tokens/list`**: Retrieves token information
- **`GET /pools/stats`**: Gets pool statistics and metrics

### Authentication Flow
```
1. WebSocket Connection → Smart Node
2. Smart Node → Authentication Challenge
3. Your Wallet → Sign Challenge
4. Smart Node → Verify & Authenticate
5. Ready for Swap Operations
```

## 🌐 Smart Node Networks

The application automatically selects from available Smart Nodes for load balancing:

### Mainnet Nodes (8 nodes)
- **Production Network**: Real HBAR and token swaps
- **URLs**: `mainnet-sn1.hsuite.network` through `mainnet-sn8.hsuite.network`
- **Load Balancing**: Random node selection for each connection

### Testnet Nodes (4 nodes)
- **Development Network**: Test HBAR and tokens for development
- **URLs**: `testnet-sn1.hsuite.network` through `testnet-sn4.hsuite.network`
- **Purpose**: Safe testing environment for development and debugging

### Node Selection Strategy
- Automatic random selection for load distribution
- Fallback and retry logic (implemented in comprehensive error handling)
- No manual node configuration required

## ✨ Key Features

- **🎯 Zero Slippage**: Guaranteed exact token amounts in swaps
- **💳 Direct Wallet Integration**: Use any Hedera wallet as operator
- **🌐 Multi-Network Support**: Works on both Hedera mainnet and testnet
- **⚡ Real-time Execution**: WebSocket-based instant swap processing
- **🔐 Secure Authentication**: Cryptographic signature-based wallet verification
- **🔄 Load Balancing**: Automatic distribution across Smart Nodes
- **🛡️ Comprehensive Error Handling**: Detailed error reporting and recovery
- **📊 Pool Data Access**: HTTP API for market data and analytics
- **🚀 Production Ready**: Environment-based configuration and security

## Security Considerations

- Never commit private keys to version control
- Use environment variables for sensitive configuration
- Validate all transaction data before signing
- Monitor account balances and transaction history
- Use testnet for development and testing

## Error Handling

The application includes error handling for:
- Network connection failures
- Authentication failures
- Invalid swap parameters
- Transaction execution errors

## Dependencies

- **@hashgraph/sdk**: Hedera Hashgraph SDK for blockchain operations
- **axios**: HTTP client for REST API calls
- **socket.io-client**: WebSocket client for real-time communication
- **decimal.js**: Precise decimal arithmetic for token amounts

## 👨‍💻 Development & Customization

### Customizing Swap Parameters

Edit the `swapObj` in the main function to change token pairs and amounts:

```javascript
// Example 1: Exact Input Swap (spend exact amount)
let swapObj = {
    baseToken: {
        details: { id: "HBAR", symbol: "HBAR", decimals: 8 },
        amount: { value: new Decimal(10) }  // Spend exactly 10 HBAR
    },
    swapToken: {
        details: { id: "0.0.786931", symbol: "HSUITE", decimals: 4 },
        amount: { value: null }  // Receive calculated amount
    }
};

// Example 2: Exact Output Swap (receive exact amount)
let swapObj = {
    baseToken: {
        details: { id: "0.0.786931", symbol: "HSUITE", decimals: 4 },
        amount: { value: null }  // Spend calculated amount
    },
    swapToken: {
        details: { id: "HBAR", symbol: "HBAR", decimals: 8 },
        amount: { value: new Decimal(5) }  // Receive exactly 5 HBAR
    }
};
```

### Adding New Features

1. **Pool Monitoring**: Use HTTP client to fetch real-time pool data
2. **Price Tracking**: Implement price monitoring and alerts
3. **Multi-hop Swaps**: Chain multiple swaps for complex routes
4. **Automated Trading**: Build trading bots with the swap functions

### Testing Strategy

```bash
# Always test on testnet first
# Modify main('mainnet') to main('testnet') in index.js
node index.js
```

## 🤝 Support & Resources

### Getting Help
- **HSuite Documentation**: Official API and integration guides
- **Hedera SDK Documentation**: [docs.hedera.com](https://docs.hedera.com/)
- **Community Support**: HSuite developer community
- **Issue Reporting**: GitHub issues for bugs and feature requests

### Useful Resources
- **Hedera Portal**: [portal.hedera.com](https://portal.hedera.com/) - Account management
- **Testnet Faucet**: Free testnet HBAR for development
- **HashScan**: Transaction explorer for Hedera networks

## 📄 License

ISC - See package.json for details

## 👥 Author

HSuite Development Team

---

## 🔀 Branch Information

**Current Branch**: `features/programmatic_swaps`
- **Purpose**: Non-provider programmatic swaps
- **Target**: Individual developers, traders, bots
- **Access**: Standard Hedera accounts (no special credentials)

**Master Branch**: `master`
- **Purpose**: DEX provider services
- **Target**: Businesses offering DEX services
- **Access**: Requires HSuite provider credentials

---

**⚠️ Production Notice**: This implementation includes production-ready error handling, security practices, and comprehensive logging. However, always conduct thorough testing on testnet before mainnet deployment.

**💡 Developer Tip**: This branch provides a complete foundation for non-provider swap integrations. The modular design allows easy customization for trading bots, arbitrage systems, and DeFi applications. 
