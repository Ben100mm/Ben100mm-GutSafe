/**
 * @fileoverview NotificationService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { logger } from '../utils/logger';

/**
 * NotificationService - Handles notifications
 */
class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    logger.info('NotificationService initialized', 'NotificationService');
  }

  cleanup(): void {
    logger.info('NotificationService cleaned up', 'NotificationService');
  }
}

export default NotificationService;
