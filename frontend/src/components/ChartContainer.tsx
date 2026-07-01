import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ChartContainerProps {
  type: 'traffic' | 'pollution' | 'energy' | 'disease' | 'pie-feedback';
  data: any[];
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ type, data }) => {
  
  // Custom tooltips styling
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

  // 1. Traffic Area Chart
  if (type === 'traffic') {
    // Select last 12 points for clean hourly presentation
    const chartData = data.slice(-12).map((item: any) => ({
      ...item,
      time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    return (
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
            <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} domain={[0, 100]} />
            <Tooltip {...customTooltipStyle} />
            <Area type="monotone" dataKey="congestion" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#trafficGrad)" name="Congestion %" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 2. AQI / Pollution Line Chart
  if (type === 'pollution') {
    const chartData = data.slice(-12).map((item: any) => ({
      ...item,
      time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    return (
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
            <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} domain={[0, 'auto']} />
            <Tooltip {...customTooltipStyle} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
            <Line type="monotone" dataKey="aqi" stroke="#10B981" strokeWidth={3} dot={false} name="Overall AQI" />
            <Line type="monotone" dataKey="pm2_5" stroke="#EC4899" strokeWidth={2} dot={false} name="PM2.5 Level" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 3. Grid Electricity & Water Chart
  if (type === 'energy') {
    const chartData = data.slice(-12).map((item: any) => ({
      ...item,
      time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    return (
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="elecGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
            <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} yAxisId="left" />
            <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} yAxisId="right" orientation="right" />
            <Tooltip {...customTooltipStyle} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
            <Area yAxisId="left" type="monotone" dataKey="electricity_mw" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#elecGrad)" name="Electricity (MW)" />
            <Area yAxisId="right" type="monotone" dataKey="water_kl" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#waterGrad)" name="Water (KL/hr)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 4. Disease Trend Line Chart
  if (type === 'disease') {
    const chartData = data.map((item: any) => ({
      ...item,
      label: item.week ? item.week.split('-')[1] : ''
    }));

    return (
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
            <XAxis dataKey="label" stroke="#94A3B8" fontSize={10} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
            <Tooltip {...customTooltipStyle} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
            <Line type="monotone" dataKey="Dengue" stroke="#EF4444" strokeWidth={2} activeDot={{ r: 6 }} name="Dengue" />
            <Line type="monotone" dataKey="Influenza" stroke="#3B82F6" strokeWidth={2} activeDot={{ r: 6 }} name="Influenza" />
            <Line type="monotone" dataKey="Gastroenteritis" stroke="#10B981" strokeWidth={2} activeDot={{ r: 6 }} name="Gastroenteritis" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 5. Pie Chart for Complaint Categories
  if (type === 'pie-feedback') {
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    // Group and count data categories
    const categories: Record<string, number> = {};
    data.forEach((item: any) => {
      const cat = item.category || 'Other';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    const chartData = Object.keys(categories).map(key => ({
      name: key,
      value: categories[key]
    }));

    return (
      <div className="w-full h-64 flex flex-col justify-center items-center">
        {chartData.length === 0 ? (
          <span className="text-slate-400 text-xs font-semibold">No complaints logged</span>
        ) : (
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...customTooltipStyle} />
              <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  }

  return null;
};
