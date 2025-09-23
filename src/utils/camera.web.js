// Web implementation of expo-camera
export const Camera = ({ style, children, ...props }) => {
  return (
    <div style={{ ...style, backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
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
