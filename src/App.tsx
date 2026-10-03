import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { TeamIntelligencePage } from './pages/TeamIntelligencePage';
import { PlayerIntelligencePage } from './pages/PlayerIntelligencePage';
import { MatchupIntelligencePage } from './pages/MatchupIntelligencePage';
import { OppositionIntelligencePage } from './pages/OppositionIntelligencePage';
import { ScoutingIntelligencePage } from './pages/ScoutingIntelligencePage';
import { DataQualityPage } from './pages/DataQualityPage';
import { AskDataModal } from './components/AskDataModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [isAskModalOpen, setIsAskModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const seasonsList = [
    '2024', '2023', '2022', '2021', '2020', '2019', '2018',
    '2017', '2016', '2015', '2014', '2013', '2012', '2011',
    '2010', '2009', '2008'
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage selectedSeason={selectedSeason} />;
      case 'team':
        return <TeamIntelligencePage />;
      case 'player':
        return <PlayerIntelligencePage />;
      case 'matchup':
        return <MatchupIntelligencePage />;
      case 'opposition':
        return <OppositionIntelligencePage />;
      case 'scouting':
        return <ScoutingIntelligencePage />;
      case 'data-quality':
        return <DataQualityPage />;
      default:
        return <OverviewPage selectedSeason={selectedSeason} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-dark-900 text-gray-100 relative overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAskModal={() => setIsAskModalOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          selectedSeason={selectedSeason}
          setSelectedSeason={setSelectedSeason}
          seasonsList={seasonsList}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Ask the Data Natural Language Modal */}
      <AskDataModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
      />
    </div>
  );
};


export default App;
