/**
 * @fileoverview blur.web.js
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

// Web implementation of @react-native-community/blur
export const BlurView = ({ style, children, ...props }) => {
  return (
    <div style={{ ...style, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
      {children}
    </div>
  );
};
