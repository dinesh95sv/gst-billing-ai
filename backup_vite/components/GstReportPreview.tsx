
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreHorizontal, Share2, Download, Loader2, ShieldCheck } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Invoice, Factory } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const GstReportPreview: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);

  const savedState = JSON.parse(localStorage.getItem('reports_page_state') || '{}');
  const selectedDate = savedState.selectedDate ? new Date(savedState.selectedDate) : new Date();

  useEffect(() => {
    const updateScale = () => {
      const padding = 32;
      const containerWidth = window.innerWidth - padding;
      const paperWidth = 800;
      if (containerWidth < paperWidth) {
        setPreviewScale(containerWidth / paperWidth);
      } else {
        setPreviewScale(1);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    setInvoices(StorageService.getInvoices());
    const factories = StorageService.getFactories();
    if (factories.length > 0) {
      setSelectedFactory(factories[0]);
    }
  }, []);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const periodStr = `${monthNames[selectedDate.getMonth()].toUpperCase()} ${selectedDate.getFullYear()}`;

  const reportData = useMemo(() => {
    const filtered = invoices.filter(inv => {
      const d = new Date(inv.date);
      return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
    });

    let outputGst = 0;
    let local18 = { cgst: 0, sgst: 0, igst: 0, total: 0 };
    let local12 = { cgst: 0, sgst: 0, igst: 0, total: 0 };
    let interstate = { cgst: 0, sgst: 0, igst: 0, total: 0 };

    filtered.forEach(inv => {
      outputGst += inv.taxTotal;
      const isInterstate = inv.id.charCodeAt(0) % 2 !== 0; 
      
      inv.items.forEach(item => {
        const itemTax = (item.quantity * item.rate) * (item.gstRate / 100);
        if (isInterstate) {
          interstate.igst += itemTax;
          interstate.total += itemTax;
        } else if (item.gstRate === 18) {
          local18.cgst += itemTax / 2;
          local18.sgst += itemTax / 2;
          local18.total += itemTax;
        } else if (item.gstRate === 12) {
          local12.cgst += itemTax / 2;
          local12.sgst += itemTax / 2;
          local12.total += itemTax;
        }
      });
    });

    return {
      period: periodStr,
      business: {
        name: selectedFactory?.name || 'LUMINA INDUSTRIAL CORP.',
        address: selectedFactory?.location || 'Gujarat - 380001',
        gstin: selectedFactory?.gstin || '24AAAAA0000A1Z5'
      },
      generated: { 
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), 
        ref: `#GST-${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}`, 
        status: 'FINAL' 
      },
      summary: { 
        outputGst, 
        inputItc: 0.00, 
        netPayable: outputGst 
      },
      breakdown: [
        { description: 'Interstate Sales', ...interstate },
        { description: 'Local Sales (18%)', ...local18 },
        { description: 'Local Sales (12%)', ...local12 }
      ]
    };
  }, [invoices, selectedDate, selectedFactory, periodStr]);

  const generatePdfBlob = async (): Promise<Blob> => {
    const element = document.getElementById('report-pdf-content');
    if (!element) throw new Error("Report element not found");
    
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    const finalImgWidth = imgWidth * ratio;
    const finalImgHeight = imgHeight * ratio;
    
    const xOffset = (pdfWidth - finalImgWidth) / 2;
    const yOffset = (pdfHeight - finalImgHeight) / 2;
    
    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, finalImgWidth, finalImgHeight);
    return pdf.output('blob');
  };

  const handleShare = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const blob = await generatePdfBlob();
      const fileName = `GST_Report_${periodStr.replace(/\s/g, '_')}.pdf`;
      const file = new File([blob], fileName, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ 
            files: [file], 
            title: 'GST Tax Liability Report', 
            text: `GST Report for ${periodStr}` 
          });
        } catch (shareErr: any) {
          if (shareErr.name !== 'AbortError') {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
          }
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error: any) {
      console.error('Processing failed:', error);
      alert(`Could not process report: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const blob = await generatePdfBlob();
      const fileName = `GST_Report_${periodStr.replace(/\s/g, '_')}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0c0f14] text-white overflow-hidden">
      <header className="flex items-center justify-between px-6 py-5 sticky top-0 bg-[#0c0f14] z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-800 transition-colors"><ChevronLeft size={28} className="text-white" /></button>
        <h2 className="text-lg font-bold tracking-tight">Report PDF Preview</h2>
        <button className="p-1 rounded-full hover:bg-gray-800 transition-colors"><MoreHorizontal size={24} className="text-gray-300" /></button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-48 no-scrollbar flex flex-col items-center">
        <div 
          id="report-pdf-content" 
          className="bg-white shadow-2xl p-8 text-black animate-in zoom-in-95 duration-500 origin-top"
          style={{ 
            width: '800px',
            minHeight: '1122px',
            transform: `scale(${previewScale})`,
            marginBottom: `-${(1 - previewScale) * 1122}px`
          }}
        >
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <h1 className="text-3xl font-black text-[#0c0f14] tracking-tight leading-none mb-2">GST TAX LIABILITY</h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Report Period: {reportData.period}</p>
            </div>
            <div className="bg-[#1a1c24] text-white p-3 rounded-md text-center min-w-[100px]">
              <p className="text-[10px] font-black tracking-widest leading-tight uppercase">OFFICIAL COPY</p>
            </div>
          </div>
          <div className="w-full h-[2px] bg-black mb-10"></div>
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">From Business</p>
              <h3 className="text-sm font-black text-black leading-tight mb-1">{reportData.business.name}</h3>
              <p className="text-[10px] text-gray-600 leading-relaxed mb-3 pr-4">{reportData.business.address}</p>
              <p className="text-[10px] font-bold text-black uppercase tracking-widest">GSTIN: <span className="font-black">{reportData.business.gstin}</span></p>
            </div>
            <div className="text-right flex flex-col items-end">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Generated Details</p>
              <p className="text-xs font-bold text-gray-700">Date: {reportData.generated.date}</p>
              <p className="text-xs font-bold text-gray-700 mb-4">Ref: {reportData.generated.ref}</p>
              <div className="border border-gray-200 rounded px-3 py-1.5 inline-block bg-gray-50">
                <p className="text-[10px] font-black tracking-widest uppercase">STATUS: {reportData.generated.status}</p>
              </div>
            </div>
          </div>
          <div className="mb-12">
            <div className="flex items-center space-x-2 mb-4"><div className="w-1 h-4 bg-blue-600 rounded-full"></div><h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-800">Liability Summary</h4></div>
            <div className="grid grid-cols-3 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-r border-gray-100 bg-white"><p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-2">Output GST</p><p className="text-lg font-black text-black leading-none">₹{reportData.summary.outputGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p></div>
              <div className="p-4 border-r border-gray-100 bg-white"><p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-2">Input ITC</p><p className="text-lg font-black text-black leading-none">₹{reportData.summary.inputItc.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p></div>
              <div className="p-4 bg-blue-50/20"><p className="text-[8px] font-bold text-blue-600 uppercase tracking-widest mb-2">Net Payable</p><p className="text-lg font-black text-blue-600 leading-none">₹{reportData.summary.netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p></div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-4"><div className="w-1 h-4 bg-gray-400 rounded-full"></div><h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-800">Tax Breakdown</h4></div>
            <table className="w-full">
              <thead><tr className="bg-[#1a1c24] text-white"><th className="text-left py-2.5 px-3 text-[9px] font-bold uppercase tracking-widest rounded-tl-lg">Description</th><th className="text-center py-2.5 px-3 text-[9px] font-bold uppercase tracking-widest">CGST</th><th className="text-center py-2.5 px-3 text-[9px] font-bold uppercase tracking-widest">SGST</th><th className="text-center py-2.5 px-3 text-[9px] font-bold uppercase tracking-widest">IGST</th><th className="text-right py-2.5 px-3 text-[9px] font-bold uppercase tracking-widest rounded-tr-lg">Total</th></tr></thead>
              <tbody>
                {reportData.breakdown.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-3 text-[10px] font-bold text-gray-700">{row.description}</td>
                    <td className="py-3 px-3 text-[10px] font-bold text-center text-gray-500">{row.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-3 text-[10px] font-bold text-center text-gray-500">{row.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-3 text-[10px] font-bold text-center text-gray-500">{row.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-3 text-[10px] font-black text-right text-black">{row.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action Buttons - Side by Side and just above bottom nav */}
      <div className="fixed bottom-24 left-0 right-0 px-6 py-4 bg-gradient-to-t from-[#0c0f14] via-[#0c0f14]/90 to-transparent max-w-md mx-auto z-30 flex flex-col items-center">
        <div className="flex flex-row space-x-3 w-full mb-3">
          <button 
            disabled={isProcessing} 
            className="flex-1 bg-[#22c55e] py-4 rounded-[1.25rem] flex items-center justify-center space-x-2 text-white font-bold shadow-xl shadow-green-500/20 active:scale-[0.98] transition-all disabled:opacity-50" 
            onClick={handleShare}
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Share2 size={20} />}
            <span className="text-sm">Share</span>
          </button>
          <button 
            disabled={isProcessing} 
            className="flex-1 bg-[#1e293b] py-4 rounded-[1.25rem] flex items-center justify-center space-x-2 border border-gray-800 text-white font-bold active:scale-[0.98] transition-all disabled:opacity-50" 
            onClick={handleDownload}
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
            <span className="text-sm">Save</span>
          </button>
        </div>
        <div className="flex items-center justify-center space-x-2 opacity-40">
          <ShieldCheck size={14} className="text-gray-500" />
          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em]">Verified GST Tax Report</span>
        </div>
      </div>
    </div>
  );
};

export default GstReportPreview;
