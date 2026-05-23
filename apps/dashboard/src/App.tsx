import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Activity, DollarSign, Users, Terminal as TerminalIcon, Play, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warn';
}

function App() {
  const [metrics, setMetrics] = useState({
    totalVolume: 0,
    totalFees: 0,
    activeAgents: 0
  });
  const [isOnline, setIsOnline] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Campos del visualizador
  const [simToken, setSimToken] = useState('WETH');
  const [simAmount, setSimAmount] = useState('1.5');
  const [simLeverage, setSimLeverage] = useState(3);
  const [operationType, setOperationType] = useState<'build' | 'dismantle'>('build');
  const [simulating, setSimulating] = useState(false);
  
  // Detalle de transacción generada
  const [generatedTx, setGeneratedTx] = useState<any>(null);
  const [bundleSteps, setBundleSteps] = useState<any[]>([]);

  // Inicializar logs de sistema
  useEffect(() => {
    setLogs([
      { id: '1', timestamp: new Date().toLocaleTimeString(), message: 'CONEXIÓN INICIAL CON GATEWAY ESTABLECIDA.', type: 'info' },
      { id: '2', timestamp: new Date().toLocaleTimeString(), message: 'SISTEMA DE MONITOREO MCP INICIADO EN PUERTO 3000.', type: 'info' },
      { id: '3', timestamp: new Date().toLocaleTimeString(), message: 'RUTEADOR DE ENLACES DE COMISIÓN (0.1% FEE) ONLINE.', type: 'success' },
      { id: '4', timestamp: new Date().toLocaleTimeString(), message: 'LISTO PARA PROCESAR TRANSCACCIONES ATÓMICAS EN SO-OS.', type: 'info' },
    ]);
  }, []);

  // Polling de métricas de la API
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/v1/metrics');
        if (!response.ok) throw new Error('API offline');
        const data = await response.json();
        setMetrics({
          totalVolume: data.totalVolume,
          totalFees: data.totalFees,
          activeAgents: data.activeAgents
        });
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  // Ejecutar transacción llamando a la API real
  const runGeneration = async () => {
    if (!isOnline) {
      alert('Error: La API Gateway no está en línea. Asegúrate de ejecutar el servidor en el puerto 3001.');
      return;
    }
    setSimulating(true);
    setGeneratedTx(null);
    setBundleSteps([]);

    const agents = ['Agente-Eliza-Alpha', 'Agente-MCP-Omega', 'Agente-Auto-DeFi', 'Bot-Trading-Quant', 'Agente-Yield-Max'];
    const randomAgent = agents[Math.floor(Math.random() * agents.length)] || 'Agente-Misterioso';

    let rawAmount = "1500000000000000000"; // 1.5 WETH en wei
    let tokenAddress = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"; // WETH
    let borrowAddress = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"; // USDC

    if (simToken === 'USDC') {
      rawAmount = (parseFloat(simAmount) * 1e6).toString(); // USDC tiene 6 decimales
      tokenAddress = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
      borrowAddress = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
    } else {
      rawAmount = (parseFloat(simAmount) * 1e18).toString();
    }

    try {
      const endpoint = operationType === 'build' ? 'build-collateral' : 'dismantle-collateral';
      const bodyParams = operationType === 'build' 
        ? {
            chainId: 42161, // Arbitrum
            userAddress: '0x8f7670EA615910D0A86320e84A611577F68E3908', // Metamask
            tokenToDeposit: tokenAddress,
            tokenToBorrow: borrowAddress,
            amount: rawAmount,
            leverageMultiplier: simLeverage,
            agentId: randomAgent
          }
        : {
            chainId: 42161,
            userAddress: '0x8f7670EA615910D0A86320e84A611577F68E3908',
            tokenDeposited: tokenAddress,
            tokenBorrowed: borrowAddress,
            targetTokenToReceive: tokenAddress,
            agentId: randomAgent
          };

      setLogs(prev => [
        {
          id: Date.now().toString() + '-1',
          timestamp: new Date().toLocaleTimeString(),
          message: `[INFO] [${randomAgent}] Iniciando compilación de Bundle Atómico en Enso...`,
          type: 'info'
        },
        ...prev
      ]);

      const response = await fetch(`http://localhost:3001/api/v1/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyParams)
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      setGeneratedTx(data.transaction);
      if (data.bundleDetail) {
        setBundleSteps(data.bundleDetail);
      }


      
      const opMsg = operationType === 'build' 
        ? `Apalancamiento ${simLeverage}x de ${simAmount} ${simToken} armado`
        : `Posición desarmada de ${simToken}`;

      setLogs(prev => [
        {
          id: Date.now().toString() + '-2',
          timestamp: new Date().toLocaleTimeString(),
          message: `[SUCCESS] [${randomAgent}] ${opMsg}. Router Enso: ${data.transaction.to.substring(0, 16)}...`,
          type: 'success'
        },
        {
          id: Date.now().toString() + '-3',
          timestamp: new Date().toLocaleTimeString(),
          message: `[SUCCESS] Calldata de transacción atómica generada exitosamente. Gas estimado: ${data.estimatedGas}`,
          type: 'success'
        },
        ...prev
      ]);
    } catch (err) {
      setLogs(prev => [
        {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          message: `[WARN] [${randomAgent}] Falló la generación de transacción. Verifica las configuraciones de red.`,
          type: 'warn'
        },
        ...prev
      ]);
    } finally {
      setSimulating(false);
    }
  };

  const chartData = {
    labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
    datasets: [
      {
        label: 'Volumen Apalancado ($)',
        data: [
          metrics.totalVolume * 0.1,
          metrics.totalVolume * 0.2,
          metrics.totalVolume * 0.15,
          metrics.totalVolume * 0.3,
          metrics.totalVolume * 0.5,
          metrics.totalVolume * 0.8,
          metrics.totalVolume
        ],
        borderColor: '#00ff41',
        backgroundColor: 'rgba(0, 255, 65, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { grid: { color: '#1a1a1a' }, ticks: { color: '#00ff41' } },
      x: { grid: { color: '#1a1a1a' }, ticks: { color: '#00ff41' } }
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#00ff41] font-mono selection:bg-[#00ff41] selection:text-black pb-12">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00ff41]/10 via-black to-black -z-10"></div>
      
      <header className="border-b border-[#00ff41]/30 bg-black/50 backdrop-blur-md p-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Cpu className="w-8 h-8 animate-pulse text-[#00ff41]" />
            <h1 className="text-2xl font-bold tracking-widest uppercase text-shadow-glow">Enso Agent Collateral Gateway</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-[#00ff41] animate-ping' : 'bg-red-500 animate-pulse'}`}></span>
            <span className={`text-sm uppercase tracking-wider ${isOnline ? 'text-[#00ff41]' : 'text-red-500 font-bold'}`}>
              {isOnline ? 'Gateway Real-time Online' : 'Desconectado'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 mt-8 space-y-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/80 border border-[#00ff41]/40 p-6 rounded-sm shadow-[0_0_15px_rgba(0,255,65,0.1)] hover:shadow-[0_0_25px_rgba(0,255,65,0.3)] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff41] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-[#00ff41]/70 uppercase tracking-wider mb-1">Volumen Real Procesado</p>
                <h3 className="text-4xl font-bold text-white">${(metrics.totalVolume).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</h3>
              </div>
              <Activity className="w-8 h-8 opacity-50" />
            </div>
          </div>

          <div className="bg-black/80 border border-[#00ff41]/40 p-6 rounded-sm shadow-[0_0_15px_rgba(0,255,65,0.1)] hover:shadow-[0_0_25px_rgba(0,255,65,0.3)] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff41] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 delay-100"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-[#00ff41]/70 uppercase tracking-wider mb-1">Acumulado Comisiones (0.1%)</p>
                <h3 className="text-4xl font-bold text-white">${(metrics.totalFees).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              </div>
              <DollarSign className="w-8 h-8 opacity-50" />
            </div>
          </div>

          <div className="bg-black/80 border border-[#00ff41]/40 p-6 rounded-sm shadow-[0_0_15px_rgba(0,255,65,0.1)] hover:shadow-[0_0_25px_rgba(0,255,65,0.3)] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff41] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 delay-200"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-[#00ff41]/70 uppercase tracking-wider mb-1">Agentes de IA Conectados</p>
                <h3 className="text-4xl font-bold text-white">{metrics.activeAgents}</h3>
              </div>
              <Users className="w-8 h-8 opacity-50" />
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-black/80 border border-[#00ff41]/40 p-6 rounded-sm shadow-[0_0_15px_rgba(0,255,65,0.1)]">
          <h2 className="text-xl mb-6 uppercase tracking-wider border-b border-[#00ff41]/30 pb-2 inline-block">Monitoreo de Volumen DeFi (USD)</h2>
          <div className="h-[300px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Interactive Simulation & Logging Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Builder Panel */}
          <div className="bg-black/80 border border-[#00ff41]/40 p-6 rounded-sm shadow-[0_0_15px_rgba(0,255,65,0.1)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 border-b border-[#00ff41]/30 pb-2">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  <h2 className="text-xl uppercase tracking-wider">Creador de Bundles Atómicos</h2>
                </div>
                <div className="flex border border-[#00ff41]/40 rounded-sm overflow-hidden text-xs">
                  <button
                    onClick={() => setOperationType('build')}
                    className={`px-3 py-1 uppercase font-bold transition-all ${operationType === 'build' ? 'bg-[#00ff41] text-black' : 'text-[#00ff41]'}`}
                  >
                    Apalancar
                  </button>
                  <button
                    onClick={() => setOperationType('dismantle')}
                    className={`px-3 py-1 uppercase font-bold transition-all ${operationType === 'dismantle' ? 'bg-[#00ff41] text-black' : 'text-[#00ff41]'}`}
                  >
                    Desarmar
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-[#00ff41]/70 block mb-2">Token Principal (Colateral)</label>
                  <div className="flex gap-4">
                    {['WETH', 'USDC'].map(t => (
                      <button
                        key={t}
                        onClick={() => {
                          setSimToken(t);
                          setSimAmount(t === 'WETH' ? '1.5' : '5000');
                        }}
                        className={`flex-1 py-2 border ${simToken === t ? 'bg-[#00ff41] text-black border-[#00ff41]' : 'border-[#00ff41]/40 text-[#00ff41] hover:border-[#00ff41]'} uppercase font-bold text-sm transition-all duration-200`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-[#00ff41]/70 block mb-2">Monto de Entrada</label>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                    className="w-full bg-black border border-[#00ff41]/40 p-3 text-white focus:outline-none focus:border-[#00ff41] font-mono"
                  />
                </div>

                {operationType === 'build' && (
                  <div>
                    <label className="text-xs uppercase tracking-wider text-[#00ff41]/70 block mb-2">Multiplicador de Apalancamiento</label>
                    <div className="flex gap-4">
                      {[2, 3, 4].map(mul => (
                        <button
                          key={mul}
                          onClick={() => setSimLeverage(mul)}
                          className={`flex-1 py-2 border ${simLeverage === mul ? 'bg-[#00ff41] text-black border-[#00ff41]' : 'border-[#00ff41]/40 text-[#00ff41] hover:border-[#00ff41]'} font-bold text-sm transition-all duration-200`}
                        >
                          {mul}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={runGeneration}
              disabled={simulating}
              className={`w-full py-4 mt-6 border-2 font-bold uppercase tracking-widest text-lg transition-all duration-300 flex items-center justify-center gap-3 ${simulating ? 'bg-black text-[#00ff41]/50 border-[#00ff41]/30 cursor-not-allowed' : 'bg-[#00ff41]/10 text-[#00ff41] border-[#00ff41] hover:bg-[#00ff41] hover:text-black cursor-pointer shadow-[0_0_15px_rgba(0,255,65,0.1)] hover:shadow-[0_0_25px_rgba(0,255,65,0.4)]'}`}
            >
              {simulating ? 'Generando Transacción Enso...' : 'Generar Calldata para Agente'}
            </button>
          </div>

          {/* System Console Logs */}
          <div className="bg-black/80 border border-[#00ff41]/40 p-6 rounded-sm shadow-[0_0_15px_rgba(0,255,65,0.1)] flex flex-col h-[420px]">
            <div className="flex items-center gap-2 mb-4 border-b border-[#00ff41]/30 pb-2">
              <TerminalIcon className="w-5 h-5 animate-pulse" />
              <h2 className="text-xl uppercase tracking-wider">Consola de Operaciones</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar text-xs font-mono">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 border-b border-[#1a1a1a] pb-1">
                  <span className="text-[#00ff41]/50">[{log.timestamp}]</span>
                  <span className={
                    log.type === 'success' ? 'text-[#00ff41] font-bold' :
                    log.type === 'warn' ? 'text-red-500' :
                    'text-[#00ff41]/80'
                  }>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Real Transaction Details (Interactive Visualizer) */}
        {generatedTx && (
          <div className="bg-black/90 border-2 border-[#00ff41] p-6 rounded-sm shadow-[0_0_25px_rgba(0,255,65,0.25)] space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-[#00ff41]/30 pb-3">
              <ShieldCheck className="w-6 h-6 animate-pulse text-[#00ff41]" />
              <h2 className="text-xl uppercase tracking-widest font-bold">Payload de Transacción Generada (Real/Lista para Firmar)</h2>
            </div>

            {/* Flash loan steps visualization */}
            {bundleSteps.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm uppercase tracking-wider text-[#00ff41]/70">Flujo Atómico del Flash Loan:</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {bundleSteps.map((step, idx) => (
                    <div key={idx} className="bg-black/50 border border-[#00ff41]/30 p-4 rounded-sm relative flex flex-col justify-between group hover:border-[#00ff41] transition-all">
                      <div className="text-[10px] text-[#00ff41]/50 absolute top-2 right-2">PASO 0{idx + 1}</div>
                      <div>
                        <div className="text-xs font-bold uppercase text-white mb-1">{step.protocol}</div>
                        <div className="text-[11px] text-[#00ff41] uppercase tracking-wider">{step.action}</div>
                      </div>
                      {idx < bundleSteps.length - 1 && (
                        <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-black p-1 border border-[#00ff41]/30 rounded-full">
                          <ArrowRight className="w-3 h-3 text-[#00ff41]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-[#00ff41]/20">
              <div className="lg:col-span-2 space-y-3">
                <div>
                  <span className="text-xs uppercase text-[#00ff41]/70 block mb-1">Destinatario (Enso Universal Router)</span>
                  <div className="bg-black border border-[#00ff41]/40 p-2 text-xs text-white break-all select-all">
                    {generatedTx.to}
                  </div>
                </div>
                <div>
                  <span className="text-xs uppercase text-[#00ff41]/70 block mb-1">Datos de Ejecución (Calldata)</span>
                  <div className="bg-black border border-[#00ff41]/40 p-2 text-[10px] text-white break-all h-24 overflow-y-auto select-all custom-scrollbar">
                    {generatedTx.data}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-[#00ff41]/5 border border-[#00ff41]/30 p-4 rounded-sm h-full flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase text-[#00ff41]/70 block mb-1">Valor (Value in Wei)</span>
                    <div className="text-2xl font-bold text-white mb-4">{generatedTx.value}</div>
                    
                    <span className="text-xs uppercase text-[#00ff41]/70 block mb-1">Red</span>
                    <div className="text-sm font-bold text-white mb-4">Arbitrum (ID: {generatedTx.chainId})</div>
                  </div>
                  <div className="text-[10px] text-[#00ff41]/60 leading-relaxed border-t border-[#00ff41]/20 pt-2">
                    Copia estos datos en tu agente de IA (como Eliza OS) para firmar y emitir directamente en la blockchain de Arbitrum.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
