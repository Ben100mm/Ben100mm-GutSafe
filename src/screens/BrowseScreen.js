import React from 'react';

const BrowseScreen = () => {
  return (
    <div>
      {/* Header */}
      <div className="header">
        <h1 className="title">Browse</h1>
        <button className="profile-button">B</button>
      </div>

      {/* Content */}
      <div className="content">
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Food Categories</h2>
          </div>
          
          <div className="card">
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                  </svg>
                </div>
                <span className="card-title">Safe Foods</span>
              </div>
              <span className="chevron">›</span>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">24</span>
                <span className="unit">items</span>
              </div>
              <div className="description">
                Foods that are safe for your gut profile
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
                  </svg>
                </div>
                <span className="card-title">Caution Foods</span>
              </div>
              <span className="chevron">›</span>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">12</span>
                <span className="unit">items</span>
              </div>
              <div className="description">
                Foods to consume in moderation
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                  </svg>
                </div>
                <span className="card-title">Avoid Foods</span>
              </div>
              <span className="chevron">›</span>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">8</span>
                <span className="unit">items</span>
              </div>
              <div className="description">
                Foods to avoid based on your sensitivities
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Recent Activity</h2>
          </div>
          
          <div className="card">
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z"/>
                  </svg>
                </div>
                <span className="card-title">Scan History</span>
              </div>
              <span className="chevron">›</span>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">47</span>
                <span className="unit">total scans</span>
              </div>
              <div className="description">
                View your complete scan history
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
                  </svg>
                </div>
                <span className="card-title">Favorites</span>
              </div>
              <span className="chevron">›</span>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">15</span>
                <span className="unit">saved items</span>
              </div>
              <div className="description">
                Your saved safe foods and recipes
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseScreen;
