/**
 * @fileoverview ErrorBoundary.test.tsx - Tests for ErrorBoundary component
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return null;
};

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for these tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
        <div>Child component</div>
      </ErrorBoundary>
    );

    expect(getByText('Child component')).toBeTruthy();
  });

  it('should catch errors and render error UI', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('An unexpected error occurred')).toBeTruthy();
  });

  it('should show retry button when error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText('Try Again')).toBeTruthy();
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object));
  });

  it('should reset error state when retry is pressed', () => {
    const { getByText, rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();

    // Press retry button
    fireEvent.press(getByText('Try Again'));

    // Rerender with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
        <div>Child component</div>
      </ErrorBoundary>
    );

    expect(getByText('Child component')).toBeTruthy();
  });

  it('should render custom error message', () => {
    const customMessage = 'Custom error message';

    const { getByText } = render(
      <ErrorBoundary errorMessage={customMessage}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText(customMessage)).toBeTruthy();
  });

  it('should render custom error UI', () => {
    const customErrorUI = <div>Custom error UI</div>;

    const { getByText } = render(
      <ErrorBoundary errorUI={customErrorUI}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText('Custom error UI')).toBeTruthy();
  });

  it('should handle multiple errors gracefully', () => {
    const { getByText, rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();

    // Trigger another error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('should not catch errors in event handlers', () => {
    const EventHandlerError = () => {
      const handleClick = () => {
        throw new Error('Event handler error');
      };

      return (
        <button onPress={handleClick} testID="error-button">
          Click me
        </button>
      );
    };

    const { getByTestId } = render(
      <ErrorBoundary>
        <EventHandlerError />
      </ErrorBoundary>
    );

    // Error boundary should not catch this error
    expect(getByTestId('error-button')).toBeTruthy();
  });

  it('should handle async errors in useEffect', async () => {
    const AsyncErrorComponent = () => {
      React.useEffect(() => {
        setTimeout(() => {
          throw new Error('Async error');
        }, 100);
      }, []);

      return <div>Async component</div>;
    };

    const { getByText } = render(
      <ErrorBoundary>
        <AsyncErrorComponent />
      </ErrorBoundary>
    );

    expect(getByText('Async component')).toBeTruthy();

    // Wait for async error
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Error boundary should catch the error
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('should provide error information for debugging', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error',
        stack: expect.any(String),
      }),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should handle different error types', () => {
    const StringError = () => {
      throw 'String error';
    };

    const { getByText } = render(
      <ErrorBoundary>
        <StringError />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('should handle null errors', () => {
    const NullError = () => {
      throw null;
    };

    const { getByText } = render(
      <ErrorBoundary>
        <NullError />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('should handle undefined errors', () => {
    const UndefinedError = () => {
      throw undefined;
    };

    const { getByText } = render(
      <ErrorBoundary>
        <UndefinedError />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('should handle errors in nested components', () => {
    const NestedError = () => (
      <div>
        <div>Parent</div>
        <ThrowError shouldThrow={true} />
      </div>
    );

    const { getByText } = render(
      <ErrorBoundary>
        <NestedError />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('should handle errors in multiple nested components', () => {
    const MultipleNestedError = () => (
      <div>
        <div>Level 1</div>
        <div>
          <div>Level 2</div>
          <ThrowError shouldThrow={true} />
        </div>
      </div>
    );

    const { getByText } = render(
      <ErrorBoundary>
        <MultipleNestedError />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('should handle errors in sibling components', () => {
    const SiblingError = () => (
      <div>
        <div>Sibling 1</div>
        <ThrowError shouldThrow={true} />
        <div>Sibling 2</div>
      </div>
    );

    const { getByText } = render(
      <ErrorBoundary>
        <SiblingError />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('should handle errors in conditional rendering', () => {
    const ConditionalError = ({ showError }: { showError: boolean }) => (
      <div>
        {showError && <ThrowError shouldThrow={true} />}
        <div>Always visible</div>
      </div>
    );

    const { getByText, rerender } = render(
      <ErrorBoundary>
        <ConditionalError showError={false} />
      </ErrorBoundary>
    );

    expect(getByText('Always visible')).toBeTruthy();

    rerender(
      <ErrorBoundary>
        <ConditionalError showError={true} />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('should handle errors in list rendering', () => {
    const ListError = () => (
      <div>
        {[1, 2, 3].map((item, index) => (
          <div key={item}>
            {index === 1 && <ThrowError shouldThrow={true} />}
            Item {item}
          </div>
        ))}
      </div>
    );

    const { getByText } = render(
      <ErrorBoundary>
        <ListError />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('should handle errors in hooks', () => {
    const HookError = () => {
      const [state, setState] = React.useState(0);

      React.useEffect(() => {
        if (state > 0) {
          throw new Error('Hook error');
        }
      }, [state]);

      return (
        <button onPress={() => setState(1)} testID="hook-button">
          Trigger Error
        </button>
      );
    };

    const { getByTestId } = render(
      <ErrorBoundary>
        <HookError />
      </ErrorBoundary>
    );

    fireEvent.press(getByTestId('hook-button'));

    expect(getByTestId('hook-button')).toBeTruthy();
  });

  it('should handle errors in context providers', () => {
    const ContextError = () => {
      const [value, setValue] = React.useState(0);

      if (value > 0) {
        throw new Error('Context error');
      }

      return (
        <button onPress={() => setValue(1)} testID="context-button">
          Trigger Error
        </button>
      );
    };

    const { getByTestId } = render(
      <ErrorBoundary>
        <ContextError />
      </ErrorBoundary>
    );

    fireEvent.press(getByTestId('context-button'));

    expect(getByTestId('context-button')).toBeTruthy();
  });

  it('should handle errors in memo components', () => {
    const MemoError = React.memo(() => {
      throw new Error('Memo error');
    });

    const { getByText } = render(
      <ErrorBoundary>
        <MemoError />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('should handle errors in forwardRef components', () => {
    const ForwardRefError = React.forwardRef<HTMLDivElement>((props, ref) => {
      throw new Error('ForwardRef error');
    });

    const { getByText } = render(
      <ErrorBoundary>
        <ForwardRefError />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('should handle errors in lazy components', async () => {
    const LazyError = React.lazy(() =>
      Promise.resolve({
        default: () => {
          throw new Error('Lazy error');
        },
      })
    );

    const { getByText } = render(
      <ErrorBoundary>
        <React.Suspense fallback={<div>Loading...</div>}>
          <LazyError />
        </React.Suspense>
      </ErrorBoundary>
    );

    expect(getByText('Loading...')).toBeTruthy();

    // Wait for lazy component to load
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(getByText('Something went wrong')).toBeTruthy();
  });
});
