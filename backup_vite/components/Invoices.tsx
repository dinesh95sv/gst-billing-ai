
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Calendar, MoreVertical, Trash2, Share2, TrendingUp, TrendingDown, AlertTriangle, X, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Invoice, InvoiceStatus } from '../types';

const STATE_KEY = 'invoices_page_state';

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Load initial state from localStorage if available
  const savedState = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
  
  const [activeFilter, setActiveFilter] = useState(savedState.activeFilter || 'All');
  const [searchQuery, setSearchQuery] = useState(savedState.searchQuery || '');
  const [selectedDate, setSelectedDate] = useState(savedState.selectedDate ? new Date(savedState.selectedDate) : new Date());
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>(savedState.sortOrder || 'desc');
  
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [menuOpenInvoiceId, setMenuOpenInvoiceId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  // Persist state whenever it changes
  useEffect(() => {
    localStorage.setItem(STATE_KEY, JSON.stringify({
      activeFilter,
      searchQuery,
      selectedDate: selectedDate.toISOString(),
      sortOrder
    }));
  }, [activeFilter, searchQuery, selectedDate, sortOrder]);

  useEffect(() => {
    refreshInvoices();
  }, []);

  const refreshInvoices = () => {
    setInvoices(StorageService.getInvoices());
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedDate.setMonth(selectedDate.getMonth() + offset));
    setSelectedDate(new Date(newDate));
  };

  const handleUpdateStatus = (invoice: Invoice, status: InvoiceStatus) => {
    const updatedInvoice = { ...invoice, status };
    StorageService.saveInvoice(updatedInvoice);
    refreshInvoices();
    setMenuOpenInvoiceId(null);
  };

  const globalStats = useMemo(() => {
    return invoices.reduce((acc, inv) => {
      const invDate = new Date(inv.date);
      const isCurrentMonth = invDate.getMonth() === selectedDate.getMonth() && 
                             invDate.getFullYear() === selectedDate.getFullYear();
      
      if (isCurrentMonth) {
        if (inv.status === InvoiceStatus.PAID) {
          acc.totalPaid += inv.grandTotal;
        } else if (inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.OVERDUE) {
          acc.outstanding += inv.grandTotal;
        }
      }
      return acc;
    }, { outstanding: 0, totalPaid: 0 });
  }, [invoices, selectedDate]);

  const filteredAndSortedInvoices = useMemo(() => {
    let result = invoices.filter(inv => {
      const invDate = new Date(inv.date);
      const matchesDate = invDate.getMonth() === selectedDate.getMonth() && 
                          invDate.getFullYear() === selectedDate.getFullYear();
      const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = activeFilter === 'All' || inv.status.toLowerCase() === activeFilter.toLowerCase();
      return matchesDate && matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [invoices, searchQuery, activeFilter, selectedDate, sortOrder]);

  const handleDelete = () => {
    if (invoiceToDelete) {
      StorageService.deleteInvoice(invoiceToDelete.id);
      setInvoiceToDelete(null);
      refreshInvoices();
    }
  };

  const formattedMonthYear = `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-300 relative">
      <header className="flex items-center justify-between px-6 py-5 sticky top-0 bg-[#0c0f14] z-20">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600/20 p-2 rounded-xl text-blue-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M16 8h-6"/><path d="M16 12H8"/><path d="M13 16H8"/></svg>
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold tracking-tight text-white leading-none">Invoices</h2>
            <div className="flex items-center text-blue-500 text-[10px] font-bold mt-1">
              <Calendar size={10} className="mr-1" />
              <span>{formattedMonthYear}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowPicker(!showPicker)}
            className={`p-2 rounded-xl transition-all ${showPicker ? 'bg-blue-600 text-white' : 'bg-gray-800/50 text-gray-400'}`}
          >
            <Calendar size={20} />
          </button>
          <button className="p-2 rounded-xl bg-gray-800/50 text-gray-400">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {showPicker && (
        <div className="absolute top-20 right-6 left-6 bg-[#1a222e] border border-gray-800 rounded-3xl p-6 shadow-2xl z-50 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => changeMonth(-12)} className="p-2 hover:bg-gray-700 rounded-full text-gray-400">
              <ChevronLeft size={20} />
            </button>
            <span className="text-lg font-bold text-white">{selectedDate.getFullYear()}</span>
            <button onClick={() => changeMonth(12)} className="p-2 hover:bg-gray-700 rounded-full text-gray-400">
              <ChevronRight size={20} />
            </button>
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
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                  selectedDate.getMonth() === i 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800/30 text-gray-400 hover:bg-gray-800'
                }`}
              >
                {name.substring(0, 3)}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowPicker(false)}
            className="w-full mt-4 py-2 text-gray-500 font-bold text-xs flex items-center justify-center"
          >
            <X size={14} className="mr-1" /> Close
          </button>
        </div>
      )}

      <div className="px-6 mb-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            placeholder="Search invoice or customer"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#151c27] border border-gray-800/50 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none placeholder-gray-600 text-sm"
          />
        </div>
      </div>

      <div className="px-6 flex space-x-2 overflow-x-auto no-scrollbar mb-6">
        {['All', 'Paid', 'Pending', 'Overdue'].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-6 py-2 rounded-2xl text-sm font-bold transition-all border ${
              activeFilter === f 
              ? 'bg-[#3b82f6] text-white border-transparent shadow-lg shadow-blue-500/20' 
              : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="px-6 grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#151c27] p-5 rounded-[2rem] border border-gray-800/20 relative overflow-hidden">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 relative z-10">Total Outstanding</p>
          <h3 className="text-xl font-bold text-white mb-2 relative z-10">₹{globalStats.outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <AlertCircle size={40} className="text-amber-500" />
          </div>
        </div>
        <div className="bg-[#151c27] p-5 rounded-[2rem] border border-gray-800/20 relative overflow-hidden">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 relative z-10">Total Paid</p>
          <h3 className="text-xl font-bold text-white mb-2 relative z-10">₹{globalStats.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="px-6 mb-4 flex justify-between items-center">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          {formattedMonthYear} Records ({filteredAndSortedInvoices.length})
        </h4>
        <button 
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="text-[10px] font-bold text-blue-500 uppercase tracking-widest px-2 py-1 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors"
        >
          {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      <div className="px-6 space-y-4 pb-32">
        {filteredAndSortedInvoices.map((inv) => (
          <div key={inv.id} className="bg-[#151c27] rounded-[1.5rem] p-5 border border-gray-800/10 animate-in slide-in-from-bottom-2 duration-300 relative">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-blue-500">{inv.invoiceNumber}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                  inv.status === InvoiceStatus.PAID ? 'bg-emerald-500/10 text-emerald-500' :
                  inv.status === InvoiceStatus.PENDING ? 'bg-amber-500/10 text-amber-500' :
                  'bg-rose-500/10 text-rose-500'
                }`}>
                  {inv.status}
                </span>
              </div>
              
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenInvoiceId(menuOpenInvoiceId === inv.id ? null : inv.id);
                  }}
                  className={`p-1 rounded-lg transition-colors ${menuOpenInvoiceId === inv.id ? 'bg-gray-800 text-white' : 'text-gray-600 hover:text-gray-400'}`}
                >
                  <MoreVertical size={20} />
                </button>

                {menuOpenInvoiceId === inv.id && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setMenuOpenInvoiceId(null)}></div>
                    <div className="absolute right-0 top-8 w-48 bg-[#1a222e] border border-gray-800 rounded-2xl shadow-2xl z-40 p-2 animate-in fade-in zoom-in-95 duration-150">
                      <button onClick={() => handleUpdateStatus(inv, InvoiceStatus.PAID)} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-800"><CheckCircle2 size={16} /><span>Mark as Paid</span></button>
                      <button onClick={() => handleUpdateStatus(inv, InvoiceStatus.PENDING)} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-800"><Clock size={16} /><span>Mark as Pending</span></button>
                      <button onClick={() => handleUpdateStatus(inv, InvoiceStatus.OVERDUE)} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-800"><AlertCircle size={16} /><span>Mark as Overdue</span></button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-between items-end mb-5 cursor-pointer" onClick={() => navigate(`/edit-invoice/${inv.id}`)}>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">{inv.customerName}</h3>
                <div className="flex items-center text-gray-500 space-x-2 text-[11px] font-medium">
                  <Calendar size={12} />
                  <span>{new Date(inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <span className="text-gray-700">•</span>
                  <span>{inv.branchName || 'Default Plant'}</span>
                </div>
              </div>
              <div className="text-right ml-4 shrink-0">
                <p className="text-lg font-bold text-white">₹{inv.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setInvoiceToDelete(inv)} className="flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-rose-500/10 text-rose-500 font-bold text-xs uppercase tracking-wider hover:bg-rose-500/20 transition-colors"><Trash2 size={16} /><span>Delete</span></button>
              <button onClick={() => navigate(`/invoice/${inv.id}`)} className="flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gray-800/40 text-gray-300 font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors"><Share2 size={16} /><span>Share</span></button>
            </div>
          </div>
        ))}
        {filteredAndSortedInvoices.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center">
            <Calendar size={48} className="mb-4" />
            <p className="text-sm font-bold">No invoices found for this period</p>
          </div>
        )}
      </div>

      {invoiceToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-[#000000bb] backdrop-blur-sm" onClick={() => setInvoiceToDelete(null)}></div>
          <div className="bg-[#1a222e] w-full max-w-sm rounded-[2rem] p-8 relative z-10 border border-gray-800 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-6"><AlertTriangle size={32} /></div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Invoice?</h3>
              <p className="text-gray-400 text-sm">This action cannot be undone. Are you sure you want to remove this record?</p>
            </div>
            <div className="flex space-x-4">
              <button onClick={() => setInvoiceToDelete(null)} className="flex-1 py-4 rounded-2xl bg-gray-800/50 text-gray-400 font-bold hover:bg-gray-800 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-4 rounded-2xl bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20 active:scale-95 transition-transform">Delete</button>
            </div>
          </div>
        </div>
      )}

      <button className="fixed bottom-28 right-8 w-16 h-16 bg-[#3b82f6] rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-500/50 active:scale-90 transition-transform z-30" onClick={() => navigate('/create-invoice')}><Plus size={32} strokeWidth={3} /></button>
    </div>
  );
};

export default Invoices;
