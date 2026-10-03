import React, { useEffect, useState } from 'react';
import { fetchTeams, fetchOpposition } from '../services/api';
import { Target, Shield, CheckCircle2 } from 'lucide-react';

export const OppositionIntelligencePage: React.FC = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedOpponent, setSelectedOpponent] = useState<string>('Chennai Super Kings');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams().then((res) => {
      setTeams(res);
    });
  }, []);

  useEffect(() => {
    if (!selectedOpponent) return;
    setLoading(true);
    fetchOpposition(selectedOpponent)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedOpponent]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-rose-400 shrink-0" />
            <span>Opposition Intelligence & Pre-Match Scouting</span>
          </h2>
          <p className="text-xs text-gray-400">Pre-match briefing: opponent weaknesses, top head-to-head performers, and phase tendencies</p>
        </div>

        {/* Dropdown */}
        <div className="flex items-center space-x-2 bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-xs w-full sm:w-auto justify-between sm:justify-start">
          <span className="text-gray-400 font-medium shrink-0">Target Opponent:</span>
          <select
            value={selectedOpponent}
            onChange={(e) => setSelectedOpponent(e.target.value)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer truncate"
          >
            {teams.map((t) => (
              <option key={t.team_name} value={t.team_name} className="bg-dark-800 text-white">
                {t.team_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : data ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Tactical Observations Box */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Empirical Tactical Observations (Observed Data vs Interpretation)
            </h3>
            <div className="space-y-2">
              {data.tactical_observations.map((obs: string, idx: number) => (
                <div key={idx} className="bg-dark-900/60 p-3 rounded-lg border border-dark-700 text-xs text-gray-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                  <span>{obs}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Threat Batters & Bowlers against Opponent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 sm:p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Scorers Against {data.opponent}</h4>
              <div className="divide-y divide-dark-700">
                {data.top_opposing_batters.map((b: any, idx: number) => (
                  <div key={b.player_name} className="py-2.5 flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-gray-500 font-mono font-bold text-[11px] shrink-0">#{idx+1}</span>
                      <span className="font-bold text-white truncate">{b.player_name}</span>
                    </div>
                    <div className="space-x-2 sm:space-x-3 shrink-0 text-right">
                      <span className="text-emerald-400 font-bold">{b.runs} runs</span>
                      <span className="text-gray-400 text-[10px] sm:text-[11px]">SR {b.strike_rate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 sm:p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Wicket Takers Against {data.opponent}</h4>
              <div className="divide-y divide-dark-700">
                {data.top_opposing_bowlers.map((bw: any, idx: number) => (
                  <div key={bw.player_name} className="py-2.5 flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-gray-500 font-mono font-bold text-[11px] shrink-0">#{idx+1}</span>
                      <span className="font-bold text-white truncate">{bw.player_name}</span>
                    </div>
                    <div className="space-x-2 sm:space-x-3 shrink-0 text-right">
                      <span className="text-purple-400 font-bold">{bw.wickets} wkts</span>
                      <span className="text-gray-400 text-[10px] sm:text-[11px]">Econ {bw.economy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

