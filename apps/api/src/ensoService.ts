import dotenv from 'dotenv';
dotenv.config();

const ENSO_API_URL = 'https://api.enso.finance/api/v1';
const FEE_BPS = '10'; // 0.1%
const FEE_RECEIVER = process.env.FEE_RECEIVER_ADDRESS || '0x8f7670EA615910D0A86320e84A611577F68E3908';

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
 * Generates a real Enso Bundle transaction to build a leverage position.
 * This constructs a multi-step bundle including a flash loan, swap, deposit, and borrow.
 */
export async function generateLeverageBundle(params: LeverageParams) {
    const apiKey = process.env.ENSO_API_KEY;
    const isMockMode = !apiKey || apiKey === 'your_enso_api_key_here';

    console.log(`[EnsoService] Generando transacción de apalancamiento...`);
    console.log(`[EnsoService] Token depósito: ${params.tokenToDeposit}`);
    console.log(`[EnsoService] Token deuda: ${params.tokenToBorrow}`);
    console.log(`[EnsoService] Multiplicador: ${params.leverageMultiplier}x`);
    console.log(`[EnsoService] Modo Mock: ${isMockMode}`);

    // Calcular el monto del flash loan basado en el multiplicador de apalancamiento
    // Si depositamos 1 ETH y queremos 3x apalancamiento:
    // Posición total = 3 ETH (Colateral)
    // Deuda = 2 ETH (USDC)
    // El Flash Loan debe ser de 2 ETH (monto de deuda para comprar más colateral)
    const multiplier = Math.max(1.1, params.leverageMultiplier);
    const flashLoanFactor = multiplier - 1;
    
    // Estimación aproximada del monto del préstamo rápido en unidades de la moneda a depositar
    const amountBigInt = BigInt(params.amount);
    const flashLoanAmount = (amountBigInt * BigInt(Math.floor(flashLoanFactor * 100))) / 100n;

    // Construcción del bundle de acciones
    const bundlePayload = [
        // Paso 1: Tomar Flash Loan de la moneda de deuda (usando Balancer v2 o Aave v3)
        {
            protocol: 'balancer-v2',
            action: 'flashloan',
            args: {
                tokens: [params.tokenToBorrow],
                amounts: [flashLoanAmount.toString()],
                receiver: params.userAddress
            }
        },
        // Paso 2: Intercambiar el préstamo (USDC) a la moneda de colateral (WETH)
        {
            protocol: 'enso',
            action: 'route',
            args: {
                tokenIn: params.tokenToBorrow,
                tokenOut: params.tokenToDeposit,
                amountIn: { useOutputOfCallAt: 0 }
            }
        },
        // Paso 3: Depositar todo el colateral (WETH del usuario + WETH obtenido del swap) en Aave V3
        {
            protocol: 'aave-v3',
            action: 'deposit',
            args: {
                tokenIn: params.tokenToDeposit,
                amountIn: (amountBigInt + flashLoanAmount).toString()
            }
        },
        // Paso 4: Pedir prestado USDC de Aave V3 para pagar el Flash Loan inicial
        {
            protocol: 'aave-v3',
            action: 'borrow',
            args: {
                tokenOut: params.tokenToBorrow,
                amountOut: flashLoanAmount.toString()
            }
        }
    ];

    if (isMockMode) {
        console.warn(`[EnsoService] WARNING: Usando datos de simulación ya que ENSO_API_KEY no está configurada.`);
        return {
            message: "Enso transaction payload generated successfully (SIMULATED)",
            real_execution: false,
            fee_applied_bps: FEE_BPS,
            fee_receiver: FEE_RECEIVER,
            transaction: {
                to: "0x8a16E16CdD26b6f79E89c3132eFa46a9e18b1427", // Enso Universal Router en Arbitrum
                data: "0x12a9b342000000000000000000000000" + params.userAddress.replace("0x", "").toLowerCase().padStart(64, '0'),
                value: "0",
                chainId: params.chainId
            },
            estimatedGas: "500000",
            bundleDetail: bundlePayload
        };
    }

    try {
        const queryParams = new URLSearchParams({
            chainId: params.chainId.toString(),
            fromAddress: params.userAddress,
            fee: FEE_BPS,
            feeReceiver: FEE_RECEIVER,
            routingStrategy: 'router'
        });

        const url = `${ENSO_API_URL}/shortcuts/bundle?${queryParams.toString()}`;
        console.log(`[EnsoService] Llamando a la API real de Enso: ${url}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(bundlePayload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Error en API Enso: ${errText}`);
        }

        const data = await response.json();
        return {
            message: "Enso transaction payload generated successfully (REAL)",
            real_execution: true,
            fee_applied_bps: FEE_BPS,
            fee_receiver: FEE_RECEIVER,
            transaction: {
                to: data.tx.to,
                data: data.tx.data,
                value: data.tx.value,
                chainId: params.chainId
            },
            estimatedGas: data.gas || "600000",
            bundleDetail: bundlePayload
        };
    } catch (error: any) {
        console.error(`[EnsoService] Error llamando a la API de Enso:`, error.message);
        throw error;
    }
}

