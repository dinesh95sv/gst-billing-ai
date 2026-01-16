
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, ArrowUpRight, Download, Calendar, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Invoice } from '../types';

const STATE_KEY = 'reports_page_state';

const GstReport: React.FC = () => {
  const navigate = useNavigate();
  
  const savedState = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
  const [selectedDate, setSelectedDate] = useState(savedState.selectedDate ? new Date(savedState.selectedDate) : new Date());
  
  const [showPicker, setShowPicker] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    localStorage.setItem(STATE_KEY, JSON.stringify({
      selectedDate: selectedDate.toISOString()
    }));
  }, [selectedDate]);

  useEffect(() => {
    setInvoices(StorageService.getInvoices());
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const invDate = new Date(inv.date);
      return invDate.getMonth() === selectedDate.getMonth() && 
             invDate.getFullYear() === selectedDate.getFullYear();
    });
  }, [invoices, selectedDate]);

  const stats = useMemo(() => {
    let igst = 0;
    let cgstSgst = 0;
    filteredInvoices.forEach(inv => {
      const totalTax = inv.taxTotal;
      if (inv.id.charCodeAt(0) % 2 === 0) {
        cgstSgst += totalTax;
      } else {
        igst += totalTax;
      }
    });
    return { igst, cgstSgst, total: igst + cgstSgst };
  }, [filteredInvoices]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedDate.setMonth(selectedDate.getMonth() + offset));
    setSelectedDate(new Date(newDate));
  };

  const formattedMonthYear = `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-300 px-6 relative">
      <header className="flex items-center justify-between py-5 shrink-0">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold tracking-tight text-white">GST Reports</h2>
          <div className="flex items-center text-blue-500 text-xs font-bold mt-0.5">
            <Calendar size={12} className="mr-1" />
            <span>{formattedMonthYear}</span>
          </div>
        </div>
        <button 
          onClick={() => setShowPicker(!showPicker)}
          className={`p-2 rounded-xl transition-all ${showPicker ? 'bg-blue-600 text-white' : 'bg-gray-800/50 text-gray-400'}`}
        >
          <Calendar size={20} />
        </button>
      </header>

      {showPicker && (
        <div className="absolute top-20 right-6 left-6 bg-[#1a222e] border border-gray-800 rounded-3xl p-6 shadow-2xl z-50 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => changeMonth(-12)} className="p-2 hover:bg-gray-700 rounded-full text-gray-400"><ChevronLeft size={20} /></button>
            <span className="text-lg font-bold text-white">{selectedDate.getFullYear()}</span>
            <button onClick={() => changeMonth(12)} className="p-2 hover:bg-gray-700 rounded-full text-gray-400"><ChevronRight size={20} /></button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {monthNames.map((name, i) => (
              <button
                key={name}
                onClick={() => {
                  const newDate = new Date(selectedDate.getFullYear(), i, 1);
                  setSelectedDate(newDate);
                  setShowPicker(false);
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${selectedDate.getMonth() === i ? 'bg-blue-600 text-white' : 'bg-gray-800/30 text-gray-400 hover:bg-gray-800'}`}
              >
                {name.substring(0, 3)}
              </button>
            ))}
          </div>
          <button onClick={() => setShowPicker(false)} className="w-full mt-4 py-2 text-gray-500 font-bold text-xs flex items-center justify-center"><X size={14} className="mr-1" /> Close</button>
        </div>
      )}

      <div className="space-y-6 mt-4 pb-40">
        <div className="bg-[#151c27] rounded-[2rem] p-6 border border-gray-800/20">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total GST Collected</p>
              <h3 className="text-2xl font-bold text-white">₹{stats.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="bg-emerald-500/10 px-2 py-1 rounded-lg flex items-center text-emerald-500 text-[10px] font-bold">
              <ArrowUpRight size={12} className="mr-1" /> {filteredInvoices.length} Invoices
            </div>
          </div>
          <div className="h-40 flex items-end justify-between space-x-2">
            {[40, 70, 45, 90, 65, 80, 55].map((height, i) => (
              <div key={i} className="flex-1 bg-blue-500/20 rounded-t-lg relative group transition-all hover:bg-blue-500/40" style={{ height: `${stats.total > 0 ? (height * 0.8) : 5}%` }}></div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#151c27] p-5 rounded-[1.5rem] border border-gray-800/10"><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">IGST</p><h4 className="text-lg font-bold text-white">₹{stats.igst.toLocaleString('en-IN')}</h4></div>
          <div className="bg-[#151c27] p-5 rounded-[1.5rem] border border-gray-800/10"><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">CGST/SGST</p><h4 className="text-lg font-bold text-white">₹{stats.cgstSgst.toLocaleString('en-IN')}</h4></div>
        </div>

        <button onClick={() => navigate('/report-preview')} className="w-full bg-[#3b82f6] py-5 rounded-2xl flex items-center justify-center space-x-3 text-white font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-[0.98]"><Eye size={22} /><span>Preview PDF Report</span></button>
      </div>
    </div>
  );
};

export default GstReport;
