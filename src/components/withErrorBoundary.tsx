/**
 * @fileoverview withErrorBoundary.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { errorHandler } from '../utils/errorHandler';

interface WithErrorBoundaryOptions {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  showDetails?: boolean;
  enableReporting?: boolean;
  context?: string;
}

/**
 * Higher-order component that wraps a component with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const WithErrorBoundaryComponent = (props: P) => {
    return (
      <ErrorBoundary
        fallback={options.fallback}
        {...(options.onError && { onError: options.onError })}
        {...(options.showDetails !== undefined && { showDetails: options.showDetails })}
        {...(options.enableReporting !== undefined && { enableReporting: options.enableReporting })}
        {...(options.context && { context: options.context })}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

/**
 * Hook for handling errors in functional components
 */
export function useErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    const appError = errorHandler.handleError(error, {
      operation: 'useErrorHandler',
      ...(context && { service: context }),
    });

    const userFriendlyError = errorHandler.getUserFriendlyError(appError);
    
    return {
      error: appError,
      userFriendlyError,
      canRetry: userFriendlyError.canRetry,
      severity: userFriendlyError.severity,
      category: userFriendlyError.category,
    };
  };

  const handleAsyncError = async <T,>(
    asyncFn: () => Promise<T>,
    context?: string
  ) => {
    try {
      const result = await asyncFn();
      return { success: true, data: result, error: null };
    } catch (error) {
      const errorResult = handleError(error as Error, context);
      return { success: false, data: null, error: errorResult };
    }
  };

  return {
    handleError,
    handleAsyncError,
  };
}

export default withErrorBoundary;