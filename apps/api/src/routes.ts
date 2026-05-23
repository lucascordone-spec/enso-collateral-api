import { Express, Request, Response } from 'express';
import { generateLeverageBundle, generateDeleverageBundle } from './ensoService';

export function setupRoutes(app: Express) {
    app.post('/api/v1/build-collateral', async (req: Request, res: Response) => {
        try {
            const { chainId, userAddress, tokenToDeposit, tokenToBorrow, amount, leverageMultiplier } = req.body;
            
            // Generate the Enso payload to build the leverage position
            const result = await generateLeverageBundle({
                chainId,
                userAddress,
                tokenToDeposit,
                tokenToBorrow,
                amount,
                leverageMultiplier
            });
            
            res.json(result);
        } catch (error: any) {
            console.error('Error generating build collateral transaction:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    });

    app.post('/api/v1/dismantle-collateral', async (req: Request, res: Response) => {
        try {
            const { chainId, userAddress, tokenDeposited, tokenBorrowed, targetTokenToReceive } = req.body;
            
            // Generate the Enso payload to dismantle the leverage position
            const result = await generateDeleverageBundle({
                chainId,
                userAddress,
                tokenDeposited,
                tokenBorrowed,
                targetTokenToReceive
            });
            
            res.json(result);
        } catch (error: any) {
            console.error('Error generating dismantle collateral transaction:', error);
            res.status(500).json({ error: error.message || 'Internal server error' });
        }
    });
}
