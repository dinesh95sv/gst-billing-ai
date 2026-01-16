
import React, { useState, useEffect } from 'react';
import { Search, Plus, UserCircle, MoreVertical, Factory as FactoryIcon, CreditCard, MapPin, ChevronLeft, Trash2, AlertTriangle, Power, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Factory } from '../types';

const Factories: React.FC = () => {
  const navigate = useNavigate();
  const [factories, setFactories] = useState<Factory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [factoryToDelete, setFactoryToDelete] = useState<Factory | null>(null);
  const [menuOpenFactoryId, setMenuOpenFactoryId] = useState<string | null>(null);

  useEffect(() => {
    setFactories(StorageService.getFactories());
  }, []);

  const filteredFactories = factories.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.gstin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (factoryToDelete) {
      StorageService.deleteFactory(factoryToDelete.id);
      setFactories(StorageService.getFactories());
      setFactoryToDelete(null);
    }
  };

  const toggleStatus = (factory: Factory) => {
    const updatedFactory = { ...factory, isActive: !factory.isActive };
    StorageService.saveFactory(updatedFactory);
    setFactories(StorageService.getFactories());
    setMenuOpenFactoryId(null);
  };

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-300 relative">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sticky top-0 bg-[#0c0f14] z-20">
        <button onClick={() => navigate('/')} className="p-1 rounded-full hover:bg-gray-800 text-white">
          <ChevronLeft size={28} />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-white">Factories</h2>
        <button className="p-1 rounded-full hover:bg-gray-800 text-gray-300">
          <UserCircle size={28} />
        </button>
      </header>

      {/* Search Bar */}
      <div className="px-6 mt-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            placeholder="Search by name or GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#151c27] border border-gray-800/50 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-gray-600"
          />
        </div>
      </div>

      {/* Factories List */}
      <div className="px-6 space-y-6 mt-8 pb-40">
        {filteredFactories.length > 0 ? (
          filteredFactories.map((factory) => (
            <div 
              key={factory.id} 
              onClick={() => navigate(`/edit-factory/${factory.id}`)}
              className="bg-[#151c27] rounded-[1.5rem] p-6 border border-gray-800/10 hover:border-gray-800/40 transition-all shadow-sm cursor-pointer group relative"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6]">
                    {factory.logo ? (
                      <img src={factory.logo} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <FactoryIcon size={28} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{factory.name}</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                      {factory.unitType || 'Unit 1'}
                    </p>
                  </div>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenFactoryId(menuOpenFactoryId === factory.id ? null : factory.id);
                    }}
                    className={`p-1 rounded-lg transition-colors ${menuOpenFactoryId === factory.id ? 'bg-gray-800 text-white' : 'text-gray-600 hover:text-gray-400'}`}
                  >
                    <MoreVertical size={22} />
                  </button>

                  {menuOpenFactoryId === factory.id && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setMenuOpenFactoryId(null); }}></div>
                      <div className="absolute right-0 top-8 w-48 bg-[#1a222e] border border-gray-800 rounded-2xl shadow-2xl z-40 p-2 animate-in fade-in zoom-in-95 duration-150">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStatus(factory);
                          }} 
                          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-800"
                        >
                          <Power size={16} className={factory.isActive ? "text-amber-500" : "text-emerald-500"} />
                          <span>Mark as {factory.isActive ? 'Inactive' : 'Active'}</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setFactoryToDelete(factory);
                            setMenuOpenFactoryId(null);
                          }} 
                          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10"
                        >
                          <Trash2 size={16} />
                          <span>Delete Factory</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <CreditCard size={18} className="text-gray-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-0.5">GSTIN</p>
                    <p className="text-sm font-semibold text-gray-300 tracking-wide">{factory.gstin}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin size={18} className="text-gray-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-0.5">LOCATION</p>
                    <p className="text-sm font-semibold text-gray-400 leading-relaxed truncate max-w-[200px]">{factory.location}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-800/30">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${factory.isActive ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                  <span className={`text-sm font-bold ${factory.isActive ? 'text-emerald-500' : 'text-gray-500'}`}>{factory.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setFactoryToDelete(factory);
                  }}
                  className="p-3 bg-rose-500/10 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center">
            <FactoryIcon size={48} className="mb-4" />
            <p className="text-sm font-bold">No factories registered yet.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {factoryToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-[#000000bb] backdrop-blur-sm" onClick={() => setFactoryToDelete(null)}></div>
          <div className="bg-[#1a222e] w-full max-w-sm rounded-[2rem] p-8 relative z-10 border border-gray-800 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Factory?</h3>
              <p className="text-gray-400 text-sm">Are you sure you want to remove this factory? This action cannot be undone.</p>
            </div>

            <div className="bg-[#0c0f14] p-5 rounded-2xl mb-8 space-y-3">
              <div className="flex justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Name</span>
                <span className="text-sm font-bold text-white text-right ml-4">{factoryToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">GSTIN</span>
                <span className="text-sm font-bold text-blue-500">{factoryToDelete.gstin}</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button 
                onClick={() => setFactoryToDelete(null)}
                className="flex-1 py-4 rounded-2xl bg-gray-800 text-gray-400 font-bold hover:bg-gray-800 transition-colors"
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

      {/* Floating Action Button */}
      <button 
        className="fixed bottom-28 right-8 w-16 h-16 bg-[#3b82f6] rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-500/50 active:scale-90 transition-transform z-30"
        onClick={() => navigate('/add-factory')}
      >
        <Plus size={32} strokeWidth={3} />
      </button>
    </div>
  );
};

export default Factories;
