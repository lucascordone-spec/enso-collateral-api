import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Initialize MCP Server
const server = new Server(
  {
    name: "enso-collateral-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register list tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "build_collateral_leverage",
        description:
          "Generate transaction payload data to build a leveraged collateral position using Enso Finance flash loans. The transaction is pre-configured with a 0.1% fee routed automatically to the user's Metamask wallet.",
        inputSchema: {
          type: "object",
          properties: {
            chainId: {
              type: "number",
              description: "The EVM chain ID (e.g., 1 for Ethereum Mainnet, 42161 for Arbitrum, 10 for Optimism)",
            },
            userAddress: {
              type: "string",
              description: "The Ethereum address of the user who will sign and execute the transaction",
            },
            tokenToDeposit: {
              type: "string",
              description: "The contract address of the collateral token to deposit (e.g., WETH contract address)",
            },
            tokenToBorrow: {
              type: "string",
              description: "The contract address of the token to borrow (debt token, e.g., USDC contract address)",
            },
            amount: {
              type: "string",
              description: "The amount of collateral to deposit (in wei, e.g., '1000000000000000000' for 1 WETH)",
            },
            leverageMultiplier: {
              type: "number",
              description: "The leverage multiplier to target (e.g., 2 for 2x leverage)",
            },
          },
          required: ["chainId", "userAddress", "tokenToDeposit", "tokenToBorrow", "amount", "leverageMultiplier"],
        },
      },
      {
        name: "dismantle_collateral_leverage",
        description:
          "Generate transaction payload data to dismantle (close) a leveraged collateral position. The transaction is pre-configured with a 0.1% fee routed automatically to the user's Metamask wallet, and returns the remaining collateral.",
        inputSchema: {
          type: "object",
          properties: {
            chainId: {
              type: "number",
              description: "The EVM chain ID (e.g., 42161 for Arbitrum)",
            },
            userAddress: {
              type: "string",
              description: "The Ethereum address of the user closing the leverage position",
            },
            tokenDeposited: {
              type: "string",
              description: "The contract address of the deposited collateral token (e.g., Aave WETH aToken)",
            },
            tokenBorrowed: {
              type: "string",
              description: "The contract address of the borrowed debt token (e.g., USDC)",
            },
            targetTokenToReceive: {
              type: "string",
              description: "The contract address of the token the user wants to receive at the end (e.g., WETH or USDC)",
            },
          },
          required: ["chainId", "userAddress", "tokenDeposited", "tokenBorrowed", "targetTokenToReceive"],
        },
      },
    ],
  };
});

// Register call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Endpoint of the running API Gateway
  const API_URL = process.env.API_GATEWAY_URL || "http://localhost:3000";

  try {
    if (name === "build_collateral_leverage") {
      const response = await fetch(`${API_URL}/api/v1/build-collateral`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        throw new Error(`API Gateway error: ${await response.text()}`);
      }

      const data = await response.json();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } else if (name === "dismantle_collateral_leverage") {
      const response = await fetch(`${API_URL}/api/v1/dismantle-collateral`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        throw new Error(`API Gateway error: ${await response.text()}`);
      }

      const data = await response.json();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error calling API Gateway: ${error.message}`,
        },
      ],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Enso Collateral MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main:", error);
  process.exit(1);
});
