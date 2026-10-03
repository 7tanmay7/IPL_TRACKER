import React from 'react';
import { Calendar, Layers, Menu } from 'lucide-react';

interface NavbarProps {
  selectedSeason: string;
  setSelectedSeason: (s: string) => void;
  seasonsList: string[];
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedSeason,
  setSelectedSeason,
  seasonsList,
  onToggleMobileMenu
}) => {
  return (
    <header className="h-14 bg-dark-800 border-b border-dark-700 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md bg-opacity-90">
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-xs font-semibold text-gray-300 flex items-center gap-2 truncate">
          <Layers className="w-4 h-4 text-emerald-400 shrink-0 hidden sm:inline" />
          <span className="hidden sm:inline">IPL Franchise Analytics & Recruitment Portal</span>
          <span className="sm:hidden font-bold text-white text-xs">IPL Intelligence</span>
        </span>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Season Selector Filter */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 bg-dark-900 border border-dark-700 rounded-md px-2 sm:px-3 py-1.5 text-xs">
          <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-gray-400 font-medium hidden xs:inline">Season:</span>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-transparent text-gray-100 font-bold focus:outline-none cursor-pointer text-xs"
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

