
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, HelpCircle, Save, RotateCcw, ChevronRight } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Product } from '../types';

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const initialFormState: Partial<Product> = {
    name: '',
    hsnCode: '',
    price: 0,
    gstRate: 0,
    isInclusive: false
  };

  const [formData, setFormData] = useState<Partial<Product>>(initialFormState);

  useEffect(() => {
    if (isEditMode && id) {
      const existingProduct = StorageService.getProductById(id);
      if (existingProduct) {
        setFormData(existingProduct);
      }
    }
  }, [id, isEditMode]);

  const handleReset = () => {
    setFormData(initialFormState);
  };

  const handleSave = () => {
    if (!formData.name || !formData.hsnCode || formData.price === undefined) {
      alert("Please fill in Product Name, HSN Code and Price.");
      return;
    }

    const productData: Product = {
      id: formData.id || Date.now().toString(),
      name: formData.name || '',
      hsnCode: formData.hsnCode || '',
      price: formData.price || 0,
      gstRate: formData.gstRate || 0,
      isInclusive: formData.isInclusive || false,
      imageUrl: formData.imageUrl || `https://picsum.photos/seed/${formData.id || Date.now()}/200/200`
    };

    StorageService.saveProduct(productData);
    navigate('/products');
  };

  const labelStyle = "text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 block";
  const inputStyle = "w-full bg-[#151c27] border border-gray-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all placeholder-gray-700 text-sm";
  const sectionLabelStyle = "text-[11px] font-black text-gray-600 uppercase tracking-widest mt-8 mb-4";

  return (
    <div className="flex flex-col min-h-full animate-in slide-in-from-right duration-300 bg-[#0c0f14]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sticky top-0 bg-[#0c0f14] z-20">
        <button onClick={() => navigate('/products')} className="flex items-center space-x-1 text-blue-500 font-bold text-lg">
          <ChevronLeft size={24} />
          <span>Products</span>
        </button>
        <h2 className="text-lg font-bold text-white">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h2>
        <button className="text-blue-500">
          <HelpCircle size={24} />
        </button>
      </header>

      <div className="px-6 pb-60 flex-1 overflow-y-auto no-scrollbar">
        {/* Basic Information Section */}
        <p className={sectionLabelStyle}>Basic Information</p>
        
        <div className="space-y-6">
          <div>
            <label className={labelStyle}>Product Name</label>
            <input 
              className={inputStyle}
              placeholder="e.g. Industrial Steel Pipe"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className={labelStyle}>HSN Code</label>
            <input 
              className={inputStyle}
              placeholder="Enter 4 or 8 digit HSN"
              value={formData.hsnCode}
              onChange={(e) => setFormData({...formData, hsnCode: e.target.value})}
            />
          </div>
        </div>

        {/* Pricing & Taxation Section */}
        <p className={sectionLabelStyle}>Pricing & Taxation</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Unit Price</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
              <input 
                type="number"
                className={`${inputStyle} pl-8`}
                placeholder="0.00"
                value={formData.price || ''}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div>
            <label className={labelStyle}>GST %</label>
            <div className="relative">
              <select 
                className={`${inputStyle} appearance-none pr-10`}
                value={formData.gstRate}
                onChange={(e) => setFormData({...formData, gstRate: parseInt(e.target.value)})}
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
              <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 rotate-90" />
            </div>
          </div>
        </div>

        {/* Inclusive GST Card */}
        <div className="mt-8 bg-[#151c27] border border-gray-800 rounded-3xl p-6 flex items-center justify-between">
          <div>
            <h4 className="text-white font-bold mb-1">Inclusive of GST</h4>
            <p className="text-[10px] text-gray-500 font-medium">Tax is already included in the unit price</p>
          </div>
          <button 
            onClick={() => setFormData({...formData, isInclusive: !formData.isInclusive})}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${formData.isInclusive ? 'bg-blue-600' : 'bg-[#2a3441]'}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.isInclusive ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-24 left-0 right-0 p-6 bg-[#0c0f14]/80 backdrop-blur-md max-w-md mx-auto z-30 flex space-x-4">
        <button 
          onClick={handleReset}
          className="w-16 h-16 bg-[#151c27] border border-gray-800 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          title="Reset"
        >
          <RotateCcw size={22} />
        </button>
        <button 
          onClick={handleSave}
          className="flex-1 bg-[#3b82f6] hover:bg-blue-600 transition-all rounded-2xl flex items-center justify-center space-x-3 shadow-2xl shadow-blue-500/30 active:scale-[0.98] text-white"
        >
          <Save size={22} />
          <span className="text-lg font-bold">Save Product</span>
        </button>
      </div>
    </div>
  );
};

export default ProductForm;
