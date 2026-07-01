import React, { useState } from 'react';
import { FileText, Download, Eye, Sparkles, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../utils/api';

type ReportType = 'Weekly' | 'Monthly' | 'Emergency';

export const Reports: React.FC = () => {
  const { t } = useLanguage();
  const [reportType, setReportType] = useState<ReportType>('Weekly');
  const [timeFrame, setTimeFrame] = useState('Last 7 Days');
  
  const [previewContent, setPreviewContent] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState('');

  const handlePreview = async () => {
    setLoadingPreview(true);
    setError('');
    setPreviewContent('');
    try {
      const res = await api.previewReport(reportType, timeFrame);
      setPreviewContent(res.policy_markdown);
    } catch (e) {
      console.error("Failed to generate report preview", e);
      setError("AI Service connection failed. Could not fetch report summary.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownload = () => {
    // Open the download URL in a new tab to trigger standard PDF save dialog
    const url = api.downloadReportUrl(reportType, timeFrame);
    window.open(url, '_blank');
  };

  const handleDownloadCSV = async () => {
    setError('');
    try {
      const metrics = await api.getMetrics();
      
      const csvRows = [
        ['Metric Category', 'Parameter Name', 'Current Value', 'Telemetry Status'],
        ['Transportation', 'Congestion percentage', `${metrics.traffic.congestion_pct}%`, metrics.traffic.status],
        ['Transportation', 'Average Speed km/h', `${metrics.traffic.avg_speed_kmh} km/h`, 'Stable'],
        ['Environment', 'Air Quality Index', `${metrics.aqi.value} AQI`, metrics.aqi.status],
        ['Environment', 'PM2.5 concentration', `${metrics.aqi.pm2_5_val} ug/m3`, 'Good'],
        ['Public Health', 'ICU Bed Occupancy', `${metrics.healthcare.bed_occupancy_pct}%`, metrics.healthcare.status],
        ['Public Health', 'Active Alerts count', `${metrics.healthcare.active_alerts}`, 'Attention Required'],
        ['Resource Demand', 'Electrical Load MW', `${metrics.utilities.electricity_mw} MW`, metrics.utilities.power_status],
        ['Resource Demand', 'Water distribution KL/hr', `${metrics.utilities.water_kl_hr} KL/hr`, metrics.utilities.water_status],
        ['Citizen Feedback', 'Total complaints logs', `${metrics.complaints.total}`, 'Open Registry'],
        ['Citizen Feedback', 'Pending incidents', `${metrics.complaints.pending}`, 'Pending'],
        ['Citizen Feedback', 'In Progress incidents', `${metrics.complaints.in_progress}`, 'In Progress']
      ];
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + csvRows.map(e => e.map(val => `"${val}"`).join(",")).join("\n");
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `CivicMind_${reportType.toLowerCase()}_telemetry_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Failed to generate CSV data briefing", e);
      setError("Failed to compile CSV data briefing.");
    }
  };

  // Simple markdown renderer for preview content
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let clean = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      clean = clean.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-4 mb-2">{clean.substring(2)}</h2>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-bold text-slate-800 dark:text-slate-100 mt-3 mb-2">{clean.substring(3)}</h3>;
      }
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-2 mb-1.5">{clean.substring(4)}</h4>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={idx} className="ml-4 list-disc text-xs leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: clean.substring(2) }} />;
      }
      if (line.trim().length === 0) return <div key={idx} className="h-2" />;
      
      return <p key={idx} className="text-xs leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: clean }} />;
    });
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      
      {/* Header */}
      <div>
        <h2 className="font-extrabold text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FileText className="text-blue-500" />
          AI Report Workshop
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Automate decision summaries, city metrics tables, and municipal policy suggested items
        </p>
      </div>

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Setup controls */}
        <div className="glass-card p-6 border border-slate-200 dark:border-slate-800/80 shadow-md space-y-5 h-fit">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-blue-500" />
            <h3 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Report Parameters
            </h3>
          </div>

          {/* Report Type Select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Report template</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['Weekly', 'Monthly', 'Emergency'] as ReportType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setReportType(type);
                    if (type === 'Weekly') setTimeFrame('Last 7 Days');
                    if (type === 'Monthly') setTimeFrame('Last Month');
                    if (type === 'Emergency') setTimeFrame('Disaster Alert Response');
                  }}
                  className={`py-2 rounded-lg text-[10px] font-bold transition ${
                    reportType === type 
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Timeframe */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Timeframe focus</label>
            <input
              type="text"
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-all font-semibold"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Preview CTA */}
            <button
              onClick={handlePreview}
              disabled={loadingPreview}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition disabled:opacity-50 text-slate-700 dark:text-slate-200"
            >
              <Eye size={14} />
              <span>{loadingPreview ? 'Fetching Preview...' : t('preview')}</span>
            </button>

            {/* Download PDF CTA */}
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20"
            >
              <Download size={14} />
              <span>{t('download')}</span>
            </button>

            {/* Download CSV CTA */}
            <button
              onClick={handleDownloadCSV}
              className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-xs font-bold transition text-slate-700 dark:text-slate-200"
            >
              <FileSpreadsheet size={14} className="text-emerald-500" />
              <span>Download Summary (CSV)</span>
            </button>
          </div>
        </div>

        {/* Right column: Interactive Preview Area */}
        <div className="lg:col-span-2 glass-card p-6 border border-slate-200 dark:border-slate-800/80 shadow-md flex flex-col justify-between min-h-[400px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Briefing Document Preview
              </span>
              <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full font-bold">
                A4 Styled PDF Format
              </span>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="overflow-y-auto max-h-[360px] pr-1.5 text-slate-600 dark:text-slate-300">
              {loadingPreview ? (
                <div className="py-16 text-center text-xs font-semibold text-slate-400">
                  <span className="animate-pulse">Loading dynamic briefing from Gemini API...</span>
                </div>
              ) : previewContent ? (
                <div className="space-y-2 border border-slate-100 dark:border-slate-800/50 p-5 rounded-2xl bg-white/30 dark:bg-slate-900/30">
                  {renderMarkdown(previewContent)}
                </div>
              ) : (
                <div className="py-16 text-center text-xs font-semibold text-slate-400 space-y-2">
                  <FileText className="mx-auto text-slate-300 dark:text-slate-700" size={36} />
                  <p>Click "Preview Suggestion" to load dynamic AI briefing text.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[9px] text-slate-400 font-semibold italic text-center">
            PDF exports auto-embed real-time municipal tables, alerts, and signature signoffs.
          </div>
        </div>

      </div>
    </div>
  );
};
