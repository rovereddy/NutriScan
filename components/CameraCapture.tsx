import React, { useRef, useState, useEffect } from 'react';
import { X, RefreshCw, Upload, Smartphone } from 'lucide-react';
import { Language } from '../types';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  language: Language;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel, language }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(
        language === 'zh' 
          ? "無法存取相機。請檢查權限或上傳照片。" 
          : "Could not access camera. Please check permissions or upload a file."
      );
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Stop stream before proceeding
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        onCapture(imageData);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
           if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          onCapture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const t = {
    scanIngredients: language === 'zh' ? '掃描成份' : 'SCAN INGREDIENTS',
    uploadPhoto: language === 'zh' ? '上傳照片' : 'Upload Photo',
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col font-sans">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent text-white">
        <button onClick={onCancel} className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
          <X size={24} />
        </button>
        <div className="text-sm font-semibold tracking-wide bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
          {t.scanIngredients}
        </div>
        <button onClick={toggleCamera} className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
          <RefreshCw size={24} />
        </button>
      </div>

      {/* Video Viewport */}
      <div className="flex-1 relative flex items-center justify-center bg-gray-900 overflow-hidden">
        {!error ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white text-center p-6 max-w-sm">
            <Smartphone size={48} className="mx-auto mb-4 text-white/50" />
            <p className="mb-6 text-white/90 font-medium">{error}</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-3 bg-primary hover:bg-primary-hover rounded-full font-bold transition-colors"
            >
              {t.uploadPhoto}
            </button>
          </div>
        )}
        
        {/* Helper Guide Box with Grid */}
        {!error && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
             <div className="w-[80%] h-[60%] border-2 border-white/60 rounded-2xl relative overflow-hidden shadow-2xl">
                {/* Grid Lines */}
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20"></div>
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20"></div>
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20"></div>
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20"></div>
                
                {/* Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-sm"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-sm"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-sm"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-sm"></div>
             </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/80 backdrop-blur-xl p-10 flex justify-around items-center">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-4 rounded-full text-white/80 hover:bg-white/10 transition"
        >
          <Upload size={28} />
        </button>
        
        <button 
          onClick={captureImage}
          disabled={!!error}
          className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group relative"
        >
          <div className="w-20 h-20 bg-white rounded-full group-active:scale-90 transition-transform duration-200" />
        </button>
        
        <div className="w-12" /> {/* Spacer for balance */}
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*"
        className="hidden" 
        onChange={handleFileUpload}
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;