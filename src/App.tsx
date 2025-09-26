/**
 * @fileoverview GutSafe - Main Application Component
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { useEffect } from 'react';

import { AppProvider, useApp } from './context/AppContext';
import { initializeServices, cleanupServices } from './services/ServiceManager';
import { logger } from './utils/logger';
import { AppNavigator } from './navigation/AppNavigator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingOverlay } from './components/LoadingStates';

// Main App Component with Context
function AppContent(): JSX.Element {
  const { state, dispatch } = useApp();

  useEffect(() => {
    const initializeApp = async (): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Initialize services
        await initializeServices();

        dispatch({ type: 'SET_LOADING', payload: false });
        logger.info('App initialized successfully', 'App');
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize app' });
        dispatch({ type: 'SET_LOADING', payload: false });
        logger.error('Failed to initialize app', 'App', error);
      }
    };

    void initializeApp();

    // Cleanup on unmount
    return () => {
      void cleanupServices().catch((error) => {
        logger.error('Failed to cleanup services', 'App', error);
      });
    };
  }, [dispatch]);

  if (state.isLoading) {
    return (
      <LoadingOverlay
        visible={true}
        message="Initializing GutSafe..."
        transparent={false}
      />
    );
  }

  if (state.error !== null && state.error !== undefined) {
    return (
      <ErrorBoundary
        fallback={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              backgroundColor: '#f0f0f0',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            <div style={{ textAlign: 'center', color: '#d32f2f' }}>
              <h2 style={{ color: '#0F5257' }}>GutSafe</h2>
              <p>Error: {state.error}</p>
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#0F5257',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        }
      >
        <div>Error occurred</div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AppNavigator />
    </ErrorBoundary>
  );
}

// App with Provider
export default function App(): JSX.Element {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
