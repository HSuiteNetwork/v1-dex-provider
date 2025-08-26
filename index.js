const {
    PrivateKey,
    Transaction,
    Client
} = require('@hashgraph/sdk');

const io = require('socket.io-client');
const axios = require('axios');
const Decimal = require('decimal.js');

// SmartNodeSocket Class
class SmartNodeSocket {
    node = null;
    wallet = null;
    socket = null;
    apiKey = null;

    constructor(node, wallet, apiKey) {
        this.node = node;
        this.wallet = wallet;
        this.apiKey = apiKey;
    }

    getNode() {
        return this.node;
    }

    init(path = 'gateway') {
        let url = this.node.url.replace('https://', 'wss://').replace('http://', 'ws://');

        this.socket = io(`${url}/${path}`, {
            upgrade: false,
            transports: ['websocket'],
            origin: 'https://localhost.hsuite.app:8100',
            query: {
                wallet: this.wallet,
                signedData: null,
                'api-key': this.apiKey
            }
        });

        return this.socket;
    }

    getSocket = (path = 'gateway') => {
        if (!this.socket) {
            return this.init(path);
        }
        return this.socket;
    };
}

// The SmartNode Network, both for mainnet and testnet
const nodes = {
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

// The apiKey to authenticate your socket connection against smart node network
const apiKey = 'YOUR_API_KEY_HERE';

// The operator for the HederaClient, both for mainnet and testnet
const operator = {
    mainnet: {
        id: 'YOUR_MAINNET_OPERATOR_ID',
        private_key: 'YOUR_MAINNET_OPERATOR_PRIVATE_KEY'
    },
    testnet: {
        id: 'YOUR_TESTNET_OPERATOR_ID',
        private_key: 'YOUR_TESTNET_OPERATOR_PRIVATE_KEY'
    }
};

// this is the main method to connect/authenticate to smart-node websockets.
async function smartNodeSocket(network) {
    return new Promise(async (resolve, reject) => {
        try {
            // generating a random number, so to grab a random smart-node from the network..
            let randomNode = nodes[network][Math.floor(Math.random() * nodes[network].length)];
            // creating a smart-node socket connection...
            let nodeSocket = new SmartNodeSocket(randomNode, operator[network].id, apiKey);

            // SETTING UP MAIN WEBSOCKET EVENTS
            // on connect, we simply log the connection...
            nodeSocket.getSocket('gateway').on('connect', async () => {
                console.log(`account ${operator[network].id} connected to node ${nodeSocket.getNode().operator}`);
            });

            // on disconnect, we simply log the disconnection...
            nodeSocket.getSocket('gateway').on('disconnect', async () => {
                console.log(`account ${operator[network].id} disconnected from node ${nodeSocket.getNode().operator}`);
            });

            // on errors, we simply log the error...
            nodeSocket.getSocket('gateway').on('errors', async (event) => {
                console.error('error event', event);
            });

            // on authenticate, it means the smart-node validated our authentiction and we're ready to operate...
            nodeSocket.getSocket('gateway').on('authenticate', async (event) => {
                if (event.isValidSignature) {
                    resolve({
                        message: `account ${operator[network].id} authenticated to node ${nodeSocket.getNode().operator}.`,
                        socket: nodeSocket
                    })
                } else {
                    reject(new Error(`account ${operator[network].id} can't connect to node ${nodeSocket.getNode().operator}, shit happens...`))
                }
            });

            // when the connection is triggered, the smart-node will trigger an authentication request.
            // this authentication request MUST be signed with your operator private key to ensure you are the 'real you'.
            nodeSocket.getSocket('gateway').on('authentication', async (event) => {
                // we grab the payload signed by the smart-node...
                let payload = {
                    serverSignature: new Uint8Array(event.signedData.signature),
                    originalPayload: event.payload
                };

                // we add our signature on top of the same payload...
                const privateKey = PrivateKey.fromString(operator[network].private_key);
                let bytes = new Uint8Array(Buffer.from(JSON.stringify(payload)));
                let signature = privateKey.sign(bytes);

                // we send our signed payload to the smart-node, so it can validate our authentication...
                nodeSocket.getSocket('gateway').emit('authenticate', {
                    signedData: {
                        signedPayload: payload,
                        userSignature: signature,
                    },
                    walletId: operator[network].id
                });
            });

            // finally triggering the socket connection, to so start the whole auth flow...
            nodeSocket.getSocket('gateway').connect();
        } catch (error) {
            reject(error);
        }
    });
}

// this is the main method to connect to smart-node restful api.
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

async function main(network = 'testnet') {
    return new Promise(async (resolve, reject) => {
        try {
            // connecting to smart-node client, you can execute all the HTTP/GET using this client...
            let httpClientApi = await smartNodeClient(network);
            console.log(`ready to operate with HTTPClient on ${httpClientApi.defaults.baseURL}`);

            // connecting to smart-node socket, ONLY the provider wallet has to authenticate
            // against smart-node in order to be able to operate for the final customer...
            let socketConnection = await smartNodeSocket(network);
            console.log(socketConnection.message);

            // testing a swap using your operator as provider (the one which will receive the 0.3% fee)
            // and using another testnet account to emulate the final customer swapping tokens...
            const hederaClient = network == 'testnet' ? Client.forTestnet() : Client.forMainnet();
            hederaClient.setOperator(operator[network].id, operator[network].private_key);

            // simualting a walletconnect sdk, where the final customer will sign the transaction...
            let finalCustomer = {
                account: 'THE_FINAL_CUSTOMER_ACCOUNT_ID',
                privateKey: 'THE_FINAL_CUSTOMER_PRIVATE_KEY'
            };

            // you can fetch the token details using the HTTPClient,
            // endpoint is /pools/list
            let swapObj = {
                baseToken: {
                    details: {
                        id: "HBAR",
                        symbol: "HBAR",
                        decimals: 8
                    },
                    amount: {
                        value: new Decimal(1)
                    }                    
                },
                swapToken: {
                    details: {
                        id: "0.0.786931",
                        symbol: "HSUITE",
                        decimals: 4
                    },
                    amount: {
                        // set the amount you want to swap here, in this case 1 HBAR...
                        value: new Decimal(280)
                    }
                },
            };

            let swapRequest = await httpClientApi.post('/pools/dex/swap-request', {
                senderId: finalCustomer.account,
                socketWallet: operator[network].id,
                swap: swapObj,
                customPrefix: 'custom prefix'
            });

            // in this demo, we will sign it with the final customer private key, so to emulate the real user...
            // in real world, the final customer will have sign it with walletconnect sdk without executing the tnx...
            let transaction = Transaction.fromBytes(new Uint8Array(swapRequest.data.transaction.data));
            let signedTransaction = await transaction.sign(PrivateKey.fromString(finalCustomer.privateKey));

            let swapExecute = await httpClientApi.post('/pools/dex/swap-execute', {
                bytes: signedTransaction.toBytes(),
                socketWallet: operator[network].id
            });            

            console.log('swapExecute', swapExecute.data);
            console.log(`customer has successfully completed the swap.`);
            socketConnection.socket.getSocket('gateway').disconnect();
            resolve('all done');
        } catch (error) {
            reject(error);
        }
    });
}


main('mainnet').then(async (response) => {
    console.log('response', response);
}).catch(error => {
    console.error('error', error.message);
});
