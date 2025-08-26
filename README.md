# HSuite DEX Provider Demo

A Node.js demonstration application showing how to interact with HSuite's zero-slippage DEX (Decentralized Exchange) as a liquidity provider on the Hedera Hashgraph network.

## 🔀 Branch Information

**Current Branch**: `master` - **DEX Provider Implementation**
- **Target Users**: Businesses wanting to offer DEX services and earn provider fees
- **Requirements**: HSuite API key and provider whitelisting required
- **Benefits**: Earn 0.3% fees on facilitated swaps, full HTTP API access

**Alternative Branch**: [`features/programmatic_swaps`](../../tree/features/programmatic_swaps) - **Non-Provider Implementation**
- **Target Users**: Individual developers, traders, bots, arbitrage systems
- **Requirements**: Only standard Hedera account (no whitelisting needed)
- **Benefits**: Direct swap access without provider credentials

## 🚀 Quick Start for Non-Providers

**Want to experiment with programmatic swaps without becoming a provider?**

```bash
# Switch to the non-provider branch
git checkout features/programmatic_swaps

# Follow the setup instructions in that branch's README
npm install
# Configure your .env file with your Hedera account
npm start
```

## Overview

This project demonstrates how to:
- Connect to HSuite's Smart Node network via WebSocket and REST API
- Authenticate as a DEX provider using Hedera account credentials
- Facilitate token swaps with zero slippage
- Earn provider fees (0.3%) from swap transactions
- Handle both mainnet and testnet environments

**Important**: This demo shows how to become a **DEX provider** - meaning you provide your own DEX service using HSuite's liquidity pools and earn fees on each swap. If you're building normal bots or applications that just need to interact with the pools directly, check out the [`features/programmatic_swaps`](../../tree/features/programmatic_swaps) branch instead.

## Use Cases

### DEX Provider (This Branch - Master)
- **Requires API Key**: ✅ Yes (contact HSuite for whitelisting)
- **Purpose**: Provide DEX services using HSuite's liquidity pools
- **Benefits**: Earn 0.3% fee on each swap you facilitate
- **Authentication**: Required WebSocket authentication with Smart Nodes
- **API Access**: Full HTTP REST API (read/write operations)
- **Target Users**: Businesses/developers wanting to offer DEX services to customers

### Direct Swaps (Alternative Branch)
- **Branch**: [`features/programmatic_swaps`](../../tree/features/programmatic_swaps)
- **Requires API Key**: ❌ No (no whitelisting needed)
- **Purpose**: Direct interaction with liquidity pools for trading, arbitrage, etc.
- **Benefits**: Access to zero-slippage swaps and pool data
- **Authentication**: Standard Hedera account operations
- **API Access**: WebSocket for swaps, HTTP for pool data
- **Target Users**: Individual traders, bots, arbitrage systems, DeFi applications

> **💡 New to HSuite or don't have provider credentials?**  
> Start with the [`features/programmatic_swaps`](../../tree/features/programmatic_swaps) branch - it's perfect for experimenting and building trading applications without needing special permissions!

## Architecture

The application consists of three main components:

1. **SmartNodeSocket Class**: Manages WebSocket connections to Smart Nodes
2. **HTTP Client**: Handles REST API calls for swap operations
3. **Main Provider Logic**: Orchestrates the authentication and swap process

## Prerequisites

### For DEX Providers (This Branch)
- Node.js (v14 or higher)
- A Hedera account with HBAR balance for testnet/mainnet operations
- **HSuite API key** for Smart Node access (contact HSuite for whitelisting)
- Understanding of Hedera Hashgraph and token operations

### For Direct Swaps (Alternative Branch)
- Node.js (v14 or higher)
- A Hedera account with HBAR balance for transaction fees
- **No API key or whitelisting required** - just checkout [`features/programmatic_swaps`](../../tree/features/programmatic_swaps)

**Note**: If you don't have an HSuite API key or provider status, you can still perform programmatic swaps! Switch to the `features/programmatic_swaps` branch for a complete implementation that works with any Hedera account.

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

## Configuration

Before running the application, you need to configure your credentials in `index.js`:

