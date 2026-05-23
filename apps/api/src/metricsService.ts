import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const METRICS_FILE = path.join(DATA_DIR, 'metrics.json');

export interface Metrics {
    totalVolume: number; // En USD
    totalFees: number;   // En USD
    activeAgents: string[]; // IDs de agentes únicos
}

// Inicializar archivo de métricas si no existe
function ensureMetricsFile() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(METRICS_FILE)) {
        const defaultMetrics: Metrics = {
            totalVolume: 0,
            totalFees: 0,
            activeAgents: []
        };
        fs.writeFileSync(METRICS_FILE, JSON.stringify(defaultMetrics, null, 2), 'utf-8');
    }
}

export function getMetrics(): Metrics {
    ensureMetricsFile();
    try {
        const data = fs.readFileSync(METRICS_FILE, 'utf-8');
        return JSON.parse(data) as Metrics;
    } catch (error) {
        console.error('Error reading metrics file:', error);
        return { totalVolume: 0, totalFees: 0, activeAgents: [] };
    }
}

export function saveMetrics(metrics: Metrics) {
    ensureMetricsFile();
    try {
        fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing metrics file:', error);
    }
}

export function addTransactionMetrics(amountInWei: string, tokenAddress: string, agentId?: string) {
    const metrics = getMetrics();

    // Estimar el valor en USD
    let usdValue = 0;
    const tokenLower = tokenAddress.toLowerCase();
    
    // Si es USDC (6 decimales) o similar
    if (
        tokenLower === '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9' || 
        tokenLower.includes('usdc') || 
        tokenLower.includes('usdt')
    ) {
        usdValue = parseFloat(amountInWei) / 1e6;
    } else {
        // Asumiendo 18 decimales (ej. WETH, ETH, etc.)
        const tokenAmount = parseFloat(amountInWei) / 1e18;
        // Simulamos un precio promedio de $3,000 USD por ETH para calcular el volumen en dólares
        usdValue = tokenAmount * 3000;
    }

    // Si el cálculo da inválido, usar un valor por defecto para la simulación
    if (isNaN(usdValue) || usdValue <= 0) {
        usdValue = 1000; // Por defecto $1,000 de volumen si no se puede parsear
    }

    const feeValue = usdValue * 0.001; // 0.1% de comisión

    metrics.totalVolume += usdValue;
    metrics.totalFees += feeValue;

    // Registrar agente de IA
    const finalAgentId = agentId || 'Agente-Anonimo';
    if (!metrics.activeAgents.includes(finalAgentId)) {
        metrics.activeAgents.push(finalAgentId);
    }

    saveMetrics(metrics);
    return {
        usdValue,
        feeValue,
        agentId: finalAgentId
    };
}
