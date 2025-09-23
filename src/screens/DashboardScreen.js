import React from 'react';

const DashboardScreen = () => {
  const handleEditPress = () => {
    console.log('Edit pressed');
  };

  const handleCardPress = (cardType) => {
    console.log(`${cardType} card pressed`);
  };

  return (
    <div>
      {/* Header */}
      <div className="header">
        <h1 className="title">Summary</h1>
        <button className="profile-button" onClick={handleEditPress}>B</button>
      </div>

      {/* Content */}
      <div className="content">
        {/* Pinned Section */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Pinned</h2>
            <button className="edit-button" onClick={handleEditPress}>Edit</button>
          </div>
          
          <div className="card" onClick={() => handleCardPress('Recent Scans')}>
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

          <div className="card" onClick={() => handleCardPress('Safe Foods')}>
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

          <div className="card" onClick={() => handleCardPress('Gut Health Score')}>
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

        {/* Show All Health Data */}
        <div className="show-all-card" onClick={() => handleCardPress('Show All Health Data')}>
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
          
          <div className="card" onClick={() => handleCardPress('Weekly Progress')}>
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                  </svg>
                </div>
                <span className="card-title">Weekly Progress</span>
              </div>
              <span className="chevron">›</span>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">+12%</span>
                <span className="unit">improvement</span>
              </div>
              <div className="description">
                Your gut health trends are looking positive this week
              </div>
            </div>
          </div>

          <div className="card" onClick={() => handleCardPress('Food Sensitivity')}>
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                  </svg>
                </div>
                <span className="card-title">Food Sensitivity</span>
              </div>
              <span className="chevron">›</span>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">3</span>
                <span className="unit">new triggers found</span>
              </div>
              <div className="description">
                Track your food reactions to identify patterns
              </div>
            </div>
          </div>
        </div>

        {/* Highlights Section */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Highlights</h2>
          </div>
          
          <div className="card" onClick={() => handleCardPress('Weekly Insights')}>
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                  </svg>
                </div>
                <span className="card-title">Weekly Insights</span>
              </div>
              <span className="chevron">›</span>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">3</span>
                <span className="unit">new safe foods discovered</span>
              </div>
              <div className="description">
                You've found 3 new foods that work well with your gut
              </div>
            </div>
          </div>

          <div className="card" onClick={() => handleCardPress('Streak')}>
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <span className="card-title">Streak</span>
              </div>
              <span className="chevron">›</span>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">7</span>
                <span className="unit">days in a row</span>
              </div>
              <div className="description">
                Keep up the great work with your gut health routine
              </div>
            </div>
          </div>
        </div>

        {/* Get More from GutSafe Section */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Get More from GutSafe</h2>
          </div>
          
          <div className="card" onClick={() => handleCardPress('Premium Features')}>
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                  </svg>
                </div>
                <span className="card-title">Premium Features</span>
              </div>
              <span className="chevron">›</span>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">Unlock</span>
                <span className="unit">advanced analytics</span>
              </div>
              <div className="description">
                Get personalized meal plans and detailed insights
              </div>
            </div>
          </div>

          <div className="card" onClick={() => handleCardPress('Expert Consultation')}>
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <span className="card-title">Expert Consultation</span>
              </div>
              <span className="chevron">›</span>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">Book</span>
                <span className="unit">with nutritionist</span>
              </div>
              <div className="description">
                Get personalized advice from certified gut health experts
              </div>
            </div>
          </div>
        </div>

        {/* Articles Section */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Articles</h2>
          </div>
          
          <div className="card" onClick={() => handleCardPress('Gut Health Tips')}>
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <span className="card-title">Gut Health Tips</span>
              </div>
              <span className="chevron">›</span>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">5</span>
                <span className="unit">new articles this week</span>
              </div>
              <div className="description">
                Latest research and tips for better gut health
              </div>
            </div>
          </div>

          <div className="card" onClick={() => handleCardPress('Recipe Collection')}>
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <span className="card-title">Recipe Collection</span>
              </div>
              <span className="chevron">›</span>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">12</span>
                <span className="unit">gut-friendly recipes</span>
              </div>
              <div className="description">
                Delicious meals designed for optimal gut health
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
