import { useState, useEffect } from 'react';
import {
  Building2,
  Layers,
  DoorOpen,
  MapPin,
  Plus,
  ChevronRight,
  Loader2,
  Boxes,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const BlocksPage = () => {
  const [blocks, setBlocks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const { userInfo } = useAuth();
  const isAdmin = userInfo?.role === 'admin';
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    description: '',
    status: 'Active',
    image: '',
    departments: []
  });

  useEffect(() => {
    fetchBlocks();
    fetchDepartments();
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

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/departments');
      setDepartments(data.data);
    } catch (error) {
      console.error('Failed to fetch departments');
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
        image: block.image || '',
        departments: block.departments?.map(d => d._id || d) || []
      });
    } else {
      setEditingBlock(null);
      setFormData({
        name: '',
        code: '',
        location: '',
        description: '',
        status: 'Active',
        image: '',
        departments: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBlock(null);
  };

  const handleDeptToggle = (deptId) => {
    const next = formData.departments.includes(deptId)
      ? formData.departments.filter(id => id !== deptId)
      : [...formData.departments, deptId];
    setFormData({ ...formData, departments: next });
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-400 font-medium">Loading building directory...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display text-gray-900 tracking-tight">Campus Blocks</h2>
          <p className="text-gray-500 mt-1">Institutional infrastructure and building directory.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-blue-100"
          >
            <Plus className="w-5 h-5" /> Register New Block
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blocks.map((block) => (
          <div key={block._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col h-full">
            <div className="relative h-48 bg-gray-200 overflow-hidden">
              <img
                src={block.image || "https://images.unsplash.com/photo-1541339907198-e08756c83f2d?auto=format&fit=crop&q=80&w=800"}
                alt={block.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-2 inline-block">
                  Block {block.code}
                </span>
                <h3 className="text-xl font-bold text-white leading-tight">{block.name}</h3>
              </div>
              {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(block);
                    }}
                    className="p-2 bg-white/90 backdrop-blur rounded-lg text-blue-600 hover:bg-white"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(block._id);
                    }}
                    className="p-2 bg-white/90 backdrop-blur rounded-lg text-red-600 hover:bg-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-tighter mb-4">
                <MapPin className="w-3.5 h-3.5" />
                {block.location || 'Central Campus'}
              </div>

              <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                {block.description || 'Academic building housing multiple departments and specialized laboratory facilities.'}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-gray-50 rounded-2xl flex flex-col items-center text-center">
                  <span className="text-lg font-black text-gray-900 leading-none">08</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">Floors</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl flex flex-col items-center text-center">
                  <span className="text-lg font-black text-gray-900 leading-none">42</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">Rooms</span>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600 shadow-sm">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">
                    +2
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/blocks/${block._id}`)}
                  className="flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:translate-x-1 transition-transform"
                >
                  Explore <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black font-display text-gray-900">
                  {editingBlock ? 'Edit block' : 'Add block'}
                </h3>
                <p className="text-gray-500 text-sm">Blocks are the top level of the campus twin hierarchy.</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">BLOCK NAME</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">BLOCK CODE</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">DESCRIPTION</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">LOCATION</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">SHARED FACILITIES</label>
                  <input
                    type="text"
                    value={formData.image} // Temporarily using image for shared facilities to match visual, should be fixed in model
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">STATUS</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">DEPARTMENTS</label>
                <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-2xl">
                  {departments.map(dept => (
                    <label key={dept._id} className="flex items-center gap-2 p-2 hover:bg-white rounded-xl cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={formData.departments.includes(dept._id)}
                        onChange={() => handleDeptToggle(dept._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-bold text-gray-700">{dept.name}</span>
                    </label>
                  ))}
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
                  className="flex-[2] py-4 bg-[#004d71] hover:bg-[#003d52] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl"
                >
                  {editingBlock ? 'Save changes' : 'Create block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlocksPage;
