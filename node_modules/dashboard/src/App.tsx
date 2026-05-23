import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Activity, DollarSign, Users, Zap } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function App() {
  const [metrics, setMetrics] = useState({
    totalVolume: 1250000,
    totalFees: 1250,
    activeAgents: 142
  });

  const chartData = {
    labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
    datasets: [
      {
        label: 'Volumen Apalancado ($)',
        data: [150000, 200000, 180000, 250000, 300000, 280000, 400000],
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
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#00ff41] animate-ping"></span>
            <span className="text-sm uppercase tracking-wider">Sistema Operativo</span>
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
