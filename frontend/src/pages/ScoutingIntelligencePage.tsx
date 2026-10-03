import React, { useEffect, useState } from 'react';
import { fetchScouting } from '../services/api';
import { ScoutingCandidate } from '../types';
import { Search, Sliders, Info, Check } from 'lucide-react';

export const ScoutingIntelligencePage: React.FC = () => {
  const [candidates, setCandidates] = useState<ScoutingCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [minBalls, setMinBalls] = useState(50);
  
  // Configurable Scouting Analytical Weights (Must sum to 1.0)
  const [wRun, setWRun] = useState(0.30);
  const [wSr, setWSr] = useState(0.25);
  const [wCons, setWCons] = useState(0.20);
  const [wDeath, setWDeath] = useState(0.15);
  const [wPP, setWPP] = useState(0.10);

  const loadScoutingData = () => {
    setLoading(true);
    fetchScouting(
      {
        run_prod: wRun,
        strike_rate: wSr,
        consistency: wCons,
        death_impact: wDeath,
        powerplay_impact: wPP
      },
      minBalls
    )
      .then((res) => setCandidates(res.candidates))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadScoutingData();
  }, [minBalls]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Scouting Intelligence & Recruitment Engine</span>
        </h2>
        <p className="text-xs text-gray-400">Multi-factor analytical recruitment scoring model with transparent configurable weights</p>
      </div>

      {/* Weight Controls Bar */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
            Configurable Scoring Model Weights
          </h3>
          <button
            onClick={loadScoutingData}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded text-xs transition-all w-full sm:w-auto"
          >
            Recalculate Rankings
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">Run Production:</span>
              <span className="text-emerald-400 font-bold">{Math.round(wRun * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.6"
              step="0.05"
              value={wRun}
              onChange={(e) => setWRun(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">Strike Rate:</span>
              <span className="text-amber-400 font-bold">{Math.round(wSr * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.6"
              step="0.05"
              value={wSr}
              onChange={(e) => setWSr(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">Consistency:</span>
              <span className="text-cyan-400 font-bold">{Math.round(wCons * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.6"
              step="0.05"
              value={wCons}
              onChange={(e) => setWCons(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">Death Impact:</span>
              <span className="text-rose-400 font-bold">{Math.round(wDeath * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.6"
              step="0.05"
              value={wDeath}
              onChange={(e) => setWDeath(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">Powerplay Impact:</span>
              <span className="text-purple-400 font-bold">{Math.round(wPP * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.6"
              step="0.05"
              value={wPP}
              onChange={(e) => setWPP(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Candidate Table */}
      {loading ? (
        <div className="p-8 flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-3.5 sm:p-4 bg-dark-900/60 border-b border-dark-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Scouting Candidates Matrix ({candidates.length} Players Ranked)</h3>
            <span className="text-[10px] sm:text-[11px] text-gray-400">Min Sample: {minBalls} balls faced</span>
          </div>

          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-left text-xs text-gray-300 min-w-[650px]">
              <thead className="bg-dark-900 text-gray-400 text-[10px] uppercase">
                <tr>
                  <th className="px-3 sm:px-4 py-3 whitespace-nowrap">Rank</th>
                  <th className="px-3 sm:px-4 py-3 whitespace-nowrap">Player</th>
                  <th className="px-3 sm:px-4 py-3 whitespace-nowrap">Bat Style</th>
                  <th className="px-3 sm:px-4 py-3 text-right whitespace-nowrap">Runs</th>
                  <th className="px-3 sm:px-4 py-3 text-right whitespace-nowrap">SR</th>
                  <th className="px-3 sm:px-4 py-3 text-right whitespace-nowrap">Avg</th>
                  <th className="px-3 sm:px-4 py-3 text-right whitespace-nowrap">Death SR</th>
                  <th className="px-3 sm:px-4 py-3 text-right whitespace-nowrap">Consistency</th>
                  <th className="px-3 sm:px-4 py-3 text-right text-emerald-400 whitespace-nowrap">Scouting Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/50">
                {candidates.slice(0, 25).map((c, idx) => (
                  <tr key={c.player_name} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-3 sm:px-4 py-3 font-mono font-bold text-gray-500 whitespace-nowrap">#{idx + 1}</td>
                    <td className="px-3 sm:px-4 py-3 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {c.player_image ? (
                          <img src={c.player_image} alt={c.player_name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-dark-700 flex items-center justify-center text-[10px] shrink-0">🏏</div>
                        )}
                        <span className="truncate">{c.player_name}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-gray-400 text-[11px] whitespace-nowrap">{c.bat_style}</td>
                    <td className="px-3 sm:px-4 py-3 text-right font-mono font-bold whitespace-nowrap">{c.runs.toLocaleString()}</td>
                    <td className="px-3 sm:px-4 py-3 text-right font-mono text-amber-400 whitespace-nowrap">{c.strike_rate}</td>
                    <td className="px-3 sm:px-4 py-3 text-right font-mono text-gray-300 whitespace-nowrap">{c.batting_average}</td>
                    <td className="px-3 sm:px-4 py-3 text-right font-mono text-rose-400 whitespace-nowrap">{c.death_sr}</td>
                    <td className="px-3 sm:px-4 py-3 text-right font-mono text-cyan-400 whitespace-nowrap">{c.consistency_score}</td>
                    <td className="px-3 sm:px-4 py-3 text-right font-mono font-black text-emerald-400 text-sm whitespace-nowrap">
                      {c.scouting_score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

