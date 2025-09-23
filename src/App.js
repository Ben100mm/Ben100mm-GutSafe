import React, { useState } from 'react';
import './App.css';
import SummaryScreen from './screens/SummaryScreen';
import ScanScreen from './screens/ScanScreen';
import BrowseScreen from './screens/BrowseScreen';

function App() {
  const [activeTab, setActiveTab] = useState('summary');

  const renderScreen = () => {
    switch (activeTab) {
      case 'summary':
        return <SummaryScreen />;
      case 'scan':
        return <ScanScreen />;
      case 'browse':
        return <BrowseScreen />;
      default:
        return <SummaryScreen />;
    }
  };

  return (
    <div className="app">
      <div className="app-content">
        {renderScreen()}
      </div>
      
      <div className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <div className="nav-icon">
            <div className="heart-icon"></div>
          </div>
          <span className="nav-label">Summary</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'scan' ? 'active' : ''}`}
          onClick={() => setActiveTab('scan')}
        >
          <div className="nav-icon">
            <div className="camera-icon"></div>
          </div>
          <span className="nav-label">Scan</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          <div className="nav-icon">
            <div className="grid-icon">
              <div className="grid-dot"></div>
              <div className="grid-dot"></div>
              <div className="grid-dot"></div>
              <div className="grid-dot"></div>
            </div>
          </div>
          <span className="nav-label">Browse</span>
        </button>
      </div>
    </div>
  );
}

export default App;
