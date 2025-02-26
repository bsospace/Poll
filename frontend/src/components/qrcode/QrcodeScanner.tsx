import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

interface QRScannerProps {
  onResult: (result: { text: string } | null) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onResult }) => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const [scanning, setScanning] = useState<boolean>(true);
  const [scannedText, setScannedText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [qrScannerInstance, setQrScannerInstance] = useState<QrScanner | null>(null);

  useEffect(() => {
    const video = videoElementRef.current;
    if (!video) return;

    // Reset states when component mounts
    setScanning(true);
    setScannedText('');
    setError('');

    try {
      const qrScanner = new QrScanner(
        video,
        (result: QrScanner.ScanResult) => {
          console.log('Decoded QR code:', result);
          setScannedText(result.data);
          setScanning(false);
          onResult({ text: result.data });
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          calculateScanRegion: (video) => {
            const smallerDimension = Math.min(video.videoWidth, video.videoHeight);
            const scanRegionSize = Math.round(smallerDimension * 0.7);
            
            return {
              x: Math.round((video.videoWidth - scanRegionSize) / 2),
              y: Math.round((video.videoHeight - scanRegionSize) / 2),
              width: scanRegionSize,
              height: scanRegionSize,
            };
          }
        }
      );

      qrScanner.start().catch(error => {
        console.error('QR Scanner start error:', error);
        setError('Could not access camera. Please check permissions.');
        setScanning(false);
      });

      setQrScannerInstance(qrScanner);

      return () => {
        qrScanner.stop();
        qrScanner.destroy();
      };
    } catch (err) {
      console.error('QR Scanner initialization error:', err);
      setError('Failed to initialize camera. Please try again.');
      setScanning(false);
    }
  }, [onResult]);

  const handleRetry = () => {
    if (qrScannerInstance) {
      qrScannerInstance.stop();
      qrScannerInstance.destroy();
      setQrScannerInstance(null);
    }
    
    setScanning(true);
    setScannedText('');
    setError('');
    
    // Re-trigger the useEffect
    setTimeout(() => {
      const video = videoElementRef.current;
      if (!video) return;
      
      try {
        const qrScanner = new QrScanner(
          video,
          (result: QrScanner.ScanResult) => {
            console.log('Decoded QR code:', result);
            setScannedText(result.data);
            setScanning(false);
            onResult({ text: result.data });
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );
        
        qrScanner.start().catch(error => {
          console.error('QR Scanner retry error:', error);
          setError('Could not access camera. Please check permissions.');
          setScanning(false);
        });
        
        setQrScannerInstance(qrScanner);
      } catch (err) {
        console.error('QR Scanner retry initialization error:', err);
        setError('Failed to initialize camera. Please try again.');
        setScanning(false);
      }
    }, 100);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-sm mb-6">
        <div className={`w-full aspect-square rounded-2xl overflow-hidden border-2 ${error ? 'border-red-300' : scannedText ? 'border-green-400' : 'border-blue-300'} bg-gray-50 shadow-inner relative`}>
          {/* Camera overlay frame */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute inset-0 border-[40px] sm:border-[60px] border-black/50 box-border rounded-2xl"></div>
            {scanning && (
              <div className="absolute top-1/2 left-0 transform w-full h-0.5 bg-blue-400 animate-scan"></div>
            )}
          </div>

          {scanning ? (
            <video 
              className="object-cover w-full h-full" 
              ref={videoElementRef} 
            />
          ) : scannedText ? (
            <div className="w-full h-full flex items-center justify-center bg-green-50">
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <span className="text-green-700 font-medium">QR Code Detected</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-red-50">
              <div className="flex flex-col items-center">
                <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                <span className="text-red-700 font-medium">Camera Error</span>
              </div>
            </div>
          )}
        </div>

        {/* Status message */}
        <div className="text-center mt-4">
          {scanning ? (
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Scanning for QR code...</span>
            </div>
          ) : scannedText ? (
            <div className="text-green-600 font-medium">
              Successfully scanned access key
            </div>
          ) : (
            <div className="text-red-600 font-medium">
              {error || "Scanner error. Please try again."}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-6 space-y-4">
          {!scanning && (
            <Button 
              onClick={handleRetry} 
              variant="outline" 
              className="w-full rounded-full py-5 border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              Try Again
            </Button>
          )}
        </div>
      </div>

      {/* Debug info - can be removed in production */}
      {scannedText && (
        <div className="w-full max-w-xs mt-2 px-4 py-2 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-500 break-all">Key: {scannedText}</p>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% {
            transform: translateY(-100px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100px);
            opacity: 0;
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;