import { useState, useEffect } from 'react';
import {
  DoorOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Loader2,
  Building2,
  Layers,
  Boxes,
  Users,
  CheckCircle2,
  Filter,
  Wrench,
  Clock,
  User as UserIcon,
  Contact as ContactIcon,
  Info
} from 'lucide-react';
import api from '../../services/api';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [floors, setFloors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filters
  const [blockFilter, setBlockFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

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
      // Fetch floors for the specific block of the room being edited
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
        floor: '', // Set by handleBlockChange
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

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBlock = blockFilter === 'All' || (r.block?._id === blockFilter || r.block === blockFilter);
    const matchesType = typeFilter === 'All' || r.roomType === typeFilter;
    return matchesSearch && matchesBlock && matchesType;
  });

  const roomTypes = ['Classroom', 'Laboratory', 'Computer Lab', 'Seminar Hall', 'Auditorium', 'Faculty Room', 'Staff Room', 'Office', 'Library', 'Workshop', 'Meeting Room', 'Other'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black font-display text-gray-900 tracking-tight">Workspace Management</h2>
          <p className="text-gray-500 mt-1">Configure individual academic and operational units.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-100"
        >
          <Plus className="w-5 h-5" /> New Unit Entry
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by Unit nomenclature or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl">
              <Building2 className="w-4 h-4 text-gray-400" />
              <select
                value={blockFilter}
                onChange={(e) => setBlockFilter(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer p-0 pr-6"
              >
                <option value="All">All Blocks</option>
                {blocks.map(b => <option key={b._id} value={b._id}>{b.code}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl">
              <DoorOpen className="w-4 h-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer p-0 pr-6"
              >
                <option value="All">All Types</option>
                {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Inventory Synchronization...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20">
            <DoorOpen className="w-20 h-20 text-gray-100 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Zero Results</h3>
            <p className="text-gray-400 text-sm mt-2">Adjust your institutional filters or add a new workspace unit.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit / ID</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Architecture</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Specifications</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Controlling Dept</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right px-10">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRooms.map((room) => (
                  <tr key={room._id} className="hover:bg-gray-50/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-blue-600 font-black text-xs shadow-sm">
                          {room.roomNumber}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{room.name}</p>
                          <span className="text-[9px] font-black text-gray-400 uppercase bg-gray-50 px-1.5 py-0.5 rounded">{room.roomType}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-blue-400" /> {room.block?.name}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase pl-[18px]">
                          {room.floor?.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-gray-300" />
                          <span className="text-xs font-black text-gray-700">{room.capacity}</span>
                        </div>
                        <div className="flex items-center gap-1.5 border-l border-gray-100 pl-3">
                          <Wrench className="w-3.5 h-3.5 text-gray-300" />
                          <span className="text-xs font-black text-gray-700">
                            {Object.values(room.facilities || {}).filter(Boolean).length}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2 py-1 rounded-lg w-fit">
                        {room.department?.code || 'ADMIN'}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right px-10">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(room)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(room._id)}
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

      {/* Unit Config Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-2xl font-black font-display text-gray-900">
                  {editingRoom ? 'Update Unit Dossier' : 'New Unit Deployment'}
                </h3>
                <p className="text-gray-500 text-sm">Configure workspace technical specifications and metadata.</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-8">
              <div className="grid lg:grid-cols-2 gap-10">
                {/* Basic Details Section */}
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
                        {departments.map(d => <option key={dept._id} value={d._id}>{d.name} ({d.code})</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-100 pb-2 flex items-center gap-2">
                      <ContactIcon className="w-3 h-3" /> Responsibility & Ops
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Assigned Personnel</label>
                        <input
                          type="text" value={formData.assignedStaff}
                          onChange={(e) => setFormData({...formData, assignedStaff: e.target.value})}
                          placeholder="e.g. Prof. J. Doe"
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Operating Hours</label>
                        <input
                          type="text" value={formData.workingHours}
                          onChange={(e) => setFormData({...formData, workingHours: e.target.value})}
                          placeholder="08:00 - 18:00"
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Infrastructure checklist Column */}
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
                            : 'bg-white border-gray-50 text-gray-400'
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
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Maintenance Log Summary</label>
                      <textarea
                        rows="2" value={formData.maintenanceNotes}
                        onChange={(e) => setFormData({...formData, maintenanceNotes: e.target.value})}
                        placeholder="Detail recent repairs or pending issues..."
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium resize-none"
                      ></textarea>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Internal Description</label>
                      <textarea
                        rows="3" value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Architectural features, furniture config, etc..."
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium resize-none"
                      ></textarea>
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
                  className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-100"
                >
                  {editingRoom ? 'Commit Updates' : 'Authorize Unit Deployment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;
