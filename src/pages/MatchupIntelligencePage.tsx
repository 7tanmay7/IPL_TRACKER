import React, { useEffect, useState } from 'react';
import { fetchMatchup, fetchPlayers } from '../services/api';
import { MatchupData } from '../types';
import { Swords, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const MatchupIntelligencePage: React.FC = () => {
  const [batter, setBatter] = useState('V Kohli');
  const [bowler, setBowler] = useState('JJ Bumrah');
  const [players, setPlayers] = useState<any[]>([]);
  const [matchup, setMatchup] = useState<MatchupData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlayers().then(setPlayers).catch(console.error);
  }, []);

  useEffect(() => {
    if (!batter || !bowler) return;
    setLoading(true);
    fetchMatchup(batter, bowler)
      .then(setMatchup)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [batter, bowler]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
          <Swords className="w-5 h-5 text-amber-400 shrink-0" />
          <span>Batter vs Bowler Matchup Intelligence</span>
        </h2>
        <p className="text-xs text-gray-400">Head-to-head delivery analytics, strike rate, dot ball %, and sample size validation</p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-dark-800 border border-dark-700 p-3.5 sm:p-4 rounded-xl">
        <div className="space-y-1">
          <label className="text-xs font-bold text-emerald-400 uppercase">Batter</label>
          <select
            value={batter}
            onChange={(e) => setBatter(e.target.value)}
            className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2.5 text-xs text-white font-bold focus:outline-none truncate"
          >
            {players.map((p) => (
              <option key={`bat-${p.player_name}`} value={p.player_name} className="bg-dark-800 text-white">
                {p.player_name} ({p.total_runs} runs)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-purple-400 uppercase">Bowler</label>
          <select
            value={bowler}
            onChange={(e) => setBowler(e.target.value)}
            className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2.5 text-xs text-white font-bold focus:outline-none truncate"
          >
            {players.map((p) => (
              <option key={`bowl-${p.player_name}`} value={p.player_name} className="bg-dark-800 text-white">
                {p.player_name} ({p.total_wickets} wkts)
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : matchup ? (
        !matchup.has_data ? (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 sm:p-8 text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="font-bold text-white text-sm">Insufficient Sample Size / No Head-to-Head Records</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">{matchup.message}</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Sample Size Indicator */}
            {matchup.sample_warning ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 sm:p-3.5 flex items-center space-x-3 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  <strong>Low Sample Warning:</strong> Matchup is based on only <strong>{matchup.balls} balls faced</strong>. Interpret trends cautiously.
                </span>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 sm:p-3.5 flex items-center space-x-3 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  <strong>Sufficient Sample Size:</strong> Based on <strong>{matchup.balls} legal deliveries faced</strong> across {matchup.matches} matches.
                </span>
              </div>
            )}

            {/* Matchup KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-dark-800 border border-dark-700 p-3.5 sm:p-4 rounded-xl text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase block truncate">Balls Faced</span>
                <p className="text-lg sm:text-xl font-black text-white">{matchup.balls}</p>
              </div>
              <div className="bg-dark-800 border border-dark-700 p-3.5 sm:p-4 rounded-xl text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase block truncate">Runs Scored</span>
                <p className="text-lg sm:text-xl font-black text-emerald-400">{matchup.runs}</p>
              </div>
              <div className="bg-dark-800 border border-dark-700 p-3.5 sm:p-4 rounded-xl text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase block truncate">Strike Rate</span>
                <p className="text-lg sm:text-xl font-black text-amber-400">{matchup.strike_rate}</p>
              </div>
              <div className="bg-dark-800 border border-dark-700 p-3.5 sm:p-4 rounded-xl text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase block truncate">Dismissals</span>
                <p className="text-lg sm:text-xl font-black text-rose-400">{matchup.dismissals}</p>
              </div>
              <div className="bg-dark-800 border border-dark-700 p-3.5 sm:p-4 rounded-xl text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase block truncate">Dot Ball %</span>
                <p className="text-lg sm:text-xl font-black text-cyan-400">{matchup.dot_pct}%</p>
              </div>
              <div className="bg-dark-800 border border-dark-700 p-3.5 sm:p-4 rounded-xl text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase block truncate">Boundary %</span>
                <p className="text-lg sm:text-xl font-black text-purple-400">{matchup.boundary_pct}%</p>
              </div>
            </div>
          </div>
        )
      ) : null}
    </div>
  );
};