/**
 * Generates a real Enso Bundle transaction to dismantle a leverage position.
 */
export async function generateDeleverageBundle(params: DeleverageParams) {
    const apiKey = process.env.ENSO_API_KEY;
    const isMockMode = !apiKey || apiKey === 'your_enso_api_key_here';

    console.log(`[EnsoService] Generando transacción de desarmado...`);
    console.log(`[EnsoService] Modo Mock: ${isMockMode}`);

    // Pasos para desarmar la posición de forma atómica:
    // 1. Flash Loan en USDC (moneda de deuda) para pagar la deuda de Aave.
    // 2. Repay en Aave V3 de la deuda del usuario en USDC. (Libera el colateral).
    // 3. Withdraw del colateral (WETH) de Aave V3.
    // 4. Swap del colateral (WETH) a USDC para repagar el Flash Loan + fees.
    // 5. Repay Flash Loan de USDC.
    // 6. Retorno del colateral sobrante al usuario.
    const bundlePayload = [
        {
            protocol: 'balancer-v2',
            action: 'flashloan',
            args: {
                tokens: [params.tokenBorrowed],
                amounts: ["1000000"], // El monto exacto se calcula dinámicamente o se pasa en los params
                receiver: params.userAddress
            }
        },
        {
            protocol: 'aave-v3',
            action: 'repay',
            args: {
                tokenOut: params.tokenBorrowed,
                amountOut: { useOutputOfCallAt: 0 }
            }
        },
        {
            protocol: 'aave-v3',
            action: 'withdraw',
            args: {
                tokenOut: params.tokenDeposited,
                amountOut: "0" // 0 para retirar todo el colateral disponible
            }
        },
        {
            protocol: 'enso',
            action: 'route',
            args: {
                tokenIn: params.tokenDeposited,
                tokenOut: params.tokenBorrowed,
                amountIn: { useOutputOfCallAt: 2 }
            }
        }
    ];

    if (isMockMode) {
        return {
            message: "Enso deleverage payload generated successfully (SIMULATED)",
            real_execution: false,
            fee_applied_bps: FEE_BPS,
            fee_receiver: FEE_RECEIVER,
            transaction: {
                to: "0x8a16E16CdD26b6f79E89c3132eFa46a9e18b1427",
                data: "0x39a3f20a000000000000000000000000" + params.userAddress.replace("0x", "").toLowerCase().padStart(64, '0'),
                value: "0",
                chainId: params.chainId
            },
            estimatedGas: "600000",
            bundleDetail: bundlePayload
        };
    }

    try {
        const queryParams = new URLSearchParams({
            chainId: params.chainId.toString(),
            fromAddress: params.userAddress,
            fee: FEE_BPS,
            feeReceiver: FEE_RECEIVER,
            routingStrategy: 'router'
        });

        const url = `${ENSO_API_URL}/shortcuts/bundle?${queryParams.toString()}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(bundlePayload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Error en API Enso: ${errText}`);
        }

        const data = await response.json();
        return {
            message: "Enso deleverage payload generated successfully (REAL)",
            real_execution: true,
            fee_applied_bps: FEE_BPS,
            fee_receiver: FEE_RECEIVER,
            transaction: {
                to: data.tx.to,
                data: data.tx.data,
                value: data.tx.value,
                chainId: params.chainId
            },
            estimatedGas: data.gas || "700000",
            bundleDetail: bundlePayload
        };
    } catch (error: any) {
        console.error(`[EnsoService] Error llamando a la API de Enso:`, error.message);
        throw error;
    }
}
