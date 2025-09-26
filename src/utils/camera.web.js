/**
 * @fileoverview camera.web.js
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

// Web implementation of expo-camera
export const Camera = ({ style, children, ...props }) => {
  return (
    <div
      style={{
        ...style,
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
      }}
    >
      <div>Camera not available on web</div>
      {children}
    </div>
  );
};

export const CameraType = {
  back: 'back',
  front: 'front',
};

export const CameraPermissionStatus = {
  granted: 'granted',
  denied: 'denied',
  undetermined: 'undetermined',
};
