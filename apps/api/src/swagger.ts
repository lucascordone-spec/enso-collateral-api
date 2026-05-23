export const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'DeFi Agent Collateral API',
        version: '1.0.0',
        description: 'API for AI Agents to execute atomic leverage and deleverage operations using Flash Loans via Enso Finance. Operations automatically extract a 0.1% fee to the protocol treasury.'
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Local development server'
        }
    ],
    paths: {
        '/api/v1/build-collateral': {
            post: {
                summary: 'Build a leveraged collateral position atomically',
                description: 'Generates an unsigned transaction payload that uses flash loans to build a leveraged position on a specified lending protocol.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    chainId: { type: 'integer', example: 42161, description: 'The network chain ID (e.g. 42161 for Arbitrum, 8453 for Base)' },
                                    userAddress: { type: 'string', example: '0x123...', description: 'The wallet address of the user who will sign the transaction' },
                                    tokenToDeposit: { type: 'string', example: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', description: 'Contract address of the token to deposit (e.g. WETH on Arbitrum)' },
                                    tokenToBorrow: { type: 'string', example: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', description: 'Contract address of the token to borrow (e.g. USDC on Arbitrum)' },
                                    amount: { type: 'string', example: '1000000000000000000', description: 'Amount of initial capital in WEI' },
                                    leverageMultiplier: { type: 'number', example: 2.5, description: 'The desired leverage multiplier (e.g. 2.5x)' }
                                },
                                required: ['chainId', 'userAddress', 'tokenToDeposit', 'tokenToBorrow', 'amount', 'leverageMultiplier']
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Transaction payload generated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' },
                                        fee_applied_bps: { type: 'string' },
                                        fee_receiver: { type: 'string' },
                                        transaction: {
                                            type: 'object',
                                            properties: {
                                                to: { type: 'string' },
                                                data: { type: 'string' },
                                                value: { type: 'string' },
                                                chainId: { type: 'integer' }
                                            }
                                        },
                                        estimatedGas: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/dismantle-collateral': {
            post: {
                summary: 'Dismantle a leveraged collateral position atomically',
                description: 'Generates an unsigned transaction payload that uses flash loans to repay the debt, withdraw collateral, and swap to a target token, leaving no remaining debt.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    chainId: { type: 'integer', example: 42161 },
                                    userAddress: { type: 'string', example: '0x123...' },
                                    tokenDeposited: { type: 'string', example: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' },
                                    tokenBorrowed: { type: 'string', example: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' },
                                    targetTokenToReceive: { type: 'string', example: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', description: 'Token the user wishes to receive after deleveraging' }
                                },
                                required: ['chainId', 'userAddress', 'tokenDeposited', 'tokenBorrowed', 'targetTokenToReceive']
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Transaction payload generated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' },
                                        fee_applied_bps: { type: 'string' },
                                        fee_receiver: { type: 'string' },
                                        transaction: {
                                            type: 'object',
                                            properties: {
                                                to: { type: 'string' },
                                                data: { type: 'string' },
                                                value: { type: 'string' },
                                                chainId: { type: 'integer' }
                                            }
                                        },
                                        estimatedGas: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
