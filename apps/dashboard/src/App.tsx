import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Activity, DollarSign, Users, Zap } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function App() {
  const [metrics, setMetrics] = useState({
    totalVolume: 0,
    totalFees: 0,
    activeAgents: 0
  });
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/v1/metrics');
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
    const interval = setInterval(fetchMetrics, 3000); // Polling cada 3 segundos
    return () => clearInterval(interval);
  }, []);

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
          metrics.totalVolume // Escala según el volumen real
        ],
        borderColor: '#00ff41',
        backgroundColor: 'rgba(0, 255, 65, 0.2)',
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
    <div className="min-h-screen bg-black text-[#00ff41] font-mono selection:bg-[#00ff41] selection:text-black">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00ff41]/10 via-black to-black -z-10"></div>
      
      <header className="border-b border-[#00ff41]/30 bg-black/50 backdrop-blur-md p-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-widest uppercase">Enso Agent Gateway</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-[#00ff41] animate-ping' : 'bg-red-500 animate-pulse'}`}></span>
            <span className={`text-sm uppercase tracking-wider ${isOnline ? 'text-[#00ff41]' : 'text-red-500 font-bold'}`}>
              {isOnline ? 'Sistema Online' : 'Desconectado'}
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
                <p className="text-sm text-[#00ff41]/70 uppercase tracking-wider mb-1">Volumen Total Procesado</p>
                <h3 className="text-4xl font-bold">${(metrics.totalVolume).toLocaleString()}</h3>
              </div>
              <Activity className="w-8 h-8 opacity-50" />
            </div>
          </div>

          <div className="bg-black/80 border border-[#00ff41]/40 p-6 rounded-sm shadow-[0_0_15px_rgba(0,255,65,0.1)] hover:shadow-[0_0_25px_rgba(0,255,65,0.3)] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff41] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 delay-100"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-[#00ff41]/70 uppercase tracking-wider mb-1">Tus Ganancias (0.1% Fee)</p>
                <h3 className="text-4xl font-bold">${(metrics.totalFees).toLocaleString()}</h3>
              </div>
              <DollarSign className="w-8 h-8 opacity-50" />
            </div>
          </div>

          <div className="bg-black/80 border border-[#00ff41]/40 p-6 rounded-sm shadow-[0_0_15px_rgba(0,255,65,0.1)] hover:shadow-[0_0_25px_rgba(0,255,65,0.3)] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff41] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 delay-200"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-[#00ff41]/70 uppercase tracking-wider mb-1">Plugins de Agentes Activos</p>
                <h3 className="text-4xl font-bold">{metrics.activeAgents}</h3>
              </div>
              <Users className="w-8 h-8 opacity-50" />
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-black/80 border border-[#00ff41]/40 p-6 rounded-sm shadow-[0_0_15px_rgba(0,255,65,0.1)]">
          <h2 className="text-xl mb-6 uppercase tracking-wider border-b border-[#00ff41]/30 pb-2 inline-block">Tráfico de Red</h2>
          <div className="h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
