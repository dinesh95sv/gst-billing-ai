
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Camera, Briefcase, MapPin, Smartphone, Landmark, Edit3, Trash2, CheckCircle2, RotateCcw, UploadCloud, Power } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Factory } from '../types';

const FactoryForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<Partial<Factory>>({
    name: '',
    gstin: '',
    location: '',
    phone: '',
    pincode: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    isActive: true,
    logo: '',
    signature: ''
  });

  useEffect(() => {
    // Load sequence:
    // 1. Check if there's a draft (user coming back from signature pad or interrupted)
    const draft = localStorage.getItem('temp_factory_draft');
    let currentData = formData;

    if (draft) {
      currentData = JSON.parse(draft);
      setFormData(currentData);
      localStorage.removeItem('temp_factory_draft');
    } else if (isEditMode && id) {
      // 2. If no draft and edit mode, load from permanent storage
      const existing = StorageService.getFactoryById(id);
      if (existing) {
        currentData = existing;
        setFormData(existing);
      }
    }

    // 3. Check if we just came back with a new signature
    const savedSignature = localStorage.getItem('temp_signature');
    if (savedSignature) {
      setFormData(prev => ({ ...prev, signature: savedSignature }));
      localStorage.removeItem('temp_signature');
    }
  }, [id, isEditMode]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGoToSignature = () => {
    // Save current form state before navigating away
    localStorage.setItem('temp_factory_draft', JSON.stringify(formData));
    navigate('/draw-signature');
  };

  const handleSave = () => {
    if (!formData.name || !formData.gstin) {
      alert("Please enter Business Name and GSTIN.");
      return;
    }

    const factoryData: Factory = {
      id: formData.id || Date.now().toString(),
      name: formData.name || '',
      gstin: formData.gstin || '',
      location: formData.location || '',
      phone: formData.phone || '',
      pincode: formData.pincode || '',
      bankName: formData.bankName || '',
      accountNumber: formData.accountNumber || '',
      ifscCode: formData.ifscCode || '',
      logo: formData.logo,
      signature: formData.signature,
      isActive: formData.isActive ?? true
    };

    StorageService.saveFactory(factoryData);
    localStorage.removeItem('temp_factory_draft'); // Clear draft on successful save
    navigate('/factories');
  };

  const sectionHeader = (icon: React.ReactNode, label: string) => (
    <div className="flex items-center space-x-3 text-[11px] font-black text-blue-500 uppercase tracking-[0.15em] mb-4 mt-8">
      {icon}
      <span>{label}</span>
    </div>
  );

  const inputClass = "w-full bg-[#1b232e] border border-gray-800 rounded-2xl py-4 px-5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-gray-600";
  const labelClass = "text-xs font-bold text-gray-500 mb-2 block ml-1";

  return (
    <div className="flex flex-col min-h-screen bg-[#0c0f14] animate-in slide-in-from-right duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sticky top-0 bg-[#0c0f14] z-20">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-800">
          <ChevronLeft size={28} className="text-white" />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-white">Factory Details</h2>
        <button onClick={handleSave} className="text-blue-500 font-bold text-lg hover:underline transition-all">Save</button>
      </header>

      <div className="px-6 pb-48 flex-1 overflow-y-auto no-scrollbar">
        {/* Status Toggle */}
        <div className="bg-[#151c27] p-4 rounded-2xl border border-gray-800/50 flex items-center justify-between mb-2 mt-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${formData.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-500'}`}>
              <Power size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide">Factory Status</p>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${formData.isActive ? 'text-emerald-500' : 'text-gray-500'}`}>
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

        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <label className="relative cursor-pointer group">
            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
            <div className="w-24 h-24 rounded-3xl border-2 border-dashed border-gray-800 flex items-center justify-center bg-[#151c27] transition-all group-hover:border-blue-500 group-hover:bg-[#1b232e] overflow-hidden">
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Camera size={32} className="text-gray-600 group-hover:text-blue-500" />
              )}
            </div>
          </label>
          <div className="text-center">
            <h3 className="text-lg font-bold text-white">Upload Business Logo</h3>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mt-1">Maximum size 2MB (PNG, JPG)</p>
          </div>
        </div>

        {/* Business Identity */}
        {sectionHeader(<Briefcase size={16} />, "Business Identity")}
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Business Name</label>
            <input 
              placeholder="Acme Factory Solutions" 
              className={inputClass}
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="relative">
            <label className={labelClass}>GSTIN</label>
            <input 
              placeholder="27AAACA0000A1Z5" 
              className={inputClass}
              value={formData.gstin}
              onChange={e => setFormData(prev => ({ ...prev, gstin: e.target.value }))}
            />
            {formData.gstin && formData.gstin.length >= 15 && (
              <span className="absolute right-4 bottom-4 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md">Verified</span>
            )}
          </div>
        </div>

        {/* Contact & Address */}
        {sectionHeader(<MapPin size={16} />, "Contact & Address")}
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Full Address</label>
            <textarea 
              rows={3}
              placeholder="Industrial Area Phase II, Plot No. 45, Near Metro Pillar 120, Mumbai, Maharashtra" 
              className={`${inputClass} resize-none py-4 leading-relaxed`}
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone</label>
              <input 
                placeholder="+91 22 4500 9000" 
                className={inputClass}
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>Pincode</label>
              <input 
                placeholder="400013" 
                className={inputClass}
                value={formData.pincode}
                onChange={e => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        {sectionHeader(<Landmark size={16} />, "Settlement Bank Details")}
        <p className="text-[10px] text-gray-600 font-medium -mt-2 mb-6 ml-1">These details will be printed on generated invoices for payments.</p>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Bank Name</label>
            <input 
              placeholder="HDFC Bank" 
              className={inputClass}
              value={formData.bankName}
              onChange={e => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass}>Account Number</label>
            <input 
              placeholder="50200012345678" 
              className={inputClass}
              value={formData.accountNumber}
              onChange={e => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass}>IFSC Code</label>
            <input 
              placeholder="HDFC0000012" 
              className={inputClass}
              value={formData.ifscCode}
              onChange={e => setFormData(prev => ({ ...prev, ifscCode: e.target.value }))}
            />
          </div>
        </div>

        {/* Signature Section */}
        {sectionHeader(<Edit3 size={16} />, "Authorized Signature")}
        <p className="text-[10px] text-gray-600 font-medium -mt-2 mb-6 ml-1">This signature will be automatically applied to all future invoices.</p>
        
        <div className="bg-[#151c27] rounded-[2rem] border border-gray-800 p-8 relative flex flex-col items-center">
          <div className="w-full h-40 bg-[#fdf2f0] rounded-2xl flex items-center justify-center overflow-hidden border border-gray-200/50 shadow-inner group">
            {formData.signature ? (
              <img src={formData.signature} alt="Signature" className="max-w-[80%] max-h-[80%] object-contain" />
            ) : (
              <div className="flex flex-col items-center text-rose-300 opacity-20">
                <Edit3 size={48} />
                <p className="text-xs font-bold mt-2">NO SIGNATURE FOUND</p>
              </div>
            )}
          </div>
          
          {formData.signature && (
            <div className="absolute top-4 right-4 bg-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg">Currently Active</div>
          )}

          <div className="grid grid-cols-2 gap-3 w-full mt-8">
            <label className="flex items-center justify-center space-x-2 py-3 bg-[#1b232e] border border-gray-800 rounded-xl text-xs font-bold text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer">
              <UploadCloud size={16} />
              <span>Upload Image</span>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData(prev => ({ ...prev, signature: reader.result as string }));
                  };
                  reader.readAsDataURL(file);
                }
              }} />
            </label>
            <button 
              onClick={handleGoToSignature}
              className="flex items-center justify-center space-x-2 py-3 bg-[#1b232e] border border-gray-800 rounded-xl text-xs font-bold text-gray-300 hover:bg-gray-800 transition-colors"
            >
              <RotateCcw size={16} />
              <span>Draw New</span>
            </button>
          </div>

          {formData.signature && (
            <button 
              onClick={() => setFormData(prev => ({ ...prev, signature: '' }))}
              className="w-full mt-3 flex items-center justify-center space-x-2 py-4 bg-rose-500/10 rounded-2xl text-rose-500 font-bold text-xs uppercase tracking-[0.15em] hover:bg-rose-500/20 transition-all active:scale-[0.98]"
            >
              <Trash2 size={16} />
              <span>Remove Current Signature</span>
            </button>
          )}
        </div>
        
        <p className="text-[10px] text-gray-600 font-medium italic text-center mt-6">Ensure the signature matches official records for GST compliance.</p>

        {/* Final Save Button */}
        <button 
          onClick={handleSave}
          className="w-full bg-[#3b82f6] py-5 rounded-2xl mt-12 mb-10 flex items-center justify-center space-x-3 text-white font-black shadow-2xl shadow-blue-500/40 active:scale-[0.98] transition-all"
        >
          <CheckCircle2 size={24} />
          <span className="text-lg">Save Business Profile</span>
        </button>
        
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] text-center mb-10">Verified Profile • Tax Compliant</p>
      </div>
    </div>
  );
};

export default FactoryForm;
