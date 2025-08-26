/**
 * HSuite DEX Provider - Programmatic Swap Implementation
 * 
 * This module provides a complete implementation for interacting with the HSuite DEX
 * through Smart Node websockets and REST API. It handles:
 * - WebSocket authentication with Smart Nodes
 * - Swap transaction creation and execution
 * - Comprehensive error handling and timeout management
 * - Environment-based configuration for security
 * 
 * @author HSuite Development Team
 * @version 1.0.0
 */

// Load environment variables from .env file
require('dotenv').config();

// Core Hedera SDK components for transaction handling and signing
const {
    PrivateKey,    // For signing transactions and authentication
    Transaction,   // For handling transaction objects
    Client        // For Hedera network client configuration
} = require('@hashgraph/sdk');

// External dependencies for networking and calculations
const io = require('socket.io-client');  // WebSocket client for Smart Node communication
const axios = require('axios');          // HTTP client for REST API calls
const Decimal = require('decimal.js');   // Precision decimal arithmetic for token amounts

/**
 * SmartNodeSocket Class
 * 
 * Manages WebSocket connections to HSuite Smart Nodes. This class handles:
 * - Socket initialization with proper configuration
 * - Authentication protocol with the Smart Node network
 * - Connection persistence and management
 * 
 * Usage:
 * ```javascript
 * const nodeSocket = new SmartNodeSocket(nodeInfo, walletId);
 * const socket = nodeSocket.getSocket('gateway');
 * ```
 */
class SmartNodeSocket {
    /** @type {Object} The Smart Node configuration object containing operator, publicKey, and url */
    node = null;
    
    /** @type {string} The wallet/account ID that will authenticate with the Smart Node */
    wallet = null;
    
    /** @type {Socket} The socket.io client instance for WebSocket communication */
    socket = null;

    /**
     * Creates a new SmartNodeSocket instance
     * @param {Object} node - Smart Node configuration object
     * @param {string} node.operator - The Smart Node's operator account ID
     * @param {string} node.publicKey - The Smart Node's public key for verification
     * @param {string} node.url - The Smart Node's HTTP/HTTPS URL (will be converted to WebSocket)
     * @param {string} wallet - Your wallet/account ID for authentication
     */
    constructor(node, wallet) {
        this.node = node;
        this.wallet = wallet;
    }

    /**
     * Gets the Smart Node configuration
     * @returns {Object} The Smart Node configuration object
     */
    getNode() {
        return this.node;
    }

    /**
     * Initializes a new WebSocket connection to the Smart Node
     * @param {string} path - The WebSocket path (default: 'gateway')
     * @returns {Socket} The initialized socket.io client instance
     */
    init(path = 'gateway') {
        // Convert HTTP/HTTPS URLs to WebSocket URLs
        let url = this.node.url.replace('https://', 'wss://').replace('http://', 'ws://');

        // Create socket.io client with WebSocket-only transport for better performance
        this.socket = io(`${url}/${path}`, {
            upgrade: false,              // Disable transport upgrades for consistency
            transports: ['websocket'],   // Use only WebSocket transport
            query: {
                wallet: this.wallet,     // Send wallet ID for identification
                signedData: null         // Will be populated during authentication
            }
        });

        return this.socket;
    }

    /**
     * Gets the current socket connection or creates one if it doesn't exist
     * @param {string} path - The WebSocket path (default: 'gateway')
     * @returns {Socket} The socket.io client instance
     */
    getSocket = (path = 'gateway') => {
        if (!this.socket) {
            return this.init(path);
        }
        return this.socket;
    };
}

/**
 * HSuite Smart Node Network Configuration
 * 
 * This object contains the available Smart Nodes for both mainnet and testnet networks.
 * Each Smart Node provides redundancy and load distribution for the HSuite DEX.
 * 
 * Structure:
 * - operator: The Smart Node's Hedera account ID
 * - publicKey: The Smart Node's public key for signature verification
 * - url: The base URL for HTTP and WebSocket connections
 * 
 * The system randomly selects a node from the appropriate network to distribute load
 * and provide failover capability.
 */
