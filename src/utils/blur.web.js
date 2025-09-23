// Web implementation of @react-native-community/blur
export const BlurView = ({ style, children, ...props }) => {
  return (
    <div style={{ ...style, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
      {children}
    </div>
  );
};
