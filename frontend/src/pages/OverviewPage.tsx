import React, { useEffect, useState } from 'react';
import { fetchOverview } from '../services/api';
import { OverviewData } from '../types';
import { KPICard } from '../components/KPICard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { Trophy, Activity, Users, Flame, Info } from 'lucide-react';

interface OverviewPageProps {
  selectedSeason: string;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ selectedSeason }) => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchOverview(selectedSeason)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedSeason]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-gray-400">Failed to load overview data.</div>;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header Title */}
      <div>
        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Executive Performance Overview</h2>
        <p className="text-xs text-gray-400">Historical IPL match metrics, scoring rates, and top franchise performers</p>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <KPICard title="Total Matches" value={data.kpis.total_matches} icon={Trophy} subtitle="Ingested IPL matches" />
        <KPICard title="Total Runs" value={data.kpis.total_runs} icon={Activity} badge="All-Time" image="/assets/orange_cap.png" />
        <KPICard title="Total Wickets" value={data.kpis.total_wickets} icon={Flame} badge="Bowled/Caught" />
        <KPICard title="Unique Batters" value={data.kpis.total_batters} icon={Users} />
        <KPICard title="Unique Bowlers" value={data.kpis.total_bowlers} icon={Users} />
        <KPICard title="Seasons Tracked" value={data.kpis.total_seasons} badge="2008-2024" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Season Scoring Trend */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Average Runs Per Match (By Season)</h3>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 self-start sm:self-auto">Trend Line</span>
          </div>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.season_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="season" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }} />
                <Line type="monotone" dataKey="avg_match_runs" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Phase Run Rate Breakdown */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
            <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Scoring Run Rate by Match Phase (RPO)</h3>
            <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 self-start sm:self-auto">PP / Middle / Death</span>
          </div>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.phase_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="match_phase" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }} />
                <Bar dataKey="run_rate" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Batters */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <img src="/assets/orange_cap.png" alt="Cap" className="w-5 h-5" />
              Top Run Scorers
            </h3>
          </div>
          <div className="divide-y divide-dark-700">
            {data.top_performers.batters.map((b, idx) => (
              <div key={b.player_name} className="py-2.5 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="w-4 text-gray-500 font-bold font-mono text-[11px] shrink-0">#{idx + 1}</span>
                  <span className="font-bold text-white truncate">{b.player_name}</span>
                </div>
                <div className="flex items-center space-x-2.5 sm:space-x-4 shrink-0 text-right">
                  <span className="text-emerald-400 font-extrabold">{b.runs.toLocaleString()} runs</span>
                  <span className="text-gray-400 text-[10px] sm:text-[11px]">SR {b.strike_rate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Bowlers */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-purple-400" />
              Top Wicket Takers
            </h3>
          </div>
          <div className="divide-y divide-dark-700">
            {data.top_performers.bowlers.map((bw, idx) => (
              <div key={bw.player_name} className="py-2.5 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="w-4 text-gray-500 font-bold font-mono text-[11px] shrink-0">#{idx + 1}</span>
                  <span className="font-bold text-white truncate">{bw.player_name}</span>
                </div>
                <div className="flex items-center space-x-2.5 sm:space-x-4 shrink-0 text-right">
                  <span className="text-purple-400 font-extrabold">{bw.wickets} wkts</span>
                  <span className="text-gray-400 text-[10px] sm:text-[11px]">Econ {bw.economy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytical Notes */}
      <div className="bg-dark-800/60 border border-dark-700 rounded-xl p-3.5 sm:p-4 flex items-start space-x-3 text-xs text-gray-400">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-gray-200">Analytical Methodology Note:</strong> All metrics are aggregated directly from legal ball-by-ball delivery facts across 1,243 official IPL matches (2008–2024). Wides and no-balls are filtered out of legal delivery counts for strike rate calculations.
        </p>
      </div>
    </div>
  );
};

