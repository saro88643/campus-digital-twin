import { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Loader2,
  Building2,
  DoorOpen,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  History,
  Info
} from 'lucide-react';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';

const ManageFacilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    status: 'Active',
    availability: '24/7',
    maintenanceDate: '',
    block: '',
    room: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [facilitiesRes, blocksRes, roomsRes] = await Promise.all([
        api.get('/facilities'),
        api.get('/blocks'),
        api.get('/rooms')
      ]);
      setFacilities(facilitiesRes.data.data);
      setBlocks(blocksRes.data.data);
      setRooms(roomsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (facility = null) => {
    if (facility) {
      setEditingFacility(facility);
      setFormData({
        name: facility.name,
        description: facility.description || '',
        location: facility.location || '',
        status: facility.status,
        availability: facility.availability || '24/7',
        maintenanceDate: facility.maintenanceDate ? new Date(facility.maintenanceDate).toISOString().split('T')[0] : '',
        block: facility.block?._id || facility.block || '',
        room: facility.room?._id || facility.room || ''
      });
    } else {
      setEditingFacility(null);
      setFormData({
        name: '',
        description: '',
        location: '',
        status: 'Active',
        availability: '24/7',
        maintenanceDate: new Date().toISOString().split('T')[0],
        block: '',
        room: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFacility(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFacility) {
        await api.put(`/facilities/${editingFacility._id}`, formData);
      } else {
        await api.post('/facilities', formData);
      }
      handleCloseModal();
      fetchInitialData();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this facility from the active institutional inventory?')) {
      try {
        await api.delete(`/facilities/${id}`);
        fetchInitialData();
      } catch (error) {
        alert('Failed to delete facility');
      }
    }
  };

  const filteredFacilities = facilities.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.location && f.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-display text-gray-900 tracking-tight">Institutional Assets</h2>
          <p className="text-gray-500 mt-1">Audit and manage centralized campus utilities and facilities.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-100"
        >
          <Plus className="w-5 h-5" /> Register Asset
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets by name or deployment site..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
        <div className="flex items-center gap-4 px-6 border-l border-gray-100 hidden md:flex">
          <div className="text-right">
            <p className="text-lg font-black text-gray-900 leading-none">{facilities.length}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Logged Assets</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Wrench className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Inventory Audit...</p>
          </div>
        ) : filteredFacilities.length === 0 ? (
          <div className="text-center py-20">
            <Wrench className="w-20 h-20 text-gray-100 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Inventory Empty</h3>
            <p className="text-gray-400 text-sm">Log campus facilities and utilities to track their status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Name</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Deployment site</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Next Maintenance</th>
                  <th className="px-6 py-5 text-right px-10">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredFacilities.map((f) => (
                  <tr key={f._id} className="hover:bg-gray-50/20 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-gray-900">{f.name}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {f.room ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                            <DoorOpen className="w-3.5 h-3.5" /> Room {f.room.roomNumber}
                          </div>
                        ) : f.block ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                            <Building2 className="w-3.5 h-3.5" /> {f.block.name}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                            <MapPin className="w-3.5 h-3.5" /> {f.location || 'Institution Wide'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        f.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
                        f.status === 'Under Maintenance' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                        'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(f.maintenanceDate)}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right px-10">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => handleOpenModal(f)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(f._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Facility Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black font-display text-gray-900">
                  {editingFacility ? 'Edit Asset Profile' : 'Register Institutional Asset'}
                </h3>
                <p className="text-gray-500 text-sm">Configure utility deployment and service logs.</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Asset Nomenclature</label>
                <input
                  type="text" required value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Central Air Conditioner Unit"
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Operational status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Inactive">Decommissioned</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Scheduled Maintenance</label>
                  <input
                    type="date" value={formData.maintenanceDate}
                    onChange={(e) => setFormData({...formData, maintenanceDate: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-100 pb-2">Deployment Location</h4>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Institutional Block</label>
                    <select
                      value={formData.block}
                      onChange={(e) => setFormData({...formData, block: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold cursor-pointer"
                    >
                      <option value="">Campus Wide</option>
                      {blocks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Specific Room</label>
                    <select
                      value={formData.room}
                      onChange={(e) => setFormData({...formData, room: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold cursor-pointer"
                    >
                      <option value="">General Area</option>
                      {rooms.map(r => <option key={r._id} value={r._id}>Room {r.roomNumber}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Precise Position</label>
                  <input
                    type="text" value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g. Roof-top Terrace, South Wing"
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Functionality Note</label>
                <textarea
                  rows="2" value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Note capacity, serial number, or specific purpose..."
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium resize-none"
                ></textarea>
              </div>

              <div className="pt-6 flex gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-100"
                >
                  {editingFacility ? 'Propagate Updates' : 'Authorize Deployment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFacilities;
