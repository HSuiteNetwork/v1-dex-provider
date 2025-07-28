# HbarSuite DEX Provider Demo

A Node.js demonstration application showing how to interact with HbarSuite's zero-slippage DEX (Decentralized Exchange) as a liquidity provider on the Hedera Hashgraph network.

## Overview

This project demonstrates how to:
- Connect to HbarSuite's Smart Node network via WebSocket and REST API
- Authenticate as a DEX provider using Hedera account credentials
- Facilitate token swaps with zero slippage
- Earn provider fees (0.3%) from swap transactions
- Handle both mainnet and testnet environments

**Important**: This demo shows how to become a **DEX provider** - meaning you provide your own DEX service using HbarSuite's liquidity pools and earn fees on each swap. If you're building normal bots or applications that just need to interact with the pools directly, you don't need an API key or the provider authentication process.

## Use Cases

### DEX Provider (This Demo)
- **Requires API Key**: Yes
- **Purpose**: Provide DEX services using HbarSuite's liquidity pools
- **Benefits**: Earn 0.3% fee on each swap you facilitate
- **Authentication**: Required WebSocket authentication with Smart Nodes
- **Target Users**: Businesses/developers wanting to offer DEX services

### Normal Bots/Applications
- **Requires API Key**: No
- **Purpose**: Direct interaction with liquidity pools for trading, arbitrage, etc.
- **Benefits**: Access to zero-slippage swaps and pool data
- **Authentication**: Standard Hedera account operations
- **Target Users**: Traders, arbitrage bots, DeFi applications

## Architecture

The application consists of three main components:

1. **SmartNodeSocket Class**: Manages WebSocket connections to Smart Nodes
2. **HTTP Client**: Handles REST API calls for swap operations
3. **Main Provider Logic**: Orchestrates the authentication and swap process

## Prerequisites

- Node.js (v14 or higher)
- A Hedera account with HBAR balance for testnet/mainnet operations
- HbarSuite API key for Smart Node access (**only required for DEX providers**)
- Understanding of Hedera Hashgraph and token operations

**Note**: The API key is only needed if you want to become a DEX provider and earn fees on swaps. For normal bots, trading applications, or direct pool interactions, no API key is required.

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
- Check HbarSuite documentation
- Review Hedera SDK documentation
- Ensure proper network configuration and API key validity

## License

ISC - See package.json for details

## Author

HbarSuite

---

**Note**: This is a demonstration application. For production use, implement proper error handling, logging, configuration management, and security practices. 
