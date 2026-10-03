import React from 'react';
import { Calendar, Layers } from 'lucide-react';

interface NavbarProps {
  selectedSeason: string;
  setSelectedSeason: (s: string) => void;
  seasonsList: string[];
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedSeason,
  setSelectedSeason,
  seasonsList
}) => {
  return (
    <header className="h-14 bg-dark-800 border-b border-dark-700 px-6 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-opacity-90">
      <div className="flex items-center space-x-4">
        <span className="text-xs font-semibold text-gray-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>IPL Franchise Analytics & Recruitment Portal</span>
        </span>
      </div>

      <div className="flex items-center space-x-3">
        {/* Season Selector Filter */}
        <div className="flex items-center space-x-2 bg-dark-900 border border-dark-700 rounded-md px-3 py-1.5 text-xs">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-gray-400 font-medium">Season:</span>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-transparent text-gray-100 font-bold focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-dark-800 text-gray-100">All Seasons (2008-2024)</option>
            {seasonsList.map((s) => (
              <option key={s} value={s} className="bg-dark-800 text-gray-100">
                IPL {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
