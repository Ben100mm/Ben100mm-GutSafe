/**
 * @fileoverview usePermissions.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { useState, useEffect, useCallback } from 'react';
import { permissionManager, PermissionType, PermissionStatus } from '../utils/permissionManager';

interface PermissionState {
  status: PermissionStatus;
  canAskAgain: boolean;
  isLoading: boolean;
  error?: string;
}

interface UsePermissionsResult {
  permissions: Record<PermissionType, PermissionState>;
  requestPermission: (permission: PermissionType) => Promise<boolean>;
  checkPermission: (permission: PermissionType) => Promise<boolean>;
  hasPermission: (permission: PermissionType) => boolean;
  canRequestPermission: (permission: PermissionType) => boolean;
  refreshPermissions: () => Promise<void>;
}

export const usePermissions = (permissionsToCheck: PermissionType[] = []): UsePermissionsResult => {
  const [permissions, setPermissions] = useState<Record<PermissionType, PermissionState>>({
    camera: { status: 'undetermined', canAskAgain: true, isLoading: false },
    location: { status: 'undetermined', canAskAgain: true, isLoading: false },
    notifications: { status: 'undetermined', canAskAgain: true, isLoading: false },
    storage: { status: 'undetermined', canAskAgain: true, isLoading: false },
    microphone: { status: 'undetermined', canAskAgain: true, isLoading: false },
  });

  const updatePermissionState = useCallback((permission: PermissionType, updates: Partial<PermissionState>) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: { ...prev[permission], ...updates },
    }));
  }, []);

  const checkPermission = useCallback(async (permission: PermissionType): Promise<boolean> => {
    updatePermissionState(permission, { isLoading: true, error: undefined });

    try {
      const result = await permissionManager.checkPermission(permission);
      updatePermissionState(permission, {
        status: result.status,
        canAskAgain: result.canAskAgain,
        isLoading: false,
        error: result.reason,
      });
      return result.status === 'granted';
    } catch (error) {
      updatePermissionState(permission, {
        status: 'denied',
        canAskAgain: false,
        isLoading: false,
        error: error.message,
      });
      return false;
    }
  }, [updatePermissionState]);

  const requestPermission = useCallback(async (permission: PermissionType): Promise<boolean> => {
    updatePermissionState(permission, { isLoading: true, error: undefined });

    try {
      const result = await permissionManager.requestPermission(permission);
      updatePermissionState(permission, {
        status: result.status,
        canAskAgain: result.canAskAgain,
        isLoading: false,
        error: result.reason,
      });
      return result.status === 'granted';
    } catch (error) {
      updatePermissionState(permission, {
        status: 'denied',
        canAskAgain: false,
        isLoading: false,
        error: error.message,
      });
      return false;
    }
  }, [updatePermissionState]);

  const hasPermission = useCallback((permission: PermissionType): boolean => {
    return permissions[permission].status === 'granted';
  }, [permissions]);

  const canRequestPermission = useCallback((permission: PermissionType): boolean => {
    const permissionState = permissions[permission];
    return permissionState.canAskAgain && permissionState.status !== 'granted';
  }, [permissions]);

  const refreshPermissions = useCallback(async (): Promise<void> => {
    const promises = permissionsToCheck.map(permission => checkPermission(permission));
    await Promise.all(promises);
  }, [permissionsToCheck, checkPermission]);

  // Check permissions on mount
  useEffect(() => {
    if (permissionsToCheck.length > 0) {
      refreshPermissions();
    }
  }, [refreshPermissions]);

  return {
    permissions,
    requestPermission,
    checkPermission,
    hasPermission,
    canRequestPermission,
    refreshPermissions,
  };
};

// Hook for specific permission
export const usePermission = (permission: PermissionType) => {
  const { permissions, requestPermission, checkPermission, hasPermission, canRequestPermission } = usePermissions([permission]);
  
  return {
    permission: permissions[permission],
    requestPermission: () => requestPermission(permission),
    checkPermission: () => checkPermission(permission),
    hasPermission: hasPermission(permission),
    canRequestPermission: canRequestPermission(permission),
  };
};

// Hook for camera permission specifically
export const useCameraPermission = () => {
  return usePermission('camera');
};

// Hook for location permission specifically
export const useLocationPermission = () => {
  return usePermission('location');
};

// Hook for notification permission specifically
export const useNotificationPermission = () => {
  return usePermission('notifications');
};

export default usePermissions;
