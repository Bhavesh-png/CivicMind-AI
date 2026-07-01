import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Activity, FileCheck, ArrowRight, Eye, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between overflow-x-hidden">
      {/* Top Header */}
      <nav className="h-16 px-6 sm:px-12 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between backdrop-blur-md sticky top-0 bg-white/60 dark:bg-slate-950/60 z-50">
        <div className="flex items-center gap-2">
          <div className="p-2 gradient-primary rounded-xl text-white">
            <Shield size={18} />
          </div>
          <span className="font-bold text-base tracking-tight bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            CivicMind AI
          </span>
        </div>
        <button
          onClick={onStart}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20"
        >
          <span>Enter Portal</span>
          <ChevronRight size={14} />
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 sm:px-12 py-12 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left column */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-left"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 w-fit">
            <Sparkles size={12} className="text-blue-500 animate-spin" style={{ animationDuration: '4s' }} />
            Google Cloud Hackathon Project
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Turning Community Data <br />
            into <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Smart Decisions</span>
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-lg leading-relaxed">
            CivicMind AI breaks municipal data silos. It aggregates traffic flows, air quality grids, public health trends, and citizen feedback into a single, Gemini-powered decision intelligence ecosystem.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:opacity-95 text-white rounded-2xl text-sm font-bold transition shadow-lg shadow-blue-500/20"
            >
              <span>Get Started</span>
              <ArrowRight size={16} />
            </button>
            <a
              href="#features"
              className="px-6 py-3.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl text-sm font-semibold transition"
            >
              Explore Features
            </a>
          </div>
        </motion.div>

        {/* Right column: Decorative Architectural Diagram Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          {/* Glassmorphic Dashboard mockup */}
          <div className="glass-card p-6 border border-slate-200 dark:border-slate-800/80 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                CITY CENTER TELEMETRY
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400">TRAFFIC LEVEL</span>
                <p className="text-xl font-bold text-blue-600">36% (Moderate)</p>
                <div className="h-1.5 w-full bg-blue-100 dark:bg-blue-950 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '36%' }} />
                </div>
              </div>
              <div className="p-4 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400">POLLUTION INDEX</span>
                <p className="text-xl font-bold text-green-500">42 AQI (Good)</p>
                <div className="h-1.5 w-full bg-green-100 dark:bg-green-950 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '42%' }} />
                </div>
              </div>
            </div>

            {/* Sparkline graphics */}
            <div className="mt-4 p-4 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400">PREDICTIVE ANALYTICS</span>
                <span className="text-[9px] text-green-500 font-bold bg-green-500/10 px-1.5 rounded">
                  Vertex AI Forecast
                </span>
              </div>
              {/* Fake SVG line chart */}
              <svg className="w-full h-16 opacity-75" viewBox="0 0 100 30">
                <path 
                  d="M0,25 Q15,10 30,22 T60,5 T90,28 T100,10" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
            
            {/* Recommendation pill */}
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-600/15 to-purple-600/15 border border-blue-500/30 rounded-xl flex items-center gap-2">
              <Sparkles size={14} className="text-blue-500" />
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 truncate">
                AI Suggestion: Redirect Route-A traffic to relieve congestion.
              </span>
            </div>
          </div>

          {/* Background circles */}
          <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl -z-10" />
          <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl -z-10" />
        </motion.div>
      </main>

      {/* Feature Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 sm:px-12 py-16 border-t border-slate-200/50 dark:border-slate-800/50 w-full text-center">
        <h3 className="text-2xl font-bold mb-10 text-slate-800 dark:text-slate-100">
          Core Engine Capabilities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Eye size={20} />
            </div>
            <h4 className="font-bold text-sm">Real-time Telemetry</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Consolidate AQI, utility loads, and traffic feeds directly into synchronized visual map layers.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-2xl">
              <Sparkles size={20} />
            </div>
            <h4 className="font-bold text-sm">Gemini AI Engine</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Talk directly with municipal databases, query telemetry, and analyze citizen sentiments.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-2xl">
              <Activity size={20} />
            </div>
            <h4 className="font-bold text-sm">Predictive Analytics</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Leverage forecasting parameters to anticipate traffic jams, pollution spikes, and disease surges.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-2xl">
              <FileCheck size={20} />
            </div>
            <h4 className="font-bold text-sm">Automated Reports</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Compile policy briefings and city metrics into styled PDF summaries instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-12 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium">
        <span>© 2026 CivicMind AI. All rights reserved.</span>
        <span className="mt-2 sm:mt-0 flex items-center gap-1">
          Built with <span className="text-red-500">♥</span> for Gen AI Academy Hackathon
        </span>
      </footer>
    </div>
  );
};
