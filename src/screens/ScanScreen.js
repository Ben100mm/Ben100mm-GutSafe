import React, { useState } from 'react';

const ScanScreen = () => {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scan result after 2 seconds
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div>
      {/* Header */}
      <div className="header">
        <h1 className="title">Scan</h1>
        <button className="profile-button">B</button>
      </div>

      {/* Content */}
      <div className="content">
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Food Scanner</h2>
          </div>
          
          <div className="card">
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12m-3.2 0a3.2 3.2 0 1 1 6.4 0 3.2 3.2 0 1 1 -6.4 0"/>
                    <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                  </svg>
                </div>
                <span className="card-title">Barcode Scanner</span>
              </div>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">Ready to scan</span>
              </div>
              <div className="description">
                Point your camera at a barcode or menu item
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <span className="card-title">Menu Scanner</span>
              </div>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">OCR Ready</span>
              </div>
              <div className="description">
                Scan restaurant menus for ingredient analysis
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title-row">
                <div className="card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.1,13.34L2,9.15L5.5,6.65L8.1,13.34M14.5,6.65L18,9.15L11.9,13.34L14.5,6.65M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"/>
                  </svg>
                </div>
                <span className="card-title">Recipe Analyzer</span>
              </div>
            </div>
            <div className="card-content">
              <div className="value-row">
                <span className="value">Paste Recipe</span>
              </div>
              <div className="description">
                Paste a recipe URL or text for instant analysis
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <button 
              className="scan-button"
              onClick={handleScan}
              disabled={isScanning}
            >
              {isScanning ? 'Scanning...' : 'Start Scanning'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scan-button {
          background: linear-gradient(135deg, #0F5257 0%, #56CFE1 100%);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 18px 36px;
          font-size: 17px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(15, 82, 87, 0.4);
          transition: all 0.3s ease;
          letter-spacing: -0.2px;
          position: relative;
          overflow: hidden;
        }

        .scan-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .scan-button:hover::before {
          left: 100%;
        }

        .scan-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(15, 82, 87, 0.5);
        }

        .scan-button:active {
          transform: translateY(-1px);
        }

        .scan-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 4px 12px rgba(15, 82, 87, 0.2);
        }
      `}</style>
    </div>
  );
};

export default ScanScreen;
