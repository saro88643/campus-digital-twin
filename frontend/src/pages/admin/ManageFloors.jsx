import { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Loader2,
  Building2,
  ChevronRight,
  Filter
} from 'lucide-react';
import api from '../../services/api';

const ManageFloors = () => {
  const [floors, setFloors] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [selectedBlockFilter, setSelectedBlockFilter] = useState('All');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    floorNumber: 0,
    block: '',
    description: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [floorsRes, blocksRes] = await Promise.all([
        api.get('/floors'),
        api.get('/blocks')
      ]);
      setFloors(floorsRes.data.data);
      setBlocks(blocksRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (floor = null) => {
    if (floor) {
      setEditingFloor(floor);
      setFormData({
        name: floor.name,
        floorNumber: floor.floorNumber,
        block: floor.block?._id || floor.block,
        description: floor.description || '',
        status: floor.status
      });
    } else {
      setEditingFloor(null);
      setFormData({
        name: '',
        floorNumber: 0,
        block: blocks.length > 0 ? blocks[0]._id : '',
        description: '',
        status: 'Active'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFloor(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFloor) {
        await api.put(`/floors/${editingFloor._id}`, formData);
      } else {
        await api.post('/floors', formData);
      }
      handleCloseModal();
      fetchInitialData();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deleting this floor will remove all associated rooms. Continue?')) {
      try {
        await api.delete(`/floors/${id}`);
        fetchInitialData();
      } catch (error) {
        alert('Failed to delete floor');
      }
    }
  };

  const filteredFloors = floors.filter(f =>
    selectedBlockFilter === 'All' || (f.block?._id === selectedBlockFilter || f.block === selectedBlockFilter)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-display text-gray-900 tracking-tight">Level Management</h2>
          <p className="text-gray-500 mt-1">Configure vertical institutional space hierarchy.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-100"
        >
          <Plus className="w-5 h-5" /> New Floor Level
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-2xl w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter by Block:</span>
          <select
            value={selectedBlockFilter}
            onChange={(e) => setSelectedBlockFilter(e.target.value)}
            className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer p-0 pr-6"
          >
            <option value="All">All Infrastructures</option>
            {blocks.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
          </select>
        </div>
        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest hidden md:block">
          Showing {filteredFloors.length} Levels
        </div>
      </div>

      {/* Grid of Floors */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Architectural Audit...</p>
        </div>
      ) : filteredFloors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
          <Layers className="w-20 h-20 text-gray-100 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No Floors Defined</h3>
          <p className="text-gray-400 text-sm mt-2">Select an infrastructure block to begin defining its levels.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFloors.map((floor) => (
            <div key={floor._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group hover:border-blue-100 transition-all flex flex-col justify-between h-48">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-blue-600 font-black shadow-inner">
                    {floor.floorNumber}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => handleOpenModal(floor)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(floor._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 truncate">{floor.name}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter flex items-center gap-1 mt-1">
                  <Building2 className="w-3 h-3" /> {floor.block?.name || 'Unknown Block'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                  floor.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {floor.status}
                </span>
                <button className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 hover:underline">
                  Manage Rooms <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black font-display text-gray-900">
                  {editingFloor ? 'Update Level' : 'Define New Level'}
                </h3>
                <p className="text-gray-500 text-sm">Configure floor sequence and nomenclature.</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Infrastructure Block</label>
                <select
                  required
                  value={formData.block}
                  onChange={(e) => setFormData({...formData, block: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold cursor-pointer"
                >
                  <option value="" disabled>Select parent structure...</option>
                  {blocks.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Floor Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Ground Floor"
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Ordinal Number</label>
                  <input
                    type="number"
                    required
                    value={formData.floorNumber}
                    onChange={(e) => setFormData({...formData, floorNumber: parseInt(e.target.value)})}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Area Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Note specific features of this level..."
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium resize-none"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                  {editingFloor ? 'Apply Updates' : 'Confirm Level'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFloors;
