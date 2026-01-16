
import React, { useEffect, useState } from 'react';
import { Search, Plus, ChevronLeft, MoreHorizontal, Phone, User, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Customer } from '../types';

const Customers: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  useEffect(() => {
    setCustomers(StorageService.getCustomers());
  }, []);

  const filterOptions = ['All', 'Active', 'Inactive'];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          customer.gstin.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (activeFilter === 'Active') matchesStatus = customer.isActive === true;
    else if (activeFilter === 'Inactive') matchesStatus = customer.isActive === false;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = () => {
    if (customerToDelete) {
      StorageService.deleteCustomer(customerToDelete.id);
      setCustomers(StorageService.getCustomers());
      setCustomerToDelete(null);
    }
  };

  return (
    <div className="flex flex-col min-h-full animate-in slide-in-from-right duration-300 relative">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sticky top-0 bg-[#0c0f14] z-20">
        <button onClick={() => navigate('/')} className="p-1 rounded-full hover:bg-gray-800">
          <ChevronLeft size={28} className="text-white" />
        </button>
        <h2 className="text-xl font-bold tracking-tight">Customer Directory</h2>
        <button className="p-1 rounded-full hover:bg-gray-800">
          <MoreHorizontal size={24} className="text-gray-300" />
        </button>
      </header>

      {/* Search & Filters */}
      <div className="px-6 space-y-5">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            placeholder="Search name or GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#151c27] border border-gray-800/30 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all placeholder-gray-600"
          />
        </div>

        <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setActiveFilter(opt)}
              className={`px-6 py-2 rounded-xl whitespace-nowrap text-sm font-semibold transition-all border ${
                activeFilter === opt 
                ? 'bg-[#3b82f6] text-white border-transparent shadow-lg shadow-blue-500/20' 
                : 'bg-[#151c27] text-gray-400 border-gray-800/50 hover:border-gray-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Customer List */}
      <div className="px-6 space-y-4 mt-6 pb-40">
        {filteredCustomers.map((customer) => (
          <div 
            key={customer.id} 
            onClick={() => navigate(`/edit-customer/${customer.id}`)}
            className="bg-[#151c27] rounded-[1.5rem] overflow-hidden border border-gray-800/20 hover:border-gray-700/50 transition-all active:scale-[0.98] cursor-pointer group"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-white leading-tight">{customer.name}</h3>
                      <div className={`w-2 h-2 rounded-full ${customer.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></div>
                    </div>
                    <div className="flex items-center space-x-1.5 mt-1 text-gray-500">
                      <User size={14} className="opacity-70" />
                      <span className="text-sm font-medium">{customer.contactPerson}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (customer.phone) window.location.href = `tel:${customer.phone}`;
                  }}
                  className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                >
                  <Phone size={18} fill="currentColor" className="opacity-80" />
                </button>
              </div>

              <div className="pt-4 border-t border-gray-800/50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">GSTIN NUMBER</p>
                  <p className="text-sm font-bold text-blue-500 tracking-wider">{customer.gstin}</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomerToDelete(customer);
                  }}
                  className="p-3 bg-rose-500/10 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredCustomers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-600">
            <p className="font-bold">No customers found</p>
            <p className="text-xs">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {customerToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setCustomerToDelete(null)}></div>
          <div className="bg-[#1a222e] w-full max-w-sm rounded-[2rem] p-8 relative z-10 border border-gray-800 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Customer?</h3>
              <p className="text-gray-400 text-sm">Are you sure you want to remove this customer and all associated data?</p>
            </div>

            <div className="bg-[#0c0f14] p-5 rounded-2xl mb-8 space-y-3">
              <div className="flex justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Name</span>
                <span className="text-sm font-bold text-white text-right ml-4">{customerToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contact</span>
                <span className="text-sm font-bold text-white text-right ml-4">{customerToDelete.contactPerson}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">GSTIN</span>
                <span className="text-sm font-bold text-blue-500">{customerToDelete.gstin}</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button 
                onClick={() => setCustomerToDelete(null)}
                className="flex-1 py-4 rounded-2xl bg-gray-800 text-gray-400 font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-4 rounded-2xl bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20 active:scale-95 transition-transform"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB for Add Customer */}
      <button 
        className="fixed bottom-28 right-8 w-16 h-16 bg-[#3b82f6] rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-500/50 active:scale-90 transition-transform z-30"
        onClick={() => navigate('/add-customer')}
      >
        <Plus size={32} strokeWidth={3} />
      </button>
    </div>
  );
};

export default Customers;
