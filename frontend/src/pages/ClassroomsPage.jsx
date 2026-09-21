import { useState, useEffect } from 'react';
import {
  DoorOpen,
  Search,
  Filter,
  Building2,
  Layers,
  Users,
  Wrench,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Plus,
  X,
  Edit,
  Trash2,
  Clock,
  User as UserIcon,
  Contact as ContactIcon,
  Info
} from 'lucide-react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import { getStatusTone } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

const ClassroomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [floors, setFloors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const { userInfo } = useAuth();
  const isAdmin = userInfo?.role === 'admin';
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    roomNumber: '',
    name: '',
    roomType: 'Classroom',
    block: '',
    floor: '',
    department: '',
    capacity: 0,
    facilities: {
      projector: false,
      smartBoard: false,
      computers: false,
      wifi: false,
      airConditioning: false,
      fans: false,
      cctv: false,
      powerBackup: false,
      audioSystem: false,
      labEquipment: false,
    },
    status: 'Available',
    assignedStaff: '',
    workingHours: '',
    purpose: '',
    description: '',
    maintenanceNotes: '',
    contact: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [roomsRes, blocksRes, deptsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/blocks'),
        api.get('/departments')
      ]);
      setRooms(roomsRes.data.data);
      setBlocks(blocksRes.data.data);
      setDepartments(deptsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockChange = async (blockId) => {
    setFormData({ ...formData, block: blockId, floor: '' });
    if (blockId) {
      try {
        const { data } = await api.get(`/floors?blockId=${blockId}`);
        setFloors(data.data);
        if (data.data.length > 0) {
          setFormData(prev => ({ ...prev, block: blockId, floor: data.data[0]._id }));
        }
      } catch (error) {
        console.error('Error fetching floors');
      }
    } else {
      setFloors([]);
    }
  };

  const handleOpenModal = async (room = null) => {
    if (room) {
      setEditingRoom(room);
      const blockId = room.block?._id || room.block;
      try {
        const { data } = await api.get(`/floors?blockId=${blockId}`);
        setFloors(data.data);
      } catch (error) {}

      setFormData({
        roomNumber: room.roomNumber,
        name: room.name,
        roomType: room.roomType,
        block: blockId,
        floor: room.floor?._id || room.floor,
        department: room.department?._id || room.department || '',
        capacity: room.capacity || 0,
        facilities: { ...room.facilities },
        status: room.status,
        assignedStaff: room.assignedStaff || '',
        workingHours: room.workingHours || '',
        purpose: room.purpose || '',
        description: room.description || '',
        maintenanceNotes: room.maintenanceNotes || '',
        contact: room.contact || ''
      });
    } else {
      setEditingRoom(null);
      const defaultBlock = blocks.length > 0 ? blocks[0]._id : '';
      if (defaultBlock) await handleBlockChange(defaultBlock);

      setFormData({
        roomNumber: '',
        name: '',
        roomType: 'Classroom',
        block: defaultBlock,
        floor: '',
        department: departments.length > 0 ? departments[0]._id : '',
        capacity: 40,
        facilities: {
          projector: false,
          smartBoard: false,
          computers: false,
          wifi: true,
          airConditioning: false,
          fans: true,
          cctv: true,
          powerBackup: true,
          audioSystem: false,
          labEquipment: false,
        },
        status: 'Available',
        assignedStaff: '',
        workingHours: '08:00 - 18:00',
        purpose: '',
        description: '',
        maintenanceNotes: '',
        contact: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoom(null);
  };

  const handleFacilityToggle = (key) => {
    setFormData({
      ...formData,
      facilities: {
        ...formData.facilities,
        [key]: !formData.facilities[key]
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom._id}`, formData);
      } else {
        await api.post('/rooms', formData);
      }
      handleCloseModal();
      fetchInitialData();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to decommission this room?')) {
      try {
        await api.delete(`/rooms/${id}`);
        fetchInitialData();
      } catch (error) {
        alert('Failed to delete room');
      }
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || room.roomType === filterType;
    const matchesStatus = filterStatus === 'All' || room.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const roomTypes = ['Classroom', 'Laboratory', 'Computer Lab', 'Seminar Hall', 'Auditorium', 'Faculty Room', 'Staff Room', 'Office', 'Library', 'Workshop', 'Meeting Room', 'Other'];
  const filterRoomTypes = ['All', ...roomTypes];
  const statuses = ['All', 'Available', 'Occupied', 'Under Maintenance', 'Temporarily Closed'];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-400 font-medium">Indexing campus rooms...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display text-gray-900 tracking-tight">Classrooms & Labs</h2>
          <p className="text-gray-500 mt-1">Directory of all academic and professional workspaces.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 bg-[#004d71] hover:bg-[#003d52] text-white px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-blue-100"
          >
            <Plus className="w-5 h-5" /> Add New Workspace
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search room name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl border-none">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer p-0 pr-6"
              >
                {filterRoomTypes.map(t => <option key={t} value={t}>{t} Type</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl border-none">
              <CheckCircle2 className="w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer p-0 pr-6"
              >
                {statuses.map(s => <option key={s} value={s}>{s} Status</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="bg-gray-50 p-6 rounded-full mb-4">
            <DoorOpen className="w-12 h-12 text-gray-200" />
          </div>
          <h4 className="text-xl font-bold text-gray-900">No rooms found</h4>
          <p className="text-gray-400 max-w-xs mt-2 text-sm">Try broadening your search or resetting your filters to find what you're looking for.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room._id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col h-full relative"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                  {room.roomNumber}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusTone(room.status)}`}>
                    {room.status}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(room); }}
                        className="p-1.5 bg-gray-50 hover:bg-blue-50 text-blue-600 rounded-lg border border-gray-100"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(room._id); }}
                        className="p-1.5 bg-gray-50 hover:bg-red-50 text-red-600 rounded-lg border border-gray-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{room.name}</h3>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-6">
                  <div className="flex items-center gap-1.5 uppercase tracking-tighter">
                    <Building2 className="w-3.5 h-3.5" />
                    {room.block?.code || 'Main'}
                  </div>
                  <div className="flex items-center gap-1.5 uppercase tracking-tighter border-l border-gray-100 pl-4">
                    <Layers className="w-3.5 h-3.5" />
                    Floor {room.floor?.floorNumber}
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Category</span>
                    <span className="font-bold text-gray-900 px-2 py-0.5 bg-gray-50 rounded-md text-[10px] uppercase">{room.roomType}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Capacity</span>
                    <span className="font-bold text-gray-900 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      {room.capacity} seats
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Department</span>
                    <span className="font-bold text-gray-700 truncate max-w-[140px]">{room.department?.name || 'Academic Council'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {Object.entries(room.facilities || {}).slice(0, 3).map(([key, value]) => value && (
                    <div key={key} className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400" title={key}>
                      <Wrench className="w-3.5 h-3.5" />
                    </div>
                  ))}
                  {Object.values(room.facilities || {}).filter(Boolean).length > 3 && (
                    <div className="text-[10px] font-black text-gray-300 ml-1">
                      +{Object.values(room.facilities || {}).filter(Boolean).length - 3} MORE
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/rooms/${room._id}`)}
                  className="flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:translate-x-1 transition-transform"
                >
                  Specifications <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Room Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-2xl font-black font-display text-gray-900">
                  {editingRoom ? 'Edit Workspace' : 'Add New Workspace'}
                </h3>
                <p className="text-gray-500 text-sm">Configure workspace technical specifications and metadata.</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-8 custom-scrollbar">
              <div className="grid lg:grid-cols-2 gap-10">
                {/* Details Section */}
                <div className="space-y-8">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-100 pb-2 flex items-center gap-2">
                      <Info className="w-3 h-3" /> Core Nomenclature
                    </h4>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Unit ID / No.</label>
                        <input
                          type="text" required value={formData.roomNumber}
                          onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                          placeholder="e.g. G101"
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Common Name</label>
                        <input
                          type="text" required value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="e.g. Main Reception"
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Category</label>
                        <select
                          value={formData.roomType}
                          onChange={(e) => setFormData({...formData, roomType: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold cursor-pointer"
                        >
                          {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Max Capacity</label>
                        <div className="relative">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input
                            type="number" value={formData.capacity}
                            onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-black"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-100 pb-2 flex items-center gap-2">
                      <Layers className="w-3 h-3" /> Hierarchical Anchor
                    </h4>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Parent Block</label>
                        <select
                          required value={formData.block}
                          onChange={(e) => handleBlockChange(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold cursor-pointer"
                        >
                          <option value="" disabled>Select Block...</option>
                          {blocks.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Level / Floor</label>
                        <select
                          required value={formData.floor}
                          disabled={!formData.block}
                          onChange={(e) => setFormData({...formData, floor: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold cursor-pointer disabled:opacity-50"
                        >
                          <option value="" disabled>{formData.block ? 'Select Floor...' : 'Pick Block First'}</option>
                          {floors.map(f => <option key={f._id} value={f._id}>{f.name} (L{f.floorNumber})</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Controlling Department</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold cursor-pointer"
                      >
                        <option value="">Institution-wide (No Dept)</option>
                        {departments.map(d => <option key={d._id} value={d._id}>{d.name} ({d.code})</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Infrastructure Column */}
                <div className="space-y-8">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-100 pb-2 flex items-center gap-2">
                      <Wrench className="w-3 h-3" /> Built-in Infrastructure
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(formData.facilities).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleFacilityToggle(key)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                            formData.facilities[key]
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-100 text-gray-400'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center ${formData.facilities[key] ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}>
                            {formData.facilities[key] && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-tight">{key.replace(/([A-Z])/g, ' $1')}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-100 pb-2">Status & Technical Notes</h4>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Inventory Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-bold cursor-pointer"
                      >
                        <option value="Available">Available / Free</option>
                        <option value="Occupied">In-Use / Occupied</option>
                        <option value="Under Maintenance">Under Maintenance</option>
                        <option value="Temporarily Closed">Temporarily Closed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-12 pt-8 border-t border-gray-50 flex gap-4">
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
                  {editingRoom ? 'Save Changes' : 'Add New Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomsPage;
