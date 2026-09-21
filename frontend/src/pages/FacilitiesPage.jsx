import { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Calendar,
  Building2,
  DoorOpen,
  Plus,
  Loader2,
  X,
  Edit,
  Trash2,
  Info
} from 'lucide-react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import { getStatusTone, formatDate } from '../utils/formatters';

const FacilitiesPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);

  const { userInfo } = useAuth();
  const isAdmin = userInfo?.role === 'admin';

  // Form state
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-400 font-medium">Scanning inventory and facilities...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display text-gray-900 tracking-tight">Facilities & Inventory</h2>
          <p className="text-gray-500 mt-1">Real-time status tracking of institutional assets and shared services.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 bg-[#004d71] hover:bg-[#003d52] text-white px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-blue-100"
          >
            <Plus className="w-5 h-5" /> Register Asset
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by facility name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                <Wrench className="w-4 h-4" />
              </div>
            ))}
          </div>
          <div className="pl-4 border-l border-gray-100 hidden sm:block">
            <p className="text-xs font-black text-gray-900 leading-none">{facilities.length}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Total Assets</p>
          </div>
        </div>
      </div>

      {filteredFacilities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="bg-gray-50 p-6 rounded-full mb-4">
            <AlertTriangle className="w-12 h-12 text-gray-200" />
          </div>
          <h4 className="text-xl font-bold text-gray-900">Inventory Empty</h4>
          <p className="text-gray-400 max-w-xs mt-2 text-sm">No assets match your search criteria. Check your spelling or try another keyword.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFacilities.map((facility) => (
            <div
              key={facility._id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-xl hover:border-blue-100 transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Wrench className="w-6 h-6" />
                </div>
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusTone(facility.status)}`}>
                  {facility.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{facility.name}</h3>
              <p className="text-sm text-gray-500 mb-6 line-clamp-2">{facility.description || 'Institutional utility critical for daily campus operations and specialized academic requirements.'}</p>

              <div className="space-y-3 pt-6 border-t border-gray-50">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 truncate">
                    {facility.room ? `Room ${facility.room.roomNumber}` : (facility.block ? facility.block.name : (facility.location || 'Campus-wide'))}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Service: <span className="font-bold text-gray-900">{formatDate(facility.maintenanceDate)}</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <History className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Available: <span className="font-bold text-gray-900">{facility.availability || '24/7'}</span></span>
                </div>
              </div>

              <div className="mt-8 flex gap-2">
                <button
                  onClick={() => handleOpenModal(facility)}
                  className="flex-1 py-2.5 bg-gray-50 hover:bg-[#004d71] hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Edit Asset
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(facility._id)}
                    className="w-11 h-11 flex items-center justify-center bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
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
                  className="flex-[2] py-4 bg-[#004d71] hover:bg-[#003d52] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-100"
                >
                  {editingFacility ? 'Save Changes' : 'Authorize Deployment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilitiesPage;