### 1. API Key (DEX Providers Only)
Replace the placeholder with your HbarSuite API key. **This is only required if you want to become a DEX provider and earn fees**:
```javascript
const apiKey = 'YOUR_API_KEY_HERE';
```

If you're building normal bots or applications, you can skip the API key and authentication process.

### 2. Operator Accounts
Configure your Hedera accounts for both networks:
```javascript
const operator = {
    mainnet: {
        id: 'YOUR_MAINNET_OPERATOR_ID',        // e.g., '0.0.123456'
        private_key: 'YOUR_MAINNET_OPERATOR_PRIVATE_KEY'
    },
    testnet: {
        id: 'YOUR_TESTNET_OPERATOR_ID',        // e.g., '0.0.123456'
        private_key: 'YOUR_TESTNET_OPERATOR_PRIVATE_KEY'
    }
};
```

### 3. Final Customer Account
For demo purposes, configure a customer account:
```javascript
let finalCustomer = {
    account: 'THE_FINAL_CUSTOMER_ACCOUNT_ID',
    privateKey: 'THE_FINAL_CUSTOMER_PRIVATE_KEY'
};
```

## Usage

### Running the Demo

Execute the demo with your preferred network:

```bash
# Run on testnet (recommended for testing)
npm start

# The main function defaults to testnet, but you can modify it in index.js:
# main('testnet') or main('mainnet')
```

### What the Demo Does

1. **Establishes Connections**:
   - Creates HTTP client connection to a random Smart Node
   - Establishes authenticated WebSocket connection

2. **Authentication Process**:
   - Smart Node sends authentication challenge
   - Provider signs the challenge with their private key
   - Smart Node validates the signature

3. **Token Swap Execution**:
   - Creates a swap request (1 HBAR → 280 HSUITE tokens in the demo)
   - Generates unsigned transaction
   - Customer signs the transaction (simulated)
   - Executes the swap through the DEX

## API Endpoints Used

- `POST /pools/dex/swap-request`: Creates a swap transaction
- `POST /pools/dex/swap-execute`: Executes the signed swap transaction
- `GET /pools/list`: Fetches available token pools (mentioned but not used in demo)

## Smart Node Networks

The application automatically selects from available Smart Nodes:

### Mainnet Nodes
- 8 Smart Nodes distributed across the HbarSuite network
- URLs: `mainnet-sn1.hbarsuite.network` through `mainnet-sn8.hbarsuite.network`

### Testnet Nodes
- 4 Smart Nodes for testing
- URLs: `testnet-sn1.hbarsuite.network` through `testnet-sn4.hbarsuite.network`

## Key Features

- **Zero Slippage**: Guaranteed exact token amounts in swaps
- **Provider Fees**: Earn 0.3% fee on facilitated swaps
- **Multi-Network Support**: Works on both Hedera mainnet and testnet
- **Real-time Communication**: WebSocket-based real-time updates
- **Secure Authentication**: Cryptographic signature-based authentication
- **Random Node Selection**: Automatic load balancing across Smart Nodes

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

## Development

To modify the swap parameters, edit the `swapObj` in the main function:

```javascript
let swapObj = {
    baseToken: {
        details: {
            id: "HBAR",           // Base token (HBAR)
            symbol: "HBAR",
            decimals: 8
        },
        amount: {
            value: new Decimal(1) // Amount to swap
        }                    
    },
    swapToken: {
        details: {
            id: "0.0.786931",    // Target token ID
            symbol: "HSUITE",
            decimals: 4
        },
        amount: {
            value: new Decimal(280) // Expected output amount
        }
    }
};
```

## Support

For questions or issues:
- Check HSuite documentation
- Review Hedera SDK documentation
- Ensure proper network configuration and API key validity

## 🌟 Don't Have Provider Credentials?

If you want to experiment with programmatic swaps but don't have HSuite provider credentials:

1. **Switch to the non-provider branch:**
   ```bash
   git checkout features/programmatic_swaps
   ```

2. **Follow the setup in that branch** - it provides a complete implementation for direct swaps using any Hedera account

3. **No whitelisting required** - perfect for individual developers, trading bots, and DeFi applications

## License

ISC - See package.json for details

## Author

HSuite

---

**Note**: This is a demonstration application. For production use, implement proper error handling, logging, configuration management, and security practices. 
