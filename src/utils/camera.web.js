/**
 * @fileoverview camera.web.js
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useState, useRef, useEffect } from 'react';

// Web implementation of expo-camera with getUserMedia support
export const Camera = ({ 
  style, 
  children, 
  onBarCodeScanned,
  barCodeScannerSettings,
  ...props 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera if available
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (err) {
        console.error('Camera access denied:', err);
        setError('Camera access denied');
      }
    };

    initializeCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      // Simulate barcode scanning
      if (onBarCodeScanned) {
        // Mock barcode data for web
        const mockBarcode = {
          type: 'EAN_13',
          data: '1234567890123'
        };
        onBarCodeScanned(mockBarcode);
      }
    }
  };

  return (
    <div
      style={{
        ...style,
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {error ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            Camera not available
          </div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>
            {error}
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />
          {children}
        </>
      )}
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

// Web-specific camera utilities
export const requestCameraPermissionsAsync = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    return { status: 'granted' };
  } catch (error) {
    return { status: 'denied' };
  }
};

export const getCameraPermissionsAsync = async () => {
  try {
    const result = await navigator.permissions.query({ name: 'camera' });
    return { status: result.state === 'granted' ? 'granted' : 'denied' };
  } catch (error) {
    return { status: 'undetermined' };
  }
};
