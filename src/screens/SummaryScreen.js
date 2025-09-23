import React from 'react';

const SummaryScreen = () => {
  return (
    <div>
      {/* Header */}
      <div className="header">
        <h1 className="title">Summary</h1>
        <button className="profile-button">B</button>
      </div>

      {/* Content */}
      <div className="content">
        {/* Pinned Section */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Pinned</h2>
            <button className="edit-button">Edit</button>
          </div>
          
          <div className="card">
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 1.01L7 1c-1.1 0-1.99.9-1.99 2v18c0 1.1.89 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                  </svg>
                </div>
                <span className="card-title">Recent Scans</span>
              </div>
              <span className="chevron">›</span>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">12</span>
                <span className="unit">today</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <span className="card-title">Safe Foods</span>
              </div>
              <span className="chevron">›</span>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">8</span>
                <span className="unit">favorites</span>
              </div>
            </div>
          </div>
        </div>

        {/* Show All Health Data */}
        <div className="show-all-card">
          <div className="show-all-content">
            <div className="show-all-icon">G</div>
            <span className="show-all-text">Show All Gut Health Data</span>
            <span className="chevron">›</span>
          </div>
        </div>

        {/* Trends Section */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Trends</h2>
          </div>
          
          <div className="card">
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                  </svg>
                </div>
                <span className="card-title">Gut Health Score</span>
              </div>
              <span className="chevron">›</span>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">85</span>
                <span className="unit">this week</span>
              </div>
              <div className="chart">
                <div className="chart-bar" style={{height: '20px'}}></div>
                <div className="chart-bar" style={{height: '15px'}}></div>
                <div className="chart-bar" style={{height: '25px'}}></div>
                <div className="chart-bar" style={{height: '18px'}}></div>
                <div className="chart-bar" style={{height: '22px'}}></div>
                <div className="chart-bar" style={{height: '16px'}}></div>
                <div className="chart-bar" style={{height: '28px'}}></div>
              </div>
              <div className="description">
                Your gut health has improved over the last 4 weeks
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryScreen;
