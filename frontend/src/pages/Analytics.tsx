import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, Sparkles } from 'lucide-react';
import { ChartContainer } from '../components/ChartContainer';
import { api } from '../utils/api';

type ForecastTab = 'traffic' | 'pollution' | 'resources' | 'healthcare';

export const Analytics: React.FC = () => {
  const [trafficHistory, setTrafficHistory] = useState<any[]>([]);
  const [pollutionHistory, setPollutionHistory] = useState<any[]>([]);
  const [energyHistory, setEnergyHistory] = useState<any[]>([]);
  const [diseaseHistory, setDiseaseHistory] = useState<any[]>([]);
  
  const [forecastTab, setForecastTab] = useState<ForecastTab>('traffic');
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Fetch histories on mount
  useEffect(() => {
    const fetchHistories = async () => {
      try {
        const [traffic, pollution, energy, disease] = await Promise.all([
          api.getTrafficHistory(),
          api.getPollutionHistory(),
          api.getEnergyHistory(),
          api.getDiseaseHistory()
        ]);
        setTrafficHistory(traffic);
        setPollutionHistory(pollution);
        setEnergyHistory(energy);
        setDiseaseHistory(disease);
      } catch (e) {
        console.error("Failed to load historical analytics", e);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistories();
  }, []);

  // Fetch forecast data when the category tab changes
  useEffect(() => {
    const fetchForecast = async () => {
      setLoadingForecast(true);
      try {
        const data = await api.getForecast(forecastTab);
        setForecastData(data.forecast);
      } catch (e) {
        console.error(`Failed to load forecast for ${forecastTab}`, e);
      } finally {
        setLoadingForecast(false);
      }
    };
    fetchForecast();
  }, [forecastTab]);

  const customTooltipStyle = {
    contentStyle: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      border: '1px solid rgba(51, 65, 85, 0.5)',
      borderRadius: '12px',
      color: '#F8FAFC',
      fontSize: '11px',
    },
    labelStyle: {
      fontWeight: 'bold',
      color: '#94A3B8',
      marginBottom: '4px',
    }
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="text-blue-500" />
            Decision Intelligence & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Historical logs and automated machine learning forecasts powered by Google Cloud Vertex AI
          </p>
        </div>
      </div>

      {/* 2. Vertex AI Predictive Forecast Module */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-blue-500 animate-pulse" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Vertex AI Forecasting Hub
            </h3>
          </div>

          {/* Forecasting Tab Selectors */}
          <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
            {(['traffic', 'pollution', 'resources', 'healthcare'] as ForecastTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setForecastTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
                  forecastTab === tab 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab === 'resources' ? 'Utilities load' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Prediction Chart Area */}
        <div className="relative">
          {loadingForecast && (
            <div className="absolute inset-0 bg-white/75 dark:bg-slate-900/75 z-40 flex items-center justify-center font-bold text-xs">
              Calculating future predictions...
            </div>
          )}

          {forecastData.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                  {forecastTab === 'healthcare' ? '5-Day Disease Case Projections' : '24-Hour Adaptive Forecasting (Confidence Interval)'}
                </span>
                <span className="text-[10px] font-bold text-blue-500 flex items-center gap-1">
                  <TrendingUp size={12} />
                  Confidence Limit: 95%
                </span>
              </div>
              
              {forecastTab === 'traffic' && (
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={forecastData.map(item => ({
                        ...item,
                        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }))}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="foreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <Tooltip {...customTooltipStyle} />
                      <Area type="monotone" dataKey="confidence_upper" stroke="none" fill="#3B82F6" fillOpacity={0.1} name="Upper Bound Limit" />
                      <Area type="monotone" dataKey="congestion_predicted" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#foreGrad)" name="Congestion Forecast %" />
                      <Area type="monotone" dataKey="confidence_lower" stroke="none" fill="#F8FAFC" fillOpacity={0.5} name="Lower Bound Limit" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {forecastTab === 'pollution' && (
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={forecastData.map(item => ({
                        ...item,
                        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }))}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="pollGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <Tooltip {...customTooltipStyle} />
                      <Area type="monotone" dataKey="confidence_upper" stroke="none" fill="#10B981" fillOpacity={0.1} name="Upper Bound Limit" />
                      <Area type="monotone" dataKey="aqi_predicted" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#pollGrad)" name="AQI Forecast" />
                      <Area type="monotone" dataKey="confidence_lower" stroke="none" fill="#F8FAFC" fillOpacity={0.5} name="Lower Bound Limit" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {forecastTab === 'resources' && (
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={forecastData.map(item => ({
                        ...item,
                        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }))}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="resourceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <Tooltip {...customTooltipStyle} />
                      <Area type="monotone" dataKey="electricity_mw_predicted" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#resourceGrad)" name="Electricity Load Forecast (MW)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {forecastTab === 'healthcare' && (
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <Tooltip {...customTooltipStyle} />
                      <Area type="monotone" dataKey="Dengue_predicted" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} name="Predicted Dengue" />
                      <Area type="monotone" dataKey="Influenza_predicted" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} name="Predicted Influenza" />
                      <Area type="monotone" dataKey="Gastroenteritis_predicted" stroke="#10B981" fill="#10B981" fillOpacity={0.1} name="Predicted Gastro" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Historical Telemetry Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Traffic history */}
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Transportation History
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Congestion trends across main street lines (7 days hourly)
            </p>
          </div>
          {!loadingHistory && trafficHistory.length > 0 && (
            <ChartContainer type="traffic" data={trafficHistory} />
          )}
        </div>

        {/* Pollution history */}
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Environmental Telemetry History
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Correlated AQI index shifts and PM2.5 levels (7 days hourly)
            </p>
          </div>
          {!loadingHistory && pollutionHistory.length > 0 && (
            <ChartContainer type="pollution" data={pollutionHistory} />
          )}
        </div>

        {/* Grid resource load history */}
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Utilities Load Patterns
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Hourly electricity load (MW) vs water distribution rate (KL)
            </p>
          </div>
          {!loadingHistory && energyHistory.length > 0 && (
            <ChartContainer type="energy" data={energyHistory} />
          )}
        </div>

        {/* Public health disease history */}
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Public Health Tracking
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Weekly active disease cases (Dengue, Influenza, Gastro)
            </p>
          </div>
          {!loadingHistory && diseaseHistory.length > 0 && (
            <ChartContainer type="disease" data={diseaseHistory} />
          )}
        </div>

      </div>
    </div>
  );
};
