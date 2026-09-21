import { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';
import api from '../../services/api';

const ManageBlocks = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    description: '',
    status: 'Active',
    image: ''
  });

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/blocks');
      setBlocks(data.data);
    } catch (error) {
      console.error('Failed to fetch blocks');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (block = null) => {
    if (block) {
      setEditingBlock(block);
      setFormData({
        name: block.name,
        code: block.code,
        location: block.location || '',
        description: block.description || '',
        status: block.status,
        image: block.image || ''
      });
    } else {
      setEditingBlock(null);
      setFormData({
        name: '',
        code: '',
        location: '',
        description: '',
        status: 'Active',
        image: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBlock(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBlock) {
        await api.put(`/blocks/${editingBlock._id}`, formData);
      } else {
        await api.post('/blocks', formData);
      }
      handleCloseModal();
      fetchBlocks();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Warning: Deleting a block will also remove all associated floors and rooms. Continue?')) {
      try {
        await api.delete(`/blocks/${id}`);
        fetchBlocks();
      } catch (error) {
        alert('Failed to delete block');
      }
    }
  };

  const filteredBlocks = blocks.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-display text-gray-900 tracking-tight">Manage Blocks</h2>
          <p className="text-gray-500 mt-1">Institutional infrastructure master directory.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-100"
        >
          <Plus className="w-5 h-5" /> New Infrastructure
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search blocks by code or nomenclature..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
        <div className="flex items-center gap-4 px-6 border-l border-gray-100 hidden md:flex">
          <div className="text-right">
            <p className="text-lg font-black text-gray-900 leading-none">{blocks.length}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Active Blocks</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid of Blocks */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Architectural Audit in Progress...</p>
        </div>
      ) : filteredBlocks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
          <Building2 className="w-20 h-20 text-gray-100 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Zero Blocks Discovered</h3>
          <p className="text-gray-400 text-sm mt-2">Start by registering your institution's first building block.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlocks.map((block) => (
            <div key={block._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:border-blue-100 transition-all">
              <div className="h-40 bg-gray-100 relative overflow-hidden">
                <img
                  src={block.image || "https://images.unsplash.com/photo-1541339907198-e08756c83f2d?auto=format&fit=crop&q=80&w=800"}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  alt={block.name}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-black text-gray-900 uppercase shadow-sm">
                    {block.code}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <button
                    onClick={() => handleOpenModal(block)}
                    className="w-9 h-9 bg-white rounded-xl shadow-lg flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(block._id)}
                    className="w-9 h-9 bg-white rounded-xl shadow-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{block.name}</h3>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-6">
                  <MapPin className="w-3.5 h-3.5" />
                  {block.location || 'Institutional Site'}
                </div>

                <div className="flex items-center gap-4 py-4 border-t border-gray-50">
                  <div className="flex-1">
                    <p className="text-sm font-black text-gray-900 leading-none">08</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Levels</p>
                  </div>
                  <div className="flex-1 border-l border-gray-50 pl-4">
                    <p className="text-sm font-black text-gray-900 leading-none">42</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Workspaces</p>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                    block.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {block.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black font-display text-gray-900">
                  {editingBlock ? 'Refine Infrastructure' : 'New Block Registration'}
                </h3>
                <p className="text-gray-500 text-sm">Configure architectural unit specifications.</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Block Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Administrative Block"
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Block Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="e.g. ADMIN-B1"
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Institutional Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g. North-West Campus, Main Square"
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Usage Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Summarize block purpose and departments..."
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Operational Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold cursor-pointer"
                  >
                    <option value="Active">Active / Operational</option>
                    <option value="Inactive">Inactive / Decommissioned</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Visual Reference (URL)</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-100"
                >
                  {editingBlock ? 'Propagate Changes' : 'Finalize Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBlocks;
