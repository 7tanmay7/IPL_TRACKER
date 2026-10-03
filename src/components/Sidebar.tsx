import React from 'react';
import { 
  BarChart3, 
  Shield, 
  User, 
  Swords, 
  Target, 
  Search, 
  Database, 
  Sparkles,
  X 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAskModal: () => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  openAskModal,
  isMobileMenuOpen = false,
  setIsMobileMenuOpen
}) => {
  const navItems = [
    { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
    { id: 'team', label: 'Team Intelligence', icon: Shield },
    { id: 'player', label: 'Player Intelligence', icon: User },
    { id: 'matchup', label: 'Matchup Intelligence', icon: Swords },
    { id: 'opposition', label: 'Opposition Intelligence', icon: Target },
    { id: 'scouting', label: 'Scouting Matrix', icon: Search },
    { id: 'data-quality', label: 'Data Quality & Audit', icon: Database },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleAskClick = () => {
    openAskModal();
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] bg-dark-800 border-r border-dark-700 flex flex-col justify-between shrink-0 h-screen transition-transform duration-300 ease-in-out md:static md:w-64 md:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="overflow-y-auto">
          {/* Brand Header */}
          <div className="p-4 sm:p-5 border-b border-dark-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/assets/cricbuzz_logo.png" alt="CB Logo" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg shadow-md object-cover" />
              <div>
                <h1 className="font-extrabold text-white text-sm sm:text-base tracking-wide flex items-center gap-1.5">
                  IPL INTELLIGENCE
                </h1>
                <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  Performance • Scouting • Matchups
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
              className="md:hidden text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-dark-700 transition-colors"
              aria-label="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg font-medium text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer "Ask the Data" Banner */}
        <div className="p-4 border-t border-dark-700">
          <button
            onClick={handleAskClick}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center space-x-2 shadow-lg transition-all transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Ask the Data Assistant</span>
          </button>
          <div className="mt-3 flex items-center justify-between text-[10px] text-gray-400 px-1">
            <span>Data Engine: PySpark/DuckDB</span>
            <span className="text-emerald-400 font-medium">v2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

