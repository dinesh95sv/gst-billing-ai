
import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronLeft, SlidersHorizontal, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Product } from '../types';

const Products: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    const existing = StorageService.getProducts();
    if (existing.length === 0) {
      const mockProducts: Product[] = [
        { id: 'p1', name: 'Premium Cotton Fabric', hsnCode: '5208', price: 450.00, gstRate: 12, imageUrl: 'https://picsum.photos/seed/fabric1/200/200' },
        { id: 'p2', name: 'Industrial Sewing Thread', hsnCode: '5401', price: 85.00, gstRate: 5, imageUrl: 'https://picsum.photos/seed/thread/200/200' },
        { id: 'p3', name: 'Heavy Duty Tailoring Scissors', hsnCode: '8448', price: 1200.00, gstRate: 18, imageUrl: 'https://picsum.photos/seed/scissors/200/200' },
        { id: 'p6', name: 'Raw Wool (Exempt)', hsnCode: '5101', price: 320.00, gstRate: 0, imageUrl: 'https://picsum.photos/seed/wool/200/200' },
      ];
      mockProducts.forEach(p => StorageService.saveProduct(p));
      setProducts(mockProducts);
    } else {
      setProducts(existing);
    }
  }, []);

  const filterOptions = ['All', '0% GST', '5% GST', '12% GST', '18% GST', '28% GST'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.hsnCode.includes(searchQuery);
    
    if (activeFilter === 'All') return matchesSearch;
    const filterRate = parseInt(activeFilter);
    return matchesSearch && product.gstRate === filterRate;
  });

  const handleDelete = () => {
    if (productToDelete) {
      StorageService.deleteProduct(productToDelete.id);
      setProducts(StorageService.getProducts());
      setProductToDelete(null);
    }
  };

  return (
    <div className="flex flex-col min-h-full animate-in slide-in-from-right duration-300 relative bg-[#0c0f14]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sticky top-0 bg-[#0c0f14] z-20">
        <button onClick={() => navigate('/')} className="p-1 rounded-full hover:bg-gray-800 transition-colors">
          <ChevronLeft size={28} className="text-white" />
        </button>
        <h2 className="text-xl font-bold tracking-tight">Product Management</h2>
        <button className="p-1 rounded-full hover:bg-gray-800 transition-colors">
          <SlidersHorizontal size={24} className="text-gray-300" />
        </button>
      </header>

      {/* Search Bar */}
      <div className="px-6 space-y-5">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            placeholder="Search products or HSN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#151c27] border border-gray-800/50 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all placeholder-gray-600 font-medium"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setActiveFilter(opt)}
              className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all border ${
                activeFilter === opt 
                ? 'bg-[#3b82f6] text-white border-transparent shadow-lg shadow-blue-500/20' 
                : 'bg-[#151c27]/50 text-gray-500 border-gray-800 hover:border-gray-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="px-6 space-y-4 mt-6 pb-40">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            onClick={() => navigate(`/edit-product/${product.id}`)}
            className="bg-[#151c27] p-5 rounded-[2.5rem] flex items-center justify-between border border-gray-800/20 hover:border-gray-700/50 transition-all active:scale-[0.98] cursor-pointer group"
          >
            <div className="flex-1 pr-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border ${
                  product.gstRate === 0 ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-[#eab308]/10 text-[#eab308] border-[#eab308]/20'
                }`}>
                  {product.gstRate}% GST
                </span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  HSN: {product.hsnCode}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 leading-tight">{product.name}</h3>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline space-x-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">MRP</span>
                  <span className="text-2xl font-black text-[#3b82f6]">₹ {product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setProductToDelete(product);
                  }}
                  className="p-3 bg-rose-500/10 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-700 text-center">
            <Search size={40} className="opacity-20 mb-4" />
            <p className="font-bold text-gray-500">No products found</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {productToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setProductToDelete(null)}></div>
          <div className="bg-[#1a222e] w-full max-w-sm rounded-[2rem] p-8 relative z-10 border border-gray-800 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Product?</h3>
              <p className="text-gray-400 text-sm italic">" {productToDelete.name} "</p>
            </div>

            <div className="bg-[#0c0f14] p-5 rounded-2xl mb-8 space-y-3">
              <div className="flex justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">HSN Code</span>
                <span className="text-sm font-bold text-white">{productToDelete.hsnCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">MRP</span>
                <span className="text-sm font-bold text-blue-500">₹{productToDelete.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">GST Rate</span>
                <span className="text-sm font-bold text-white">{productToDelete.gstRate}%</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button 
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-4 rounded-2xl bg-gray-800 text-gray-400 font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-4 rounded-2xl bg-rose-600 text-white font-bold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button 
        className="fixed bottom-28 right-8 w-16 h-16 bg-[#3b82f6] rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-500/60 active:scale-90 transition-transform z-30"
        onClick={() => navigate('/add-product')} 
      >
        <Plus size={32} strokeWidth={3} />
      </button>
    </div>
  );
};

export default Products;
