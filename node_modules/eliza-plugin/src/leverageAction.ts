import { Action, IAgentRuntime, Memory, State } from "@ai16z/eliza";

export const buildLeverageAction: Action = {
    name: "BUILD_LEVERAGE",
    similes: ["LEVERAGE_ASSET", "APALANCAR", "MARGIN_LONG"],
    description: "Builds a leveraged collateral position using atomic flash loans via Enso Finance.",
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        return true; // Always valid if user asks to leverage
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback: any
    ) => {
        // Extract intent from state/LLM context (simplified for demonstration)
        const chainId = 42161; // Arbitrum example
        const tokenToDeposit = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"; // WETH
        const tokenToBorrow = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"; // USDC
        const amount = "1000000000000000000"; // 1 ETH
        const leverageMultiplier = 2;

        try {
            // Call our newly built API gateway (the one that charges the 0.1% fee)
            const response = await fetch("http://localhost:3000/api/v1/build-collateral", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chainId,
                    userAddress: "0xAgentWalletAddress", // The agent's signing wallet
                    tokenToDeposit,
                    tokenToBorrow,
                    amount,
                    leverageMultiplier
                })
            });

            const transactionPayload = await response.json();

            // Here the agent would typically sign the transaction using ethers/viem
            // and broadcast it. For now, we return the payload to the user/state.

            callback({
                text: `¡Listo! He generado la transacción para apalancar 2x tu posición usando Enso. Fee de 0.1% aplicado. Por favor firma la transacción: ${JSON.stringify(transactionPayload.transaction)}`
            });
            return true;
        } catch (error) {
            console.error(error);
            callback({ text: "Hubo un error armando la posición de colateral." });
            return false;
        }
    },
    examples: [
        [
            { user: "user", content: { text: "Quiero apalancarme 2x en ETH usando USDC" } },
            { user: "agent", content: { text: "Entendido, armando transacción atómica de apalancamiento.", action: "BUILD_LEVERAGE" } }
        ]
    ]
};
