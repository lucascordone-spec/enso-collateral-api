import dotenv from 'dotenv';
dotenv.config();

const ENSO_API_URL = 'https://api.enso.finance/api/v1';
const FEE_BPS = '10'; // 0.1%
const FEE_RECEIVER = process.env.FEE_RECEIVER_ADDRESS || '0x0000000000000000000000000000000000000000'; // TODO: User should set this in .env

export interface LeverageParams {
    chainId: number;
    userAddress: string;
    tokenToDeposit: string;
    tokenToBorrow: string;
    amount: string; // In wei
    leverageMultiplier: number; // e.g. 2 for 2x leverage
}

export interface DeleverageParams {
    chainId: number;
    userAddress: string;
    tokenDeposited: string;
    tokenBorrowed: string;
    targetTokenToReceive: string; // The token the user wants back at the end
}

/**
 * Generates an Enso Bundle to build a leverage position.
 */
export async function generateLeverageBundle(params: LeverageParams) {
    // In a real implementation, we construct the Bundle API payload.
    // For this example, we'll demonstrate using Enso's Route/Bundle payload structure 
    // integrating the Flashloan -> Deposit -> Borrow -> Swap(if needed) -> Repay Flashloan loop.
    
    // We are requesting Enso to route the intents and apply our fee.
    const queryParams = new URLSearchParams({
        chainId: params.chainId.toString(),
        fromAddress: params.userAddress,
        fee: FEE_BPS,
        feeReceiver: FEE_RECEIVER
    });

    // Note: This is an illustrative payload for the Enso Bundle API.
    // Enso handles complex shortcuts via their API where you specify the 'protocol' and 'action'
    const bundlePayload = [
        {
            protocol: 'aave-v3',
            action: 'deposit',
            args: {
                tokenIn: params.tokenToDeposit,
                amountIn: params.amount,
                // Leverage logic implies flash loaning to deposit more, which Enso's advanced routes support.
            }
        }
        // Additional steps would be injected here for flash loans, borrows, and fee deductions.
    ];

    /* 
    const response = await fetch(`${ENSO_API_URL}/bundle?${queryParams.toString()}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ENSO_API_KEY}`
        },
        body: JSON.stringify(bundlePayload)
    });
    
    if (!response.ok) {
        throw new Error(`Enso API error: ${await response.text()}`);
    }
    
    return await response.json();
    */

    // For the sake of the template, we return a structured mock response 
    // that the AI agent will consume and sign.
    return {
        message: "Enso transaction payload generated successfully",
        fee_applied_bps: FEE_BPS,
        fee_receiver: FEE_RECEIVER,
        transaction: {
            to: "0xEnsoUniversalRouterAddress...", // Example
            data: "0x...", // The raw calldata for the user to sign
            value: "0",
            chainId: params.chainId
        },
        estimatedGas: "500000"
    };
}

/**
 * Generates an Enso Bundle to dismantle a leverage position.
 */
export async function generateDeleverageBundle(params: DeleverageParams) {
    const queryParams = new URLSearchParams({
        chainId: params.chainId.toString(),
        fromAddress: params.userAddress,
        fee: FEE_BPS,
        feeReceiver: FEE_RECEIVER
    });

    // Dismantling requires Flash Loan -> Repay Debt -> Withdraw Collateral -> Repay Flash Loan -> Swap remainder to target token
    const bundlePayload = [
        {
            protocol: 'aave-v3',
            action: 'withdraw',
            args: {
                tokenOut: params.targetTokenToReceive,
                // This triggers the internal deleverage shortcut on Enso
            }
        }
    ];

    // For the sake of the template, returning the payload structure
    return {
        message: "Enso deleverage payload generated successfully",
        fee_applied_bps: FEE_BPS,
        fee_receiver: FEE_RECEIVER,
        transaction: {
            to: "0xEnsoUniversalRouterAddress...",
            data: "0x...", // Raw calldata to sign
            value: "0",
            chainId: params.chainId
        },
        estimatedGas: "600000"
    };
}
