import { Express, Request, Response } from 'express';
import { generateLeverageBundle, generateDeleverageBundle } from './ensoService.js';
import { getMetrics, addTransactionMetrics } from './metricsService.js';

export function setupRoutes(app: Express) {
    app.post('/api/v1/build-collateral', async (req: Request, res: Response) => {
        try {
            const { chainId, userAddress, tokenToDeposit, tokenToBorrow, amount, leverageMultiplier, agentId } = req.body;
            
            // Generate the Enso payload to build the leverage position
            const result = await generateLeverageBundle({
                chainId,
                userAddress,
                tokenToDeposit,
                tokenToBorrow,
                amount,
                leverageMultiplier
            });
            
            // Record metrics
            const resolvedAgentId = req.headers['x-agent-id'] as string || agentId || 'Agente-Eliza';
            addTransactionMetrics(amount, tokenToDeposit, resolvedAgentId);

            res.json(result);
        } catch (error: any) {
            console.error('Error generating build collateral transaction:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    });

    app.post('/api/v1/dismantle-collateral', async (req: Request, res: Response) => {
        try {
            const { chainId, userAddress, tokenDeposited, tokenBorrowed, targetTokenToReceive, agentId } = req.body;
            
            // Generate the Enso payload to dismantle the leverage position
            const result = await generateDeleverageBundle({
                chainId,
                userAddress,
                tokenDeposited,
                tokenBorrowed,
                targetTokenToReceive
            });
            
            // Record metrics (closing a position logs volume as well, estimate $3000 volume or 1 WETH)
            const resolvedAgentId = req.headers['x-agent-id'] as string || agentId || 'Agente-Eliza';
            addTransactionMetrics("1000000000000000000", tokenDeposited, resolvedAgentId);

            res.json(result);
        } catch (error: any) {
            console.error('Error generating dismantle collateral transaction:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    });

    app.get('/api/v1/metrics', (req: Request, res: Response) => {
        try {
            const metrics = getMetrics();
            res.json({
                totalVolume: Math.round(metrics.totalVolume),
                totalFees: Number(metrics.totalFees.toFixed(2)),
                activeAgents: metrics.activeAgents.length,
                agentsList: metrics.activeAgents
            });
        } catch (error: any) {
            console.error('Error reading metrics:', error);
            res.status(500).json({ error: error.message || 'Error fetching metrics' });
        }
    });
}
