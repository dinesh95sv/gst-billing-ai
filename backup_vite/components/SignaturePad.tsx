
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RotateCw, Info } from 'lucide-react';

const SignaturePad: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#2563eb'; // Standard Blue Ink
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        const pos = getPos(e);
        ctx.moveTo(pos.x, pos.y);
      }
    }
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
      }
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      const dataUrl = canvas.toDataURL('image/png');
      localStorage.setItem('temp_signature', dataUrl);
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0c0f14] text-white overflow-hidden animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sticky top-0 bg-[#0c0f14] z-20">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-800">
          <ChevronLeft size={28} className="text-white" />
        </button>
        <h2 className="text-lg font-bold tracking-tight text-white">Digital Signature</h2>
        <button className="text-blue-500 font-bold text-lg hover:underline transition-all">Help</button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-48">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white mb-3">Draw your signature</h1>
          <p className="text-gray-500 text-sm font-medium">Please sign within the white area below for your<br/>GST invoice</p>
        </div>

        <div className="relative w-full aspect-[4/3] max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border-[6px] border-[#1b232e]">
          {/* Grid Background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ 
            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
          }}></div>
          
          <button className="absolute top-4 right-4 bg-[#4b5563] px-3 py-1.5 rounded-lg flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-white/80 z-10">
            <RotateCw size={14} />
            <span>Rotate for Space</span>
          </button>

          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="w-full h-full cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <div className="flex items-center space-x-8 mt-10">
          <div className="flex items-center space-x-2">
            <Info size={16} className="text-gray-600" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Signature will be saved as high-res PNG</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Standard Blue Ink</span>
          </div>
        </div>
      </div>

      {/* Footer Actions moved above bottom nav */}
      <div className="fixed bottom-24 left-0 right-0 p-6 flex space-x-4 bg-[#0c0f14]/80 backdrop-blur-xl max-w-md mx-auto z-40 border-t border-gray-800/30">
        <button 
          onClick={clearCanvas}
          className="flex-1 py-4 rounded-2xl bg-[#1b232e] border border-gray-800 text-white font-black text-lg active:scale-[0.98] transition-all"
        >
          Clear
        </button>
        <button 
          onClick={saveSignature}
          disabled={!hasDrawn}
          className={`flex-1 py-4 rounded-2xl font-black text-lg shadow-xl active:scale-[0.98] transition-all ${
            hasDrawn ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          Save & Apply
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
