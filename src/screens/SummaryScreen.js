import React, { useState } from 'react';

const SummaryScreen = () => {
  const [showSafeFoods, setShowSafeFoods] = useState(false);

  const safeFoods = [
    {
      id: '1',
      name: 'Greek Yogurt',
      brand: 'Chobani',
      dataSource: 'USDA Food Database',
      usageCount: 12,
      fodmapLevel: 'low',
      notes: 'Great for breakfast, low histamine'
    },
    {
      id: '2',
      name: 'Banana',
      brand: null,
      dataSource: 'FODMAP Database',
      usageCount: 8,
      fodmapLevel: 'low',
      notes: 'Best when slightly green'
    },
    {
      id: '3',
      name: 'Quinoa',
      brand: 'Bob\'s Red Mill',
      dataSource: 'Monash FODMAP Database',
      usageCount: 15,
      fodmapLevel: 'low',
      notes: 'Perfect protein source'
    }
  ];

  const handleSafeFoodsClick = () => {
    setShowSafeFoods(true);
  };

  const handleShare = async (content) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: content.description,
          url: content.url
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareText = `${content.title}\n\n${content.description}\n\n${content.url}`;
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Content copied to clipboard!');
      });
    }
  };

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
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
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

          <div className="card" onClick={handleSafeFoodsClick} style={{cursor: 'pointer'}}>
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
                  </svg>
                </div>
                <span className="card-title">Safe Foods</span>
              </div>
              <span className="chevron">›</span>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">{safeFoods.length}</span>
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

        {/* Highlights Section */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Highlights</h2>
          </div>
          
          <div className="card">
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
        </div>

        {/* Get More from GutSafe Section */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Get More from GutSafe</h2>
          </div>
          
          <div className="card">
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
        </div>

        {/* Articles Section */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Articles</h2>
          </div>
          
          <div className="card">
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
        </div>
      </div>

      {/* Safe Foods Modal */}
      {showSafeFoods && (
        <div className="modal-overlay" onClick={() => setShowSafeFoods(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close" onClick={() => setShowSafeFoods(false)}>Done</button>
              <h2 className="modal-title">Safe Foods</h2>
              <button 
                className="modal-share" 
                onClick={() => handleShare({
                  title: 'My Safe Foods',
                  description: 'Check out my safe foods from GutSafe!',
                  url: 'gutsafe://safe-foods'
                })}
              >
                Share
              </button>
            </div>
            
            <div className="modal-content">
              {safeFoods.map((food) => (
                <div key={food.id} className="safe-food-card">
                  <div className="safe-food-header">
                    <h3 className="safe-food-name">{food.name}</h3>
                    <button 
                      className="share-button"
                      onClick={() => handleShare({
                        title: `My Safe Food: ${food.name}`,
                        description: `Used ${food.usageCount} times • FODMAP: ${food.fodmapLevel} • Source: ${food.dataSource}`,
                        url: `gutsafe://safe-food/${food.id}`
                      })}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                      </svg>
                    </button>
                  </div>
                  {food.brand && (
                    <p className="safe-food-brand">{food.brand}</p>
                  )}
                  <p className="data-source">Source: {food.dataSource}</p>
                  <div className="safe-food-stats">
                    <span className="stat">Used {food.usageCount} times</span>
                    <span className="stat">FODMAP: {food.fodmapLevel}</span>
                  </div>
                  {food.notes && (
                    <p className="safe-food-notes">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      {food.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryScreen;
