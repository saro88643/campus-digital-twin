import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Upload,
  Ruler,
  DoorOpen,
  Plus,
  Trash2,
  CheckCircle,
  Eye,
  Layers,
  MapPin,
  Loader2,
  Info
} from 'lucide-react';
import api from '../../../services/api';

const AdminFloorEditorPage = () => {
  const { floorId } = useParams();
  const navigate = useNavigate();

  const [floor, setFloor] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Floor Plan Calibration
  const [calibration, setCalibration] = useState({
    realWidthMeters: 50,
    realHeightMeters: 30
  });

  // Editor State
  const [elements, setElements] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [doorName, setDoorName] = useState('');
  const [doorX, setDoorX] = useState(400);
  const [doorY, setDoorY] = useState(250);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    fetchFloorData();
  }, [floorId]);

  const fetchFloorData = async () => {
    try {
      setLoading(true);
      const [floorRes, roomsRes, planRes] = await Promise.all([
        api.get(`/floors`),
        api.get(`/rooms`),
        api.get(`/digital-twin/floor-plan/${floorId}`)
      ]);

      const foundFloor = floorRes.data.data.find(f => f._id === floorId);
      setFloor(foundFloor);

      if (foundFloor?.calibration) {
        setCalibration(foundFloor.calibration);
      }
      setIsPublished(!!foundFloor?.isPublished);

      const floorRooms = roomsRes.data.data.filter(
        r => String(r.floor?._id || r.floor) === String(floorId)
      );
      setRooms(floorRooms);

      if (planRes.data?.data?.elements) {
        setElements(planRes.data.data.elements);
      }
    } catch (error) {
      console.error('Error loading floor plan editor data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapSelectedRoom = async () => {
    if (!selectedRoomId) {
      alert('Please select a classroom from the database first.');
      return;
    }

    try {
      const selectedRoom = rooms.find(r => r._id === selectedRoomId);
      const newElem = {
        id: `ELEM_${Date.now()}`,
        elementType: 'room',
        label: `${selectedRoom?.roomNumber} - ${selectedRoom?.name}`,
        roomId: selectedRoomId,
        x: Number(doorX) - 50,
        y: Number(doorY) - 50,
        width: 100,
        height: 80
      };

      setElements([...elements, newElem]);

      // Call API to map room in DB
      await api.post('/digital-twin/map-room', {
        roomId: selectedRoomId,
        geometry: { x: newElem.x, y: newElem.y, width: 100, height: 80 },
        entrance: { x: Number(doorX), y: Number(doorY), doorName: doorName || `${selectedRoom?.roomNumber} Door` }
      });

      alert(`Room ${selectedRoom?.roomNumber} mapped to floor plan coordinates!`);
      fetchFloorData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to map room');
    }
  };

  const handleSaveFloorPlan = async () => {
    try {
      setSaving(true);
      await api.post(`/digital-twin/floor-plan/${floorId}`, {
        elements,
        isPublished,
        calibration
      });
      alert('Floor plan layout and room mappings saved successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save floor plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-500 font-medium text-sm">Loading Digital Twin Floor Editor...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 text-gray-600 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Spatial Geometry Editor</span>
            <h1 className="text-2xl font-black font-display text-gray-900 tracking-tight">
              {floor?.name} — Floor Plan Editor
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPublished(!isPublished)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              isPublished
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-yellow-50 border-yellow-200 text-yellow-700'
            }`}
          >
            {isPublished ? '✓ Published (Live)' : 'Draft Mode'}
          </button>

          <button
            onClick={handleSaveFloorPlan}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#004d71] hover:bg-[#003d52] text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-blue-100 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Sidebar Controls */}
        <div className="space-y-6">

          {/* Scale Calibration Card */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-blue-600" /> Floor Calibration
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Width (Meters)</label>
                <input
                  type="number"
                  value={calibration.realWidthMeters}
                  onChange={(e) => setCalibration({ ...calibration, realWidthMeters: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Height (Meters)</label>
                <input
                  type="number"
                  value={calibration.realHeightMeters}
                  onChange={(e) => setCalibration({ ...calibration, realHeightMeters: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold mt-1"
                />
              </div>
            </div>
          </section>

          {/* Room Mapping Card */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-blue-600" /> Map Room To Floor
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700">Select Database Room</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold mt-1"
                >
                  <option value="">Select Room to Map...</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.roomNumber} - {r.name} {r.digitalTwinMapped ? '✓ (Mapped)' : '(Unmapped)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">X Coord</label>
                  <input
                    type="number"
                    value={doorX}
                    onChange={(e) => setDoorX(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Y Coord</label>
                  <input
                    type="number"
                    value={doorY}
                    onChange={(e) => setDoorY(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Entrance Door Label</label>
                <input
                  type="text"
                  placeholder="e.g. Main Door F105"
                  value={doorName}
                  onChange={(e) => setDoorName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium mt-1"
                />
              </div>

              <button
                type="button"
                onClick={handleMapSelectedRoom}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Map Selected Room
              </button>
            </div>
          </section>

          {/* Mapped Elements List */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
              Placed Objects ({elements.length})
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {elements.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No objects placed on canvas yet.</p>
              ) : (
                elements.map((elem, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl text-xs font-bold">
                    <span className="truncate max-w-[180px]">{elem.label || elem.elementType}</span>
                    <button
                      onClick={() => setElements(elements.filter((_, i) => i !== idx))}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Visual Editor Canvas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs font-bold text-gray-700">
              <span>Interactive Digital Canvas</span>
              <span>Grid Scale: {calibration.realWidthMeters}m x {calibration.realHeightMeters}m</span>
            </div>

            <div className="flex-1 p-6 bg-slate-950 flex items-center justify-center relative overflow-auto">
              <svg viewBox="0 0 800 500" className="w-full max-w-3xl h-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
                {/* Canvas Grid */}
                <defs>
                  <pattern id="editorGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="800" height="500" fill="url(#editorGrid)" />

                {/* Building Bounds */}
                <rect x="40" y="40" width="720" height="420" rx="16" fill="#0f172a" stroke="#334155" strokeWidth="3" />

                {/* Render Placed Elements */}
                {elements.map((elem, idx) => (
                  <g key={idx}>
                    <rect
                      x={elem.x || 100}
                      y={elem.y || 100}
                      width={elem.width || 100}
                      height={elem.height || 80}
                      rx="6"
                      fill="#1e3a8a"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                    <text
                      x={(elem.x || 100) + (elem.width || 100) / 2}
                      y={(elem.y || 100) + (elem.height || 80) / 2}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {elem.label}
                    </text>
                  </g>
                ))}

                {/* Door Marker Preview */}
                <circle cx={doorX} cy={doorY} r="8" fill="#22c55e" stroke="#ffffff" strokeWidth="2" />
                <text x={doorX} y={doorY - 12} fill="#4ade80" fontSize="9" fontWeight="bold" textAnchor="middle">Door ({doorX}, {doorY})</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFloorEditorPage;
