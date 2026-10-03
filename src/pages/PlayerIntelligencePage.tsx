import React, { useEffect, useState } from 'react';
import { fetchPlayers, fetchPlayerDetail } from '../services/api';
import { PlayerProfile } from '../types';
import { User, Activity, Flame, Shield, TrendingUp, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export const PlayerIntelligencePage: React.FC = () => {
  const [playersList, setPlayersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('V Kohli');
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers().then((data) => {
      setPlayersList(data);
    });
  }, []);

  useEffect(() => {
    if (!selectedPlayer) return;
    setLoading(true);
    fetchPlayerDetail(selectedPlayer)
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedPlayer]);

  const filteredPlayers = playersList.filter(p =>
    p.player_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 15);

  return (
    <div className="p-6 space-y-6">
      {/* Header & Player Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <span>Player Intelligence Profile</span>
          </h2>
          <p className="text-xs text-gray-400">Deep-dive player performance, consistency index, phase metrics, and opposition trends</p>
        </div>

        {/* Search / Select Player */}
        <div className="relative">
          <div className="flex items-center space-x-2 bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-xs w-64">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search player..."
              className="bg-transparent text-white focus:outline-none w-full font-medium"
            />
          </div>

          {searchQuery && (
            <div className="absolute right-0 mt-1 w-64 bg-dark-800 border border-dark-700 rounded-lg shadow-xl max-h-48 overflow-y-auto z-20">
              {filteredPlayers.map((p) => (
                <button
                  key={p.player_name}
                  onClick={() => {
                    setSelectedPlayer(p.player_name);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-dark-700 flex items-center justify-between"
                >
                  <span className="font-bold text-white">{p.player_name}</span>
                  <span className="text-[10px] text-gray-400">{p.bat_style}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : profile ? (
        <div className="space-y-6">
          {/* Player Header Banner */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-dark-900 border border-emerald-500/30 overflow-hidden flex items-center justify-center">
                {profile.player_image ? (
                  <img src={profile.player_image} alt={profile.player_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-emerald-400" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{profile.player_name}</h3>
                <p className="text-xs text-gray-400 font-medium">{profile.full_name}</p>
                <div className="mt-1 flex items-center space-x-2 text-[11px]">
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">{profile.bat_style}</span>
                  <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-semibold">{profile.bowl_style}</span>
                </div>
              </div>
            </div>

            {/* Core KPIs */}
            {profile.batting && (
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-dark-900/60 p-3 rounded-lg border border-dark-700">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Runs</span>
                  <p className="text-lg font-black text-emerald-400">{profile.batting.runs.toLocaleString()}</p>
                </div>
                <div className="bg-dark-900/60 p-3 rounded-lg border border-dark-700">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Average</span>
                  <p className="text-lg font-black text-white">{profile.batting.batting_average}</p>
                </div>
                <div className="bg-dark-900/60 p-3 rounded-lg border border-dark-700">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Strike Rate</span>
                  <p className="text-lg font-black text-amber-400">{profile.batting.strike_rate}</p>
                </div>
                <div className="bg-dark-900/60 p-3 rounded-lg border border-dark-700">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Consistency</span>
                  <p className="text-lg font-black text-cyan-400">{profile.batting.consistency_score}</p>
                </div>
              </div>
            )}
          </div>

          {/* Season-by-Season Trend Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Season-by-Season Run Output
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profile.season_trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis dataKey="season" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }} />
                    <Bar dataKey="runs" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Match Phase Strike Rate */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Phase Strike Rate (PP / Middle / Death)
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profile.phase_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis dataKey="match_phase" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }} />
                    <Bar dataKey="strike_rate" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
