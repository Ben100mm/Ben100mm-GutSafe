/**
 * @fileoverview withErrorBoundary.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { ComponentType } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface WithErrorBoundaryOptions {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const WithErrorBoundaryComponent = (props: P) => {
    return (
      <ErrorBoundary fallback={options.fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

export default withErrorBoundary;