const nodes = {
    /** @type {Array<Object>} Mainnet Smart Node configurations */
    mainnet: [
        {
            'operator': '0.0.1786597',
            'publicKey': '302a300506032b65700321003f54816030c29221e4f228c76415cba0db1ab4c49827d9dbf580abc2f2b29c24',
            'url': 'https://mainnet-sn1.hsuite.network'
        },
        {
            'operator': '0.0.1786598',
            'publicKey': '302a300506032b6570032100233b043e21d5e148f48e2c2da6607a1f5e6fc381781bd0561967743a8291785e',
            'url': 'https://mainnet-sn2.hsuite.network'
        },
        {
            'operator': '0.0.1786599',
            'publicKey': '302a300506032b6570032100c236c88b0aadccf86cc09c57734401409e301d45018ab179f8463801f486c89a',
            'url': 'https://mainnet-sn3.hsuite.network'
        },
        {
            'operator': '0.0.1786344',
            'publicKey': '302a300506032b65700321004e3c29113c911ce6dba13669fda53ed1ab3d89547e23c0b7ab2275fd5dc05766',
            'url': 'https://mainnet-sn4.hsuite.network'
        },
        {
            'operator': '0.0.1786344',
            'publicKey': '302a300506032b65700321004e3c29113c911ce6dba13669fda53ed1ab3d89547e23c0b7ab2275fd5dc05766',
            'url': 'https://mainnet-sn5.hsuite.network'
        },
        {
            'operator': '0.0.1786345',
            'publicKey': '302a300506032b6570032100077bfba9f0fb180026f0de51d4e1083d616eff34a8fe62a1c0e34dd975b7f8cf',
            'url': 'https://mainnet-sn6.hsuite.network'
        },
        {
            'operator': '0.0.1786347',
            'publicKey': '302a300506032b6570032100ff792317f5a24278f1a2dddfc9a23670e158ccb9ecd42cdd0ab36e5ad8bc40a6',
            'url': 'https://mainnet-sn7.hsuite.network'
        },
        {
            'operator': '0.0.1786365',
            'publicKey': '302a300506032b6570032100485e23e18834571e466f96de9f96f228a1f5da860b319f0f0cb2890f938f298d',
            'url': 'https://mainnet-sn8.hsuite.network'
        }
    ],
    /** @type {Array<Object>} Testnet Smart Node configurations */
    testnet: [
        {
            'operator': '0.0.467726',
            'publicKey': '302a300506032b6570032100ae51a8b5d22e40d68fec62e20488132182f304cddbf5cd494d62cb18a06b71c1',
            'url': 'https://testnet-sn1.hsuite.network'
        },
        {
            'operator': '0.0.467732',
            'publicKey': '302a300506032b657003210014e45f62427a777c8a5c168115793969c5fa04979b6a40a34c3bff7d20a3b745',
            'url': 'https://testnet-sn2.hsuite.network'
        },
        {
            'operator': '0.0.467734',
            'publicKey': '302a300506032b65700321002caf57f6153afb61ed70545516886b1621aa93dd22ae79412f5af0cbfcd2b5ab',
            'url': 'https://testnet-sn3.hsuite.network'
        },
        {
            'operator': '0.0.467737',
            'publicKey': '302a300506032b6570032100452e3d988c2f0e40b6194c7543ec880daaefa29b6c48e590b367bbe22de429d3',
            'url': 'https://testnet-sn4.hsuite.network'
        }
    ]
};

/**
 * The operator configuration for the HederaClient, both for mainnet and testnet
 * These are loaded from environment variables for security
 * 
 * Required Environment Variables:
 * - MAINNET_OPERATOR_ID: Your mainnet operator account ID (e.g., '0.0.123456')
 * - MAINNET_OPERATOR_PRIVATE_KEY: Your mainnet operator private key
 * - TESTNET_OPERATOR_ID: Your testnet operator account ID (e.g., '0.0.123456')
 * - TESTNET_OPERATOR_PRIVATE_KEY: Your testnet operator private key
 */
const operator = {
    mainnet: {
        id: process.env.MAINNET_OPERATOR_ID || (() => {
            throw new Error('MAINNET_OPERATOR_ID environment variable is required');
        })(),
        private_key: process.env.MAINNET_OPERATOR_PRIVATE_KEY || (() => {
            throw new Error('MAINNET_OPERATOR_PRIVATE_KEY environment variable is required');
        })()
    },
    testnet: {
        id: process.env.TESTNET_OPERATOR_ID || (() => {
            throw new Error('TESTNET_OPERATOR_ID environment variable is required');
        })(),
        private_key: process.env.TESTNET_OPERATOR_PRIVATE_KEY || (() => {
            throw new Error('TESTNET_OPERATOR_PRIVATE_KEY environment variable is required');
        })()
    }
};

/** @type {Object|null} Global socket connection object - stores the authenticated Smart Node connection */
let socketConnection = null;

/**
 * Smart Node WebSocket Authentication and Connection
 * 
 * This function establishes an authenticated WebSocket connection to a randomly selected
 * Smart Node from the specified network. The authentication process involves:
 * 
 * 1. Random node selection for load balancing
 * 2. WebSocket connection establishment
 * 3. Bi-directional signature verification:
 *    - Smart Node signs a challenge payload
 *    - Your operator signs the same payload + Smart Node signature
 *    - Both signatures are verified for security
 * 
 * @param {string} network - The network to connect to ('mainnet' | 'testnet')
 * @returns {Promise<Object>} Promise that resolves with authentication result
 * @returns {string} returns.message - Success message with connection details
 * @returns {SmartNodeSocket} returns.socket - The authenticated socket connection
 * 
 * @throws {Error} When network is invalid, authentication fails, or connection errors occur
 * 
 * @example
 * ```javascript
 * try {
 *   const connection = await smartNodeSocket('mainnet');
 *   console.log(connection.message);
 *   // Use connection.socket for further operations
 * } catch (error) {
 *   console.error('Authentication failed:', error.message);
 * }
 * ```
 */
async function smartNodeSocket(network) {
    return new Promise(async (resolve, reject) => {
        try {
            // Step 1: Select a random Smart Node for load balancing and redundancy
            let randomNode = nodes[network][Math.floor(Math.random() * nodes[network].length)];
            console.log(`Connecting to Smart Node: ${randomNode.url} (${randomNode.operator})`);
            
            // Step 2: Create Smart Node socket connection instance
            let nodeSocket = new SmartNodeSocket(randomNode, operator[network].id);

            // =================================================================
            // WEBSOCKET EVENT HANDLERS - Setting up the authentication flow
            // =================================================================

            /**
             * Event: 'connect' - Initial socket connection established
             * This doesn't mean we're authenticated yet, just connected to the WebSocket
             */
            nodeSocket.getSocket('gateway').on('connect', async () => {
                console.log(`✓ WebSocket connected: account ${operator[network].id} → node ${nodeSocket.getNode().operator}`);
            });

            /**
             * Event: 'disconnect' - Socket connection lost
             * Handle graceful disconnections and connection drops
             */
            nodeSocket.getSocket('gateway').on('disconnect', async () => {
                console.log(`✗ WebSocket disconnected: account ${operator[network].id} ↛ node ${nodeSocket.getNode().operator}`);
            });

            /**
             * Event: 'errors' - Socket-level errors
             * These are network or protocol-level errors, not authentication failures
             */
            nodeSocket.getSocket('gateway').on('errors', async (event) => {
                console.error('❌ Socket error event:', event);
            });

            /**
             * Event: 'authenticate' - Final authentication result
             * The Smart Node sends this after verifying our signature
             * Success here means we can start making swap requests
             */
            nodeSocket.getSocket('gateway').on('authenticate', async (event) => {
                if (event.isValidSignature) {
                    console.log(`🔐 Authentication successful for account ${operator[network].id}`);
                    resolve({
                        message: `account ${operator[network].id} authenticated to node ${nodeSocket.getNode().operator}.`,
                        socket: nodeSocket
                    })
                } else {
                    console.error(`🚫 Authentication failed for account ${operator[network].id}`);
                    reject(new Error(`Authentication failed: Invalid signature for account ${operator[network].id} on node ${nodeSocket.getNode().operator}`))
                }
            });

            /**
             * Event: 'authentication' - Authentication challenge from Smart Node
             * 
             * This is the core of the security protocol:
             * 1. Smart Node sends a signed payload as a challenge
             * 2. We must sign the same payload + their signature
             * 3. This proves we have the private key for our declared account
             * 4. The mutual signature prevents man-in-the-middle attacks
             */
            nodeSocket.getSocket('gateway').on('authentication', async (event) => {
                try {
                    console.log(`🔑 Received authentication challenge from node ${nodeSocket.getNode().operator}`);
                    
                    // Step 1: Extract the Smart Node's signed challenge
                    let payload = {
                        serverSignature: new Uint8Array(event.signedData.signature),
                        originalPayload: event.payload
                    };

                    // Step 2: Sign the payload with our operator's private key
                    // This proves we control the private key for our declared account ID
                    const privateKey = PrivateKey.fromString(operator[network].private_key);
                    let bytes = new Uint8Array(Buffer.from(JSON.stringify(payload)));
                    let signature = privateKey.sign(bytes);

                    console.log(`📝 Signing authentication payload with account ${operator[network].id}`);

                    // Step 3: Send our signature back to the Smart Node for verification
                    nodeSocket.getSocket('gateway').emit('authenticate', {
                        signedData: {
                            signedPayload: payload,
                            userSignature: signature,
                        },
                        walletId: operator[network].id
                    });
                } catch (authError) {
                    console.error('❌ Authentication process failed:', authError);
                    reject(new Error(`Authentication process failed: ${authError.message}`));
                }
            });

            // Step 3: Initiate the WebSocket connection to start the authentication flow
            console.log(`🚀 Initiating WebSocket connection to ${randomNode.url}...`);
            nodeSocket.getSocket('gateway').connect();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Smart Node HTTP Client Connection
 * 
 * Creates an HTTP client for REST API calls to Smart Nodes. This is used for:
 * - Fetching pool information (/pools/list)
 * - Getting token details and pricing
 * - Other read-only operations that don't require WebSocket authentication
 * 
 * @param {string} network - The network to connect to ('mainnet' | 'testnet')
 * @returns {Promise<axios.AxiosInstance>} Promise that resolves with configured HTTP client
 * 
 * @throws {Error} When network is invalid or connection fails
 * 
 * @example
 * ```javascript
 * const httpClient = await smartNodeClient('mainnet');
 * const pools = await httpClient.get('/pools/list');
 * console.log('Available pools:', pools.data);
 * ```
 */
async function smartNodeClient(network) {
    return new Promise(async (resolve, reject) => {
        try {
            // generating a random number, so to grab a random smart-node from the network..
            let randomNode = nodes[network][Math.floor(Math.random() * nodes[network].length)];

            // creating a smart-node client connection...
            const client = axios.create({
                baseURL: randomNode.url,
                withCredentials: true
            });
            
            // we're ready to operate...
            resolve(client);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Main Demonstration Function - Complete Swap Implementation
 * 
 * This function demonstrates a complete swap operation workflow:
 * 1. Connect to Smart Node HTTP API for data queries
 * 2. Authenticate with Smart Node WebSocket for transactions
 * 3. Create a swap transaction request
 * 4. Sign the transaction (simulating end-user wallet)
 * 5. Execute the swap through the Smart Node
 * 6. Handle all errors and cleanup connections
 * 
 * This serves as both a working example and a template for developers
 * to implement their own swap integrations.
 * 
 * @param {string} network - The network to operate on ('mainnet' | 'testnet')
 * @returns {Promise<string>} Promise that resolves with success message
 * 
 * @throws {Error} When any step of the swap process fails
 * 
 * @example
 * ```javascript
 * // Run a mainnet swap
 * main('mainnet')
 *   .then(result => console.log('Swap completed:', result))
 *   .catch(error => console.error('Swap failed:', error.message));
 * ```
 */
async function main(network = 'testnet') {
    return new Promise(async (resolve, reject) => {
        try {
            // =================================================================
            // STEP 1: Initialize HTTP Client for Data Queries
            // =================================================================
            console.log('\n🚀 STEP 1: Setting up HTTP client for Smart Node API...');
            let httpClientApi = await smartNodeClient(network);
            console.log(`✅ Step 1 Complete: HTTP Client ready at ${httpClientApi.defaults.baseURL}`);

            // showcasing the smart-node client connection...
            // please visit https://mainnet-sn1.hbarsuite.network/api/#/pools to see the available endpoints for read-only operations.
            // remember, in v1 all write operations are handled through the websocket connection only.
            
            // uncomment the following line to see the available pools...
            // let pools = await httpClientApi.get('/pools/list');
            // console.log('Available pools:', pools.data);

            // =================================================================
            // STEP 2: Authenticate WebSocket Connection for Transactions
            // =================================================================
            console.log('\n🔐 STEP 2: Authenticating WebSocket connection...');
            socketConnection = await smartNodeSocket(network);
            console.log(`✅ Step 2 Complete: ${socketConnection.message}`);
            
            // Important: Only the DEX provider needs to authenticate with the Smart Node
            // End users don't need to authenticate - they just sign transactions
            // The provider acts as an intermediary and earns fees from swaps

            // =================================================================
            // STEP 3: Configure Hedera Client for Transaction Signing
            // =================================================================
            console.log('\n⚙️ STEP 3: Setting up Hedera client...');
            const hederaClient = network == 'testnet' ? Client.forTestnet() : Client.forMainnet();
            hederaClient.setOperator(operator[network].id, operator[network].private_key);
            console.log(`✅ Step 3 Complete: Hedera client configured for ${network}`);

            // =================================================================
            // STEP 4: Define Swap Parameters
            // =================================================================
            console.log('\n📋 STEP 4: Configuring swap parameters...');
            
            /**
             * Swap Configuration Object
             * 
             * This object defines what tokens to swap and amounts:
             * - baseToken: The token you're providing (spending)
             * - swapToken: The token you want to receive
             * 
             * For exact output swaps:
             * - Set baseToken.amount to the amount you want to spend
             * - Set swapToken.amount to null (will be calculated)
             * 
             * For exact input swaps:
             * - Set baseToken.amount to null (will be calculated)
             * - Set swapToken.amount to the exact amount you want to receive
             */
            let swapObj = {
                // Token being provided/spent in the swap
                baseToken: {
                    details: {
                        id: "0.0.786931",    // HSUITE token ID on Hedera
                        symbol: "HSUITE",     // Human-readable symbol
                        decimals: 4           // Token decimal places
                    },
                    amount: {
                        // Amount of HSUITE to swap (5000 HSUITE tokens)
                        value: new Decimal(5000)
                    }                 
                },
                // Token being received in the swap
                swapToken: {
                    details: {
                        id: "HBAR",          // Native HBAR (special identifier)
                        symbol: "HBAR",      // Native token symbol
                        decimals: 8          // HBAR uses 8 decimal places (tinybars)
                    },
                    amount: {
                        // Amount will be calculated by Smart Node based on current rates
                        value: null 
                    }   
                },
            };

            console.log(`💱 Swap: ${swapObj.baseToken.amount.value} ${swapObj.baseToken.details.symbol} → ${swapObj.swapToken.details.symbol}`);
            console.log(`✅ Step 4 Complete: Swap parameters configured`);

            // =================================================================
            // STEP 5: Execute Complete Swap Workflow
            // =================================================================
            console.log('\n🚀 STEP 5: Executing Complete Swap Workflow...');
            let swapRequest, swapExecute;
            
            try {
                // Step 5.1: Request swap transaction from Smart Node
                console.log('\n📝 Step 5.1: Requesting swap transaction from Smart Node...');
                swapRequest = await swapTransactionRequest(operator[network].id, swapObj);
                console.log('✓ Swap transaction request successful');
                
                // Step 5.2: Sign the transaction
                console.log('\n✍️ Step 5.2: Signing transaction...');
                
                // In a real-world scenario:
                // 1. Send transaction bytes to end-user's wallet (WalletConnect, etc.)
                // 2. User reviews and approves the transaction
                // 3. User's wallet signs the transaction
                // 4. Signed transaction is returned to your application
                // 5. You execute the signed transaction through Smart Node
                
                // For this demo, we simulate the end-user signing process
                let transaction = Transaction.fromBytes(new Uint8Array(swapRequest.transaction));
                let signedTransaction = await transaction.sign(PrivateKey.fromString(operator[network].private_key));
                console.log('✓ Transaction signed successfully');

                // Step 5.3: Execute the signed transaction
                console.log('\n🚀 Step 5.3: Executing swap transaction...');
                swapExecute = await swapTransactionExecute(signedTransaction);

                console.log('\n🎉 SWAP COMPLETED SUCCESSFULLY!');
                console.log('📊 Execution Result:', swapExecute);
                console.log(`✅ Step 5.3 Complete: Customer successfully swapped ${swapObj.baseToken.amount.value} ${swapObj.baseToken.details.symbol} for ${swapObj.swapToken.details.symbol}`);
                
            } catch (swapError) {
                console.error('Swap operation failed:');
                console.error('- Error Code:', swapError.code || 'UNKNOWN');
                console.error('- Error Message:', swapError.message);
                
                // Log additional error context if available
                if (swapError.response) {
                    console.error('- Server Response:', swapError.response);
                }
                if (swapError.originalError) {
                    console.error('- Original Error:', swapError.originalError);
                }
                if (swapError.reason) {
                    console.error('- Disconnect Reason:', swapError.reason);
                }
                
                throw swapError; // Re-throw to be caught by outer try-catch
            } finally {
                // Always cleanup socket connection
                console.log('\n🧹 STEP 6: Cleaning up connections...');
                if (socketConnection && socketConnection.socket) {
                    const socket = socketConnection.socket.getSocket('gateway');
                    socket.removeAllListeners();
                    socket.disconnect();
                    console.log('✅ Step 6 Complete: Socket connection cleaned up');
                }
            }

            console.log('\n🏁 ALL STEPS COMPLETED SUCCESSFULLY!');
            console.log('✅ Swap operation finished - ready to exit');
            resolve('all done');
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Requests a swap transaction with comprehensive error handling
 * @param {string} senderId - The account ID of the sender
 * @param {Object} swap - The swap configuration object
 * @returns {Promise} Promise that resolves with transaction request or rejects with error
 */
async function swapTransactionRequest(senderId, swap) {
    return new Promise(async (resolve, reject) => {
      let timeout;
      let hasResolved = false;
      
      try {
        const socket = socketConnection.socket.getSocket('gateway');
        
        // Set up timeout for the operation (30 seconds)
        timeout = setTimeout(() => {
          if (!hasResolved) {
            hasResolved = true;
            reject(new Error('Swap transaction request timed out after 30 seconds'));
          }
        }, 30000);

        // Handle successful responses and errors from the server
        const responseHandler = (response) => {
          if (hasResolved) return;
          hasResolved = true;
          clearTimeout(timeout);
          
          try {
            // Validate response structure
            if (!response || typeof response !== 'object') {
              reject(new Error('Invalid response format received from server'));
              return;
            }

            if (response.status === 'success') {
              // Validate payload exists
              if (!response.payload) {
                reject(new Error('Server response missing transaction payload'));
                return;
              }
              resolve(response.payload);
            } else {
              // Handle different types of error responses
              const errorMessage = response.error || response.message || 'Unknown error occurred during swap request';
              const errorCode = response.errorCode || response.code || 'SWAP_REQUEST_ERROR';
              
              const error = new Error(errorMessage);
              error.code = errorCode;
              error.response = response;
              
              reject(error);
            }
          } catch (parseError) {
            reject(new Error(`Error parsing server response: ${parseError.message}`));
          }
        };

        // Handle socket connection errors
        const errorHandler = (error) => {
          if (hasResolved) return;
          hasResolved = true;
          clearTimeout(timeout);
          
          const socketError = new Error(`Socket error during swap request: ${error.message || error}`);
          socketError.code = 'SOCKET_ERROR';
          socketError.originalError = error;
          
          reject(socketError);
        };

        // Handle socket disconnection during operation
        const disconnectHandler = (reason) => {
          if (hasResolved) return;
          hasResolved = true;
          clearTimeout(timeout);
          
          const disconnectError = new Error(`Socket disconnected during swap request: ${reason}`);
          disconnectError.code = 'SOCKET_DISCONNECT';
          disconnectError.reason = reason;
          
          reject(disconnectError);
        };

        // Set up event listeners
        socket.on('swapPoolRequest', responseHandler);
        socket.on('error', errorHandler);
        socket.on('disconnect', disconnectHandler);

        // Clean up event listeners when promise resolves/rejects
        const cleanup = () => {
          socket.off('swapPoolRequest', responseHandler);
          socket.off('error', errorHandler);
          socket.off('disconnect', disconnectHandler);
        };

        // Ensure cleanup happens
        const originalResolve = resolve;
        const originalReject = reject;
        
        resolve = (value) => {
          cleanup();
          originalResolve(value);
        };
        
        reject = (error) => {
          cleanup();
          originalReject(error);
        };

        // Validate input parameters
        if (!senderId || typeof senderId !== 'string') {
          reject(new Error('Invalid senderId provided - must be a valid account ID string'));
          return;
        }

        if (!swap || typeof swap !== 'object') {
          reject(new Error('Invalid swap object provided'));
          return;
        }

        // Send the swap request
        socket.emit('swapPoolRequest', {
          type: 'swapPoolRequest',
          senderId: senderId,
          swap: swap
        });

      } catch (error) {
        if (!hasResolved) {
          hasResolved = true;
          clearTimeout(timeout);
          
          // Enhance the error with more context
          const enhancedError = new Error(`Failed to initiate swap request: ${error.message}`);
          enhancedError.code = 'INITIALIZATION_ERROR';
          enhancedError.originalError = error;
          
          reject(enhancedError);
        }
      }
    });
  }

  /**
   * Executes a swap transaction with comprehensive error handling
   * @param {Transaction} signedTransaction - The signed transaction to execute
   * @returns {Promise} Promise that resolves with swap execution response or rejects with error
   */
  async function swapTransactionExecute(signedTransaction) {
    return new Promise(async (resolve, reject) => {
      let timeout;
      let hasResolved = false;
      
      try {
        const socket = socketConnection.socket.getSocket('gateway');
        
        // Set up timeout for the operation (30 seconds)
        timeout = setTimeout(() => {
          if (!hasResolved) {
            hasResolved = true;
            reject(new Error('Swap transaction execution timed out after 30 seconds'));
          }
        }, 30000);

        // Handle successful responses and errors from the server
        const responseHandler = (response) => {
          if (hasResolved) return;
          hasResolved = true;
          clearTimeout(timeout);
          
          try {
            // Validate response structure
            if (!response || typeof response !== 'object') {
              reject(new Error('Invalid response format received from server'));
              return;
            }

            if (response.status === 'success') {
              resolve(response);
            } else {
              // Handle different types of error responses
              const errorMessage = response.error || response.message || 'Unknown error occurred during swap execution';
              const errorCode = response.errorCode || response.code || 'SWAP_EXECUTION_ERROR';
              
              const error = new Error(errorMessage);
              error.code = errorCode;
              error.response = response;
              
              reject(error);
            }
          } catch (parseError) {
            reject(new Error(`Error parsing server response: ${parseError.message}`));
          }
        };

        // Handle socket connection errors
        const errorHandler = (error) => {
          if (hasResolved) return;
          hasResolved = true;
          clearTimeout(timeout);
          
          const socketError = new Error(`Socket error during swap execution: ${error.message || error}`);
          socketError.code = 'SOCKET_ERROR';
          socketError.originalError = error;
          
          reject(socketError);
        };

        // Handle socket disconnection during operation
        const disconnectHandler = (reason) => {
          if (hasResolved) return;
          hasResolved = true;
          clearTimeout(timeout);
          
          const disconnectError = new Error(`Socket disconnected during swap execution: ${reason}`);
          disconnectError.code = 'SOCKET_DISCONNECT';
          disconnectError.reason = reason;
          
          reject(disconnectError);
        };

        // Set up event listeners
        socket.on('swapPoolExecute', responseHandler);
        socket.on('error', errorHandler);
        socket.on('disconnect', disconnectHandler);

        // Clean up event listeners when promise resolves/rejects
        const cleanup = () => {
          socket.off('swapPoolExecute', responseHandler);
          socket.off('error', errorHandler);
          socket.off('disconnect', disconnectHandler);
        };

        // Ensure cleanup happens
        const originalResolve = resolve;
        const originalReject = reject;
        
        resolve = (value) => {
          cleanup();
          originalResolve(value);
        };
        
        reject = (error) => {
          cleanup();
          originalReject(error);
        };

        // Validate input before sending
        if (!signedTransaction || typeof signedTransaction.toBytes !== 'function') {
          reject(new Error('Invalid signed transaction provided'));
          return;
        }

        // Send the swap execution request
        socket.emit('swapPoolExecute', {
          type: 'swapPoolExecute',
          transactionBytes: signedTransaction.toBytes()
        });

      } catch (error) {
        if (!hasResolved) {
          hasResolved = true;
          clearTimeout(timeout);
          
          // Enhance the error with more context
          const enhancedError = new Error(`Failed to initiate swap execution: ${error.message}`);
          enhancedError.code = 'INITIALIZATION_ERROR';
          enhancedError.originalError = error;
          
          reject(enhancedError);
        }
      }
    });
  }


main('mainnet').then(async (response) => {
    console.log('\n🎯 PROGRAM COMPLETED SUCCESSFULLY!');
    console.log(`📋 Final Result: ${response}`);
    console.log('👋 Exiting gracefully...\n');
    
    // Give a moment for any remaining async operations to complete
    setTimeout(() => {
        process.exit(0);
    }, 100);
}).catch(error => {
    console.error('\n❌ PROGRAM FAILED!');
    console.error('🚨 Error:', error.message);
    console.error('👋 Exiting with error...\n');
    
    // Give a moment for any remaining async operations to complete
    setTimeout(() => {
        process.exit(1);
    }, 100);
});
