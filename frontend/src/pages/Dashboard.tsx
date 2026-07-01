import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Wind, 
  HeartPulse, 
  MessageSquare, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  CheckSquare, 
  Clock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { StatCard } from '../components/StatCard';
import { LeafletMap } from '../components/LeafletMap';
import { api } from '../utils/api';

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  
  const [metrics, setMetrics] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  
  const [mapMode, setMapMode] = useState<'traffic' | 'pollution' | 'hospitals' | 'emergency'>('traffic');
  const [loading, setLoading] = useState(true);

  // Fetch all dashboard data concurrently
  const loadDashboardData = async () => {
    try {
      const [m, r, a, tData, f] = await Promise.all([
        api.getMetrics(),
        api.getRecommendations(),
        api.getAlerts(),
        api.getTasks(),
        api.listComplaints()
      ]);
      setMetrics(m);
      setRecommendations(r);
      setAlerts(a);
      setTasks(tData);
      setFeedback(f);
    } catch (e) {
      console.error("Error fetching dashboard telemetry", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // Poll data every 30 seconds for live feel
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveTask = async (taskId: string) => {
    try {
      await api.updateTaskStatus(taskId, 'Completed');
      // reload task list from backend
      const updatedTasks = await api.getTasks();
      setTasks(updatedTasks);
    } catch (e) {
      console.error("Failed to update task status", e);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center font-bold text-sm">
        <div className="flex flex-col items-center gap-2">
          <span className="animate-spin text-blue-600 font-extrabold text-2xl">O</span>
          <span>Loading city systems telemetry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Statistics Cards Grid */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title={t('traffic_congestion')}
            value={`${metrics.traffic.congestion_pct}%`}
            icon={Car}
            trendText={metrics.traffic.trend_text}
            trend={metrics.traffic.trend}
            status={metrics.traffic.congestion_pct > 70 ? 'danger' : metrics.traffic.congestion_pct > 40 ? 'warning' : 'brand'}
            sparklineData={[30, 32, 35, 42, 38, 36, 40]}
          />
          <StatCard
            title={t('air_quality')}
            value={`${metrics.aqi.value} AQI`}
            icon={Wind}
            trendText={metrics.aqi.trend_text}
            trend={metrics.aqi.trend}
            status={metrics.aqi.value > 150 ? 'danger' : metrics.aqi.value > 100 ? 'warning' : 'success'}
            sparklineData={[50, 48, 45, 42, 44, 42, 40]}
          />
          <StatCard
            title={t('healthcare_alerts')}
            value={`${metrics.healthcare.bed_occupancy_pct}%`}
            icon={HeartPulse}
            trendText={`${metrics.healthcare.active_alerts} Alerts`}
            trend="none"
            status={metrics.healthcare.bed_occupancy_pct > 85 ? 'danger' : 'success'}
            sparklineData={[72, 73, 75, 74, 76, 74, 75]}
          />
          <StatCard
            title={t('feedback_total')}
            value={metrics.complaints.total}
            icon={MessageSquare}
            trendText={`+${metrics.complaints.new_today} today`}
            trend="up"
            status="brand"
            sparklineData={[10, 11, 13, 12, 14, 15, 18]}
          />
        </div>
      )}

      {/* 2. Main Map & Recommendations Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Geographic Telemetry Grid
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click map overlays to toggle sectors
              </p>
            </div>
            {/* Map toggle controls */}
            <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-fit">
              {(['traffic', 'pollution', 'hospitals', 'emergency'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setMapMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
                    mapMode === mode 
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          
          {/* Map */}
          <LeafletMap viewMode={mapMode} alerts={alerts} feedback={feedback} />

          {/* Inline Weather & Transit Forecast Widget Row */}
          {metrics && metrics.weather && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              {/* Weather Telemetry */}
              <div className="p-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl flex items-center justify-between">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Weather Telemetry</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{metrics.weather.temp}°C</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{metrics.weather.condition}</span>
                  </div>
                  <div className="flex gap-2.5 text-[9px] text-slate-400 font-semibold">
                    <span>Humid: {metrics.weather.humidity}%</span>
                    <span>Rain: {metrics.weather.rain_chance}%</span>
                    <span>Wind: {metrics.weather.wind_speed_kmh} km/h</span>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-sm">
                  ☀️
                </div>
              </div>

              {/* Transit Forecast */}
              <div className="p-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl flex items-center justify-between">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Transit Forecast</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{metrics.traffic.avg_speed_kmh} km/h</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Avg City Speed</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-semibold">
                    Status: <span className="font-bold text-slate-500 dark:text-slate-350">{metrics.traffic.status}</span> | Peak congestion forecast in 3 hours
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-sm">
                  🚗
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Recommendations */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-blue-500 animate-pulse" />
              <h2 className="font-bold text-sm text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {t('smart_recommendations')}
              </h2>
            </div>
            
            <div className="space-y-4 overflow-y-auto max-h-[310px] pr-1">
              {recommendations.map((rec) => (
                <div 
                  key={rec.id} 
                  className="p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      {rec.category}
                    </span>
                    <span className="text-[9px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.2 rounded-md">
                      {rec.confidence}% Confidence
                    </span>
                  </div>
                  <h4 className="font-bold text-xs leading-snug">{rec.title}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px] text-slate-400 font-semibold text-center italic">
            Recommendations compiled by Gemini Decision Agent
          </div>
        </div>
      </div>

      {/* 3. Alerts & Workflow Automation Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Recent Incidents */}
        <div className="glass-card p-6 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              <h2 className="font-bold text-sm text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Active City Alerts
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              Emergency Services
            </span>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className="p-3.5 border-l-4 border-l-red-500 bg-red-500/5 border border-slate-200 dark:border-slate-800 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-red-500">{alert.title}</span>
                  <span className="text-[9px] text-slate-400 flex items-center gap-1 font-semibold">
                    <Clock size={10} />
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Workflow Tasks */}
        <div className="glass-card p-6 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-teal-500" />
              <h2 className="font-bold text-sm text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Automated Workflows
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              Task Assignee
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => {
              const isCompleted = task.status === 'Completed';
              return (
                <div 
                  key={task.id}
                  className={`p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start justify-between gap-3 transition ${
                    isCompleted ? 'bg-slate-100/50 dark:bg-slate-900/20 opacity-60' : 'bg-slate-50 dark:bg-slate-900/50'
                  }`}
                >
                  <div className="space-y-1 text-left flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${task.priority === 'High' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                      <span className={`font-bold text-xs leading-snug ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">{task.description}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-200/50 dark:bg-slate-800/80 px-2 py-0.5 rounded">
                        Assignee: {task.assigned_to}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        isCompleted ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Resolve task CTA */}
                  {!isCompleted && (
                    <button
                      onClick={() => handleResolveTask(task.id)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-green-500 hover:bg-green-500/10 hover:border-green-500/20 transition self-center flex-shrink-0"
                      title={t('resolve')}
                    >
                      <CheckSquare size={16} />
                    </button>
                  )}
                  {isCompleted && (
                    <div className="p-1.5 text-green-500 rounded-lg self-center flex-shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
