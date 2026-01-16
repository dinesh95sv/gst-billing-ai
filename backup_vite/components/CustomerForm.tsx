
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Building2, CreditCard, User, Smartphone, Mail, MapPin, UserPlus, RotateCcw, Save, Power } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Customer } from '../types';

const CustomerForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const initialFormState: Partial<Customer> = {
    name: '',
    gstin: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    isActive: true
  };

  const [formData, setFormData] = useState<Partial<Customer>>(initialFormState);

  useEffect(() => {
    if (isEditMode && id) {
      const existingCustomer = StorageService.getCustomerById(id);
      if (existingCustomer) {
        setFormData(existingCustomer);
      }
    }
  }, [id, isEditMode]);

  const handleReset = () => {
    setFormData(initialFormState);
  };

  const handleSave = () => {
    if (!formData.name || !formData.gstin) {
      alert("Please fill in the Company Name and GSTIN at minimum.");
      return;
    }

    const customerData: Customer = {
      id: formData.id || Date.now().toString(),
      name: formData.name || '',
      gstin: formData.gstin || '',
      contactPerson: formData.contactPerson || '',
      phone: formData.phone || '',
      email: formData.email || '',
      address: formData.address || '',
      isActive: formData.isActive ?? true,
      logoUrl: formData.logoUrl || `https://picsum.photos/seed/${formData.id || Date.now()}/100/100`
    };

    StorageService.saveCustomer(customerData);
    navigate('/customers');
  };

  const inputStyle = "w-full bg-[#151c27] border border-gray-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all placeholder-gray-600 text-sm";
  const labelStyle = "flex items-center space-x-2 text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-6";

  return (
    <div className="flex flex-col min-h-full animate-in slide-in-from-right duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sticky top-0 bg-[#0c0f14] z-20">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-800">
          <ChevronLeft size={28} className="text-white" />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-white">
          {isEditMode ? 'Edit Customer' : 'Add New Customer'}
        </h2>
        <div className="w-8"></div> {/* Spacer */}
      </header>

      <div className="px-6 pb-60">
        <div className="mt-4 mb-8">
          <h1 className="text-3xl font-black text-white mb-2">
            {isEditMode ? 'Update Details' : 'Customer Details'}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            {isEditMode 
              ? 'Update the customer information below.' 
              : 'Fill in the information to register a new client for GST billing.'}
          </p>
        </div>

        <div className="space-y-2">
          {/* Status Toggle - Placed at top for visibility */}
          <div className="bg-[#151c27] p-4 rounded-2xl border border-gray-800/50 flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl ${formData.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                <Power size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-wide">Account Status</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${formData.isActive ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setFormData({...formData, isActive: !formData.isActive})}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${formData.isActive ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          {/* Company Name */}
          <div>
            <div className={labelStyle}>
              <Building2 size={16} className="text-blue-500" />
              <span>Company Name</span>
            </div>
            <input 
              className={inputStyle}
              placeholder="Enter business name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* GSTIN */}
          <div>
            <div className={labelStyle}>
              <CreditCard size={16} className="text-blue-500" />
              <span>GSTIN</span>
            </div>
            <input 
              className={inputStyle}
              placeholder="22AAAAA0000A1Z5"
              value={formData.gstin}
              onChange={(e) => setFormData({...formData, gstin: e.target.value})}
            />
          </div>

          {/* Contact Person */}
          <div>
            <div className={labelStyle}>
              <User size={16} className="text-blue-500" />
              <span>Contact Person</span>
            </div>
            <input 
              className={inputStyle}
              placeholder="Enter contact person name"
              value={formData.contactPerson}
              onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
            />
          </div>

          {/* Mobile Number */}
          <div>
            <div className={labelStyle}>
              <Smartphone size={16} className="text-blue-500" />
              <span>Mobile Number</span>
            </div>
            <input 
              className={inputStyle}
              placeholder="+91 00000 00000"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          {/* Email */}
          <div>
            <div className={labelStyle}>
              <Mail size={16} className="text-blue-500" />
              <span>Email</span>
            </div>
            <input 
              className={inputStyle}
              placeholder="customer@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* Billing Address */}
          <div>
            <div className={labelStyle}>
              <MapPin size={16} className="text-blue-500" />
              <span>Billing Address</span>
            </div>
            <textarea 
              className={`${inputStyle} h-32 resize-none pt-4`}
              placeholder="Enter complete office or factory address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Fixed Action Bar above bottom navigation */}
      <div className="fixed bottom-24 left-0 right-0 p-6 bg-[#0c0f14]/80 backdrop-blur-md max-w-md mx-auto z-30 flex space-x-4 border-t border-gray-800/20">
        {!isEditMode && (
          <button 
            onClick={handleReset}
            className="flex-1 bg-gray-800/40 hover:bg-gray-800 transition-all py-5 rounded-[1rem] flex items-center justify-center space-x-2 border border-gray-700/30 active:scale-[0.98]"
          >
            <RotateCcw size={20} className="text-gray-400" />
            <span className="text-lg font-bold text-gray-400">Reset</span>
          </button>
        )}
        <button 
          onClick={handleSave}
          className={`flex-1 ${isEditMode ? 'w-full' : ''} bg-[#3b82f6] hover:bg-blue-600 transition-all py-5 rounded-[1rem] flex items-center justify-center space-x-2 shadow-2xl shadow-blue-500/30 active:scale-[0.98]`}
        >
          {isEditMode ? <Save size={20} className="text-white" /> : <UserPlus size={20} className="text-white" />}
          <span className="text-lg font-bold text-white">
            {isEditMode ? 'Save Changes' : 'Save'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default CustomerForm;
