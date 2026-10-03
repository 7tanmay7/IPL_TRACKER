import React, { useEffect, useState } from 'react';
import { fetchTeams, fetchTeamDetail } from '../services/api';
import { TeamSummary } from '../types';
import { Shield, Trophy, Activity, Swords } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TeamIntelligencePage: React.FC = () => {
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('Mumbai Indians');
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams().then((data) => {
      setTeams(data);
      if (data.length > 0 && !selectedTeam) {
        setSelectedTeam(data[0].team_name);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedTeam) return;
    setLoading(true);
    fetchTeamDetail(selectedTeam)
      .then(setDetail)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedTeam]);

  return (
    <div className="p-6 space-y-6">
      {/* Header & Team Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span>Team Intelligence</span>
          </h2>
          <p className="text-xs text-gray-400">Franchise performance, head-to-head records, and match phase run rates</p>
        </div>

        {/* Team Dropdown */}
        <div className="flex items-center space-x-2 bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-xs">
          <span className="text-gray-400 font-medium">Select Franchise:</span>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
          >
            {teams.map((t) => (
              <option key={t.team_name} value={t.team_name} className="bg-dark-800 text-white">
                {t.team_name} ({t.team_short})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : detail ? (
        <div className="space-y-6">
          {/* Team Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex items-center space-x-3">
              {detail.summary.logo_url && (
                <img src={detail.summary.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
              )}
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold">Win Rate</span>
                <p className="text-xl font-black text-emerald-400">{detail.summary.win_pct}%</p>
              </div>
            </div>

            <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Matches Played</span>
              <p className="text-xl font-black text-white">{detail.summary.matches}</p>
            </div>

            <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Total Wins</span>
              <p className="text-xl font-black text-emerald-400">{detail.summary.wins}</p>
            </div>

            <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Total Losses</span>
              <p className="text-xl font-black text-rose-400">{detail.summary.losses}</p>
            </div>

            <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Runs Scored</span>
              <p className="text-xl font-black text-white">{detail.summary.total_runs_scored.toLocaleString()}</p>
            </div>

            <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Wickets Taken</span>
              <p className="text-xl font-black text-purple-400">{detail.summary.wickets_taken}</p>
            </div>
          </div>

          {/* Phase Run Rates & Head to Head Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Phase Performance */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Phase Run Rates (RPO)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={detail.phase_performance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis dataKey="match_phase" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }} />
                    <Bar dataKey="run_rate" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Head to Head Table */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Swords className="w-4 h-4 text-amber-400" />
                Head-to-Head Opponent Summary
              </h3>
              <div className="overflow-y-auto max-h-64 border border-dark-700 rounded-lg">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-dark-900 text-gray-400 text-[10px] uppercase">
                    <tr>
                      <th className="px-3 py-2">Opponent</th>
                      <th className="px-3 py-2 text-center">Played</th>
                      <th className="px-3 py-2 text-center">Wins</th>
                      <th className="px-3 py-2 text-center">Losses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700/50">
                    {detail.head_to_head.map((h: any) => (
                      <tr key={h.opponent} className="hover:bg-dark-700/50">
                        <td className="px-3 py-2 font-bold text-white">{h.opponent}</td>
                        <td className="px-3 py-2 text-center font-mono">{h.matches}</td>
                        <td className="px-3 py-2 text-center font-mono text-emerald-400 font-bold">{h.wins}</td>
                        <td className="px-3 py-2 text-center font-mono text-rose-400">{h.losses}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
