
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, Plus, Trash2, Search, Check, X, Factory as FactoryIcon, Tag } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Customer, Invoice, InvoiceStatus, InvoiceItem, Product, Factory } from '../types';

const SearchableCustomer: React.FC<{
  customers: Customer[];
  selectedId: string;
  onSelect: (customer: Customer) => void;
}> = ({ customers, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedCustomer = customers.find(c => c.id === selectedId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.gstin.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Customer</label>
      <div 
        className="w-full bg-[#0c0f14] border border-gray-800 rounded-xl p-4 text-white flex items-center justify-between cursor-pointer focus-within:ring-1 focus-within:ring-blue-500 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedCustomer ? "text-white text-sm" : "text-gray-600 text-sm"}>
          {selectedCustomer ? selectedCustomer.name : "Search and select customer..."}
        </span>
        <Search size={16} className="text-gray-500" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a222e] border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3 border-b border-gray-800">
            <input 
              autoFocus
              placeholder="Type to search..."
              className="w-full bg-[#0c0f14] border border-gray-800 rounded-lg p-2 text-sm text-white focus:outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-60 overflow-y-auto no-scrollbar">
            {filtered.length > 0 ? (
              filtered.map(c => (
                <div 
                  key={c.id}
                  className="p-4 hover:bg-blue-600/10 cursor-pointer flex items-center justify-between group"
                  onClick={() => {
                    onSelect(c);
                    setIsOpen(false);
                    setQuery('');
                  }}
                >
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-blue-400">{c.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{c.gstin}</p>
                  </div>
                  {selectedId === c.id && <Check size={16} className="text-blue-500" />}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-600 text-sm italic">No customers found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SearchableFactory: React.FC<{
  factories: Factory[];
  selectedId: string;
  onSelect: (factory: Factory) => void;
}> = ({ factories, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedFactory = factories.find(f => f.id === selectedId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filtered = factories.filter(f => 
    f.name.toLowerCase().includes(query.toLowerCase()) || 
    f.gstin.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Source Factory</label>
      <div 
        className="w-full bg-[#0c0f14] border border-gray-800 rounded-xl p-4 text-white flex items-center justify-between cursor-pointer focus-within:ring-1 focus-within:ring-blue-500 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedFactory ? "text-white text-sm" : "text-gray-600 text-sm"}>
          {selectedFactory ? selectedFactory.name : "Select Billing Factory..."}
        </span>
        <FactoryIcon size={16} className="text-gray-500" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a222e] border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3 border-b border-gray-800">
            <input 
              autoFocus
              placeholder="Search factory..."
              className="w-full bg-[#0c0f14] border border-gray-800 rounded-lg p-2 text-sm text-white focus:outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-60 overflow-y-auto no-scrollbar">
            {filtered.length > 0 ? (
              filtered.map(f => (
                <div 
                  key={f.id}
                  className="p-4 hover:bg-blue-600/10 cursor-pointer flex items-center justify-between group"
                  onClick={() => {
                    onSelect(f);
                    setIsOpen(false);
                    setQuery('');
                  }}
                >
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-blue-400">{f.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{f.location}</p>
                  </div>
                  {selectedId === f.id && <Check size={16} className="text-blue-500" />}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-600 text-sm italic">No factories found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SearchableProduct: React.FC<{
  products: Product[];
  value: string;
  onSelect: (product: Product) => void;
  onChange: (val: string) => void;
}> = ({ products, value, onSelect, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(value.toLowerCase()) || 
    p.hsnCode.includes(value)
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="text-[10px] text-gray-500 font-bold block mb-2 uppercase tracking-widest">Product Description</label>
      <div className="relative">
        <input 
          placeholder="Search and select product..."
          className="w-full bg-[#0c0f14] border border-gray-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all pr-10"
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
        />
        <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>

      {isOpen && value && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a222e] border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-48 overflow-y-auto no-scrollbar">
            {filtered.length > 0 ? (
              filtered.map(p => (
                <div 
                  key={p.id}
                  className="p-4 hover:bg-blue-600/10 cursor-pointer flex items-center justify-between group"
                  onClick={() => {
                    onSelect(p);
                    setIsOpen(false);
                  }}
                >
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-blue-400">{p.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">HSN: {p.hsnCode} • ₹{p.price.toLocaleString()}</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded uppercase">{p.gstRate}% GST</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-600 text-sm italic">New Item (Not in directory)</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const InvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedFactoryId, setSelectedFactoryId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [discount, setDiscount] = useState<number>(0);
  const [items, setItems] = useState<Partial<InvoiceItem>[]>([
    { id: Math.random().toString(), productName: '', quantity: 1, rate: 0, gstRate: 18 }
  ]);

  useEffect(() => {
    setCustomers(StorageService.getCustomers());
    setProducts(StorageService.getProducts());
    setFactories(StorageService.getFactories());
    
    if (isEditMode && id) {
      const existingInvoice = StorageService.getInvoiceById(id);
      if (existingInvoice) {
        setSelectedCustomerId(existingInvoice.customerId);
        setInvoiceNumber(existingInvoice.invoiceNumber);
        setInvoiceDate(existingInvoice.date);
        setItems(existingInvoice.items);
        setDiscount(existingInvoice.discount || 0);
        // Find factory by branchName
        const f = StorageService.getFactories().find(fact => fact.name === existingInvoice.branchName);
        if (f) setSelectedFactoryId(f.id);
      }
    } else {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      const allInvoices = StorageService.getInvoices();
      const todayInvoicesCount = allInvoices.filter(inv => inv.date === dateStr).length;
      const sequence = String(todayInvoicesCount + 1).padStart(3, '0');
      
      setInvoiceNumber(`#INV-${yyyy}-${mm}-${dd}-${sequence}`);
      setInvoiceDate(dateStr);
    }
  }, [id, isEditMode]);

  const handleAddItem = () => {
    setItems([...items, { id: Math.random().toString(), productName: '', quantity: 1, rate: 0, gstRate: 18 }]);
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => item.id === itemId ? { ...item, [field]: value } : item));
  };

  const handleProductSelect = (itemId: string, product: Product) => {
    setItems(items.map(item => 
      item.id === itemId ? { 
        ...item, 
        productId: product.id, 
        productName: product.name, 
        rate: product.price, 
        gstRate: product.gstRate 
      } : item
    ));
  };

  const calculateTotals = () => {
    let subTotal = 0;
    let taxTotal = 0;
    items.forEach(item => {
      const lineSub = (item.quantity || 0) * (item.rate || 0);
      const lineTax = lineSub * ((item.gstRate || 0) / 100);
      subTotal += lineSub;
      taxTotal += lineTax;
    });
    const grandTotal = subTotal + taxTotal - (discount || 0);
    return { subTotal, taxTotal, grandTotal };
  };

  const { subTotal, taxTotal, grandTotal } = calculateTotals();

  const handleSave = () => {
    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    const selectedFactory = factories.find(f => f.id === selectedFactoryId);
    
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }

    if (items.some(item => !item.productName || (item.quantity ?? 0) <= 0)) {
      alert("Please ensure all items have a name and quantity greater than zero.");
      return;
    }

    const invoiceData: Invoice = {
      id: id || Date.now().toString(),
      invoiceNumber: invoiceNumber,
      date: invoiceDate,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      branchName: selectedFactory?.name || 'Default Plant',
      items: items as InvoiceItem[],
      subTotal,
      taxTotal,
      discount: discount || 0,
      grandTotal,
      status: isEditMode ? (StorageService.getInvoiceById(id!)?.status || InvoiceStatus.PENDING) : InvoiceStatus.PENDING
    };

    StorageService.saveInvoice(invoiceData);
    navigate('/invoices');
  };

  return (
    <div className="px-6 animate-in slide-in-from-right duration-300 pb-56">
      <header className="flex items-center space-x-2 -ml-2 py-5 sticky top-0 bg-[#0c0f14] z-20">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-800 transition-colors">
          <ChevronLeft size={24} className="text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">
          {isEditMode ? 'Edit GST Invoice' : 'New GST Invoice'}
        </h2>
      </header>

      <div className="space-y-6 mt-2">
        {/* Basic Info */}
        <div className="bg-[#151c27] p-5 rounded-3xl space-y-4 border border-gray-800/20">
          <div className="grid grid-cols-1 gap-4">
            <SearchableFactory 
              factories={factories}
              selectedId={selectedFactoryId}
              onSelect={(f) => setSelectedFactoryId(f.id)}
            />
            <SearchableCustomer 
              customers={customers}
              selectedId={selectedCustomerId}
              onSelect={(c) => setSelectedCustomerId(c.id)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Invoice No.</label>
              <input 
                className="w-full bg-[#0c0f14] border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Date</label>
              <input 
                type="date"
                className="w-full bg-[#0c0f14] border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase flex justify-between items-center px-1">
            <span>Line Items</span>
            <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded text-[10px]">{items.length} Total</span>
          </h3>
          
          {items.map((item) => (
            <div key={item.id} className="bg-[#151c27] p-5 rounded-3xl space-y-4 relative group border border-gray-800/10 shadow-sm">
              {items.length > 1 && (
                <button onClick={() => removeItem(item.id!)} className="absolute top-4 right-4 text-rose-500 p-2 hover:bg-rose-500/10 rounded-full transition-colors z-10">
                  <Trash2 size={18} />
                </button>
              )}
              
              <SearchableProduct 
                products={products}
                value={item.productName || ''}
                onSelect={(p) => handleProductSelect(item.id!, p)}
                onChange={(val) => updateItem(item.id!, 'productName', val)}
              />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-2 uppercase tracking-widest">Qty</label>
                  <input 
                    type="number"
                    className="w-full bg-[#0c0f14] border border-gray-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id!, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-2 uppercase tracking-widest">Rate</label>
                  <input 
                    type="number"
                    className="w-full bg-[#0c0f14] border border-gray-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id!, 'rate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-2 uppercase tracking-widest">GST %</label>
                  <select 
                    className="w-full bg-[#0c0f14] border border-gray-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    value={item.gstRate}
                    onChange={(e) => updateItem(item.id!, 'gstRate', parseInt(e.target.value))}
                  >
                    {[0, 5, 12, 18, 28].map(rate => (
                      <option key={rate} value={rate}>{rate}%</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <p className="text-[10px] font-bold text-gray-500 uppercase">
                  Line Total: <span className="text-blue-500">₹{((item.quantity || 0) * (item.rate || 0) * (1 + (item.gstRate || 0) / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </p>
              </div>
            </div>
          ))}

          <button 
            onClick={handleAddItem}
            className="w-full border-2 border-dashed border-gray-800/50 py-5 rounded-3xl flex items-center justify-center space-x-2 text-gray-500 hover:text-blue-500 hover:border-blue-500/50 transition-all active:scale-[0.99]"
          >
            <Plus size={20} />
            <span className="font-bold">Add Another Item</span>
          </button>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto glass-effect p-6 border-t border-gray-800/30 space-y-4 z-40">
        <div className="space-y-3 px-2">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Grand Total</span>
              <div className="text-2xl font-black text-white">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="text-right space-y-1">
               <div className="flex items-center justify-end space-x-2">
                 <Tag size={12} className="text-rose-500" />
                 <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Discount</span>
                 <input 
                    type="number"
                    className="w-20 bg-[#0c0f14] border border-gray-800 rounded-lg p-1 text-white text-[11px] text-right focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="0"
                    value={discount || ''}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                 />
               </div>
               <div className="text-[10px] text-gray-500 font-medium">
                  <p>Sub: ₹{subTotal.toLocaleString('en-IN')}</p>
                  <p>Tax: ₹{taxTotal.toLocaleString('en-IN')}</p>
               </div>
            </div>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl flex items-center justify-center space-x-2 font-bold text-white shadow-xl shadow-blue-600/30 active:scale-[0.98] transition-all"
        >
          <Save size={20} />
          <span>{isEditMode ? 'Update Invoice' : 'Generate Invoice'}</span>
        </button>
      </div>
    </div>
  );
};

export default InvoiceForm;
