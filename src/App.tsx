/**
 * @fileoverview GutSafe - Main Application Component
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { initializeServices, cleanupServices } from './services/ServiceManager';
import { logger } from './utils/logger';

// Main App Component with Context
function AppContent() {
  const { state, dispatch } = useApp();
  const [servicesInitialized, setServicesInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Initialize services
        await initializeServices();
        setServicesInitialized(true);
        
        dispatch({ type: 'SET_LOADING', payload: false });
        logger.info('App initialized successfully', 'App');
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize app' });
        dispatch({ type: 'SET_LOADING', payload: false });
        logger.error('Failed to initialize app', 'App', error);
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      cleanupServices().catch(error => {
        logger.error('Failed to cleanup services', 'App', error);
      });
    };
  }, [dispatch]);

  if (state.isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f0f0f0',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#0F5257' }}>GutSafe</h2>
          <p>Initializing services...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f0f0f0',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center', color: '#d32f2f' }}>
          <h2 style={{ color: '#0F5257' }}>GutSafe</h2>
          <p>Error: {state.error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0F5257',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#0F5257' }}>GutSafe App</h1>
      <p>✅ Services initialized: {servicesInitialized ? 'Yes' : 'No'}</p>
      <p>📊 Scan History: {state.scanHistory.length} scans</p>
      <p>👤 Gut Profile: {state.gutProfile ? 'Loaded' : 'Not set'}</p>
      <p>🌐 Network: {state.networkStatus.isOnline ? 'Online' : 'Offline'} ({state.networkStatus.quality}% quality)</p>
      <p>⚙️ Settings: {state.userSettings ? 'Loaded' : 'Not set'}</p>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Simplified Architecture</h3>
        <ul>
          <li>✅ 5 Core Services (Auth, Food, Health, Storage, Network)</li>
          <li>✅ Context API for State Management</li>
          <li>✅ Simple Service Manager (no dependency injection)</li>
          <li>✅ Removed 17 individual services</li>
          <li>✅ Removed ServiceContainer complexity</li>
          <li>✅ Removed Zustand store</li>
        </ul>
      </div>
    </div>
  );
}

// App with Provider
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}