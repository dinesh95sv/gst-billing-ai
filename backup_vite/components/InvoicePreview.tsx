
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreHorizontal, Download, Share2, ShieldCheck, Factory as FactoryIcon, Loader2 } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Invoice, Factory, Customer } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const numberToWords = (num: number): string => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    const tens = b[Math.floor(n / 10)];
    const units = a[n % 10];
    return tens + (units ? ' ' + units.trim() : '');
  };

  const convert = (n: number): string => {
    if (n === 0) return 'Zero';
    let res = '';
    if (n >= 10000000) {
      res += convert(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      res += convert(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      res += inWords(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    if (n >= 100) {
      res += inWords(Math.floor(n / 100)) + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (res !== '') res += 'and ';
      res += inWords(n);
    }
    return res;
  };

  const amount = Math.floor(num);
  const paise = Math.round((num - amount) * 100);
  let result = convert(amount);
  
  if (paise > 0) {
    result += ' and ' + convert(paise) + ' Paise Only';
  } else {
    result += ' Only';
  }
  return result;
};

const InvoicePreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [factory, setFactory] = useState<Factory | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);

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
    if (id) {
      const inv = StorageService.getInvoiceById(id);
      if (inv) {
        setInvoice(inv);
        const fact = StorageService.getFactories().find(f => f.name === inv.branchName);
        if (fact) setFactory(fact);
        const cust = StorageService.getCustomerById(inv.customerId);
        if (cust) setCustomer(cust);
      }
    }
  }, [id]);

  if (!invoice) return <div className="p-10 text-center text-gray-500">Invoice not found</div>;

  const discountAmount = invoice.discount || 0;
  const taxableValue = invoice.subTotal - (discountAmount > 0 ? discountAmount : 0);
  const finalTotal = invoice.grandTotal;

  const generatePdfBlob = async (): Promise<Blob> => {
    const element = document.getElementById('invoice-paper');
    if (!element) throw new Error("Invoice element not found");
    
    // Capture the element at high resolution
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
    
    // Center it on the page
    const xOffset = (pdfWidth - finalImgWidth) / 2;
    const yOffset = (pdfHeight - finalImgHeight) / 2;
    
    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, finalImgWidth, finalImgHeight);
    return pdf.output('blob');
  };

  const handleShareInvoice = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const blob = await generatePdfBlob();
      const fileName = `Invoice_${invoice.invoiceNumber.replace(/[#/]/g, '_')}.pdf`;
      const file = new File([blob], fileName, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Tax Invoice ${invoice.invoiceNumber}`,
            text: `Please find attached the GST invoice for ${invoice.customerName}.`
          });
        } catch (shareError: any) {
          if (shareError.name !== 'AbortError') {
            console.warn("Share failed, falling back to download:", shareError);
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
      alert(`Could not process PDF: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const blob = await generatePdfBlob();
      const fileName = `Invoice_${invoice.invoiceNumber.replace(/[#/]/g, '_')}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download failed:', error);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0c0f14] overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[#0c0f14] z-20 shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-800 transition-colors">
          <ChevronLeft size={28} className="text-white" />
        </button>
        <h2 className="text-lg font-bold text-white tracking-tight">Invoice Preview</h2>
        <button className="text-gray-400 p-1"><MoreHorizontal size={24} /></button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-48 no-scrollbar flex flex-col items-center">
        <div 
          id="invoice-paper" 
          className="bg-white shadow-2xl p-6 sm:p-8 text-black animate-in zoom-in-95 duration-500 origin-top"
          style={{ 
            width: '800px',
            minHeight: '1122px', 
            transform: `scale(${previewScale})`,
            marginBottom: `-${(1 - previewScale) * 1122}px`,
            fontSize: '12px'
          }}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-[#1a1c24] rounded-lg flex items-center justify-center text-white shrink-0 overflow-hidden">
                {factory?.logo ? (
                  <img src={factory.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <FactoryIcon size={32} />
                )}
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tighter leading-none mb-3">TAX INVOICE</h1>
                <h2 className="text-sm font-bold text-black mb-0.5">{factory?.name || invoice.branchName || 'ABC Factory Pvt Ltd'}</h2>
                <div className="text-[9px] text-gray-500 leading-tight space-y-0.5">
                  <p>{factory?.location || 'Company Address Location'}</p>
                  <p>{factory?.pincode ? `Pincode: ${factory.pincode}` : ''} | <span className="font-bold text-black">GSTIN: {factory?.gstin || '00AAAAA0000A1Z1'}</span></p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">ORIGINAL COPY</p>
              <div className="space-y-0.5 text-[10px]">
                <p className="text-gray-500">Invoice: <span className="font-bold text-black">{invoice.invoiceNumber}</span></p>
                <p className="text-gray-500">Date: <span className="font-bold text-black">{new Date(invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
                <p className="text-gray-500">Place: <span className="font-bold text-black">{factory?.location?.split(',').pop()?.trim() || 'Internal'}</span></p>
              </div>
            </div>
          </div>
          <div className="h-[1.5px] bg-black w-full mb-6"></div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#f9fafb] p-4 rounded-lg border border-gray-100 flex flex-col">
              <p className="text-[8px] font-black text-blue-500/60 uppercase tracking-[0.15em] mb-2">BILL TO</p>
              <p className="text-xs font-black text-gray-900 mb-1">{invoice.customerName}</p>
              <p className="text-[10px] text-gray-500 mb-3 leading-snug flex-1">
                {customer?.address || 'Customer Address Information'}
              </p>
              <p className="text-[10px] font-bold text-gray-900">GSTIN: {customer?.gstin || 'Unregistered'}</p>
            </div>
            <div className="bg-[#f9fafb] p-4 rounded-lg border border-gray-100 flex flex-col">
              <p className="text-[8px] font-black text-blue-500/60 uppercase tracking-[0.15em] mb-2">SHIP TO</p>
              <p className="text-xs font-black text-gray-900 mb-1">{invoice.customerName}</p>
              <p className="text-[10px] text-gray-500 mb-3 leading-snug flex-1">
                {customer?.address || 'Warehouse Delivery Address'}
              </p>
              <p className="text-[10px] font-bold text-gray-900">Contact: {customer?.phone || 'N/A'}</p>
            </div>
          </div>
          <div className="flex-1">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1a1c24] text-white">
                  <th className="px-3 py-2 text-[9px] font-black uppercase tracking-wider text-left rounded-tl-md">HSN</th>
                  <th className="px-3 py-2 text-[9px] font-black uppercase tracking-wider text-left">Item Description</th>
                  <th className="px-2 py-2 text-[9px] font-black uppercase tracking-wider text-center">Qty</th>
                  <th className="px-2 py-2 text-[9px] font-black uppercase tracking-wider text-right">Rate</th>
                  <th className="px-2 py-2 text-[9px] font-black uppercase tracking-wider text-right">GST%</th>
                  <th className="px-3 py-2 text-[9px] font-black uppercase tracking-wider text-right rounded-tr-md">Amt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-3 text-[10px] text-gray-400 font-medium">7318</td>
                    <td className="px-3 py-3 text-[10px] font-black text-gray-800 leading-tight">{item.productName}</td>
                    <td className="px-2 py-3 text-[10px] text-center font-bold text-gray-600">{item.quantity}</td>
                    <td className="px-2 py-3 text-[10px] text-right font-bold text-gray-600">{item.rate.toFixed(2)}</td>
                    <td className="px-2 py-3 text-[10px] text-right font-bold text-gray-600">{item.gstRate}%</td>
                    <td className="px-3 py-3 text-[10px] text-right font-black text-gray-900">{(item.quantity * item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                {[...Array(Math.max(0, 8 - invoice.items.length))].map((_, i) => (
                  <tr key={`empty-${i}`} className="h-10 border-b border-gray-50/50"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 border-t-[1.5px] border-black pt-6">
            <div className="grid grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
                  <p className="text-[7px] font-black text-blue-400 uppercase tracking-widest mb-1.5">TOTAL IN WORDS</p>
                  <p className="text-[11px] font-bold text-gray-800 italic leading-snug">{numberToWords(finalTotal)}</p>
                </div>
                <div className="space-y-1 pl-1">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">BANK DETAILS</p>
                  {factory?.bankName ? (
                    <>
                      <p className="text-[10px] font-bold text-gray-700">{factory.bankName} | AC: {factory.accountNumber}</p>
                      <p className="text-[10px] text-gray-500">IFSC: {factory.ifscCode} | Current Account</p>
                    </>
                  ) : (
                    <p className="text-[10px] text-gray-400">No bank details provided</p>
                  )}
                </div>
              </div>
              <div className="space-y-2 px-2">
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium"><span>Subtotal:</span><span className="text-black">{invoice.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium"><span>Discount:</span><span className="text-rose-500 font-bold">-{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                )}
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium border-t border-gray-50 pt-1"><span>Taxable Value:</span><span className="text-black font-bold">{taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium"><span>Total GST:</span><span className="text-black font-bold">{invoice.taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                <div className="pt-4 flex justify-between items-baseline border-t border-gray-200 mt-2">
                  <span className="text-xs font-black uppercase text-gray-900 tracking-tighter">GRAND TOTAL:</span>
                  <span className="text-2xl font-black text-blue-600 tracking-tight">₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            <div className="mt-12 flex justify-between items-end border-t border-gray-100 pt-8">
              <div className="max-w-[240px]">
                <p className="text-[8px] text-gray-400 leading-relaxed italic">
                  <div>Notes: Goods once sold will not be taken back.</div>
                  <div>Computer generated invoice, does not require a Signature.</div>
                </p>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="w-36 h-20 mb-2 flex items-center justify-center bg-gray-50/50 rounded-lg overflow-hidden">
                  {factory?.signature && (
                    <img src={factory.signature} alt="Signature" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                  )}
                </div>
                <div className="w-36 h-[1px] bg-gray-300 mb-1.5"></div>
                <p className="text-[9px] font-black uppercase tracking-tight text-gray-900">AUTHORIZED SIGNATORY</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Side by Side and just above bottom nav */}
        <div className="fixed bottom-24 left-0 right-0 px-6 py-4 bg-gradient-to-t from-[#0c0f14] via-[#0c0f14]/90 to-transparent max-w-md mx-auto z-30 flex flex-col items-center">
          <div className="flex flex-row space-x-3 w-full mb-3">
            <button 
              disabled={isProcessing} 
              onClick={handleShareInvoice} 
              className="flex-1 bg-[#22c55e] py-4 rounded-2xl flex items-center justify-center space-x-2 text-white font-bold shadow-xl shadow-green-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Share2 size={20} />}
              <span className="text-sm">Share</span>
            </button>
            <button 
              disabled={isProcessing} 
              onClick={handleDownloadPDF} 
              className="flex-1 bg-[#1e293b] border border-gray-800 py-4 rounded-2xl flex items-center justify-center space-x-2 text-white font-bold active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
              <span className="text-sm">Save</span>
            </button>
          </div>
          <div className="flex items-center justify-center space-x-2 opacity-40">
            <ShieldCheck size={14} className="text-gray-500" />
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em]">Verified GST Compliant Document</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
