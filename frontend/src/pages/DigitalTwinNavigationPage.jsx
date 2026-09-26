import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Navigation,
  Compass,
  MapPin,
  Clock,
  Footprints,
  Accessibility,
  Layers,
  Building2,
  DoorOpen,
  ChevronRight,
  Loader2,
  QrCode,
  Share2,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import api from '../services/api';

const DigitalTwinNavigationPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [destinationRoom, setDestinationRoom] = useState(null);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // Navigation Parameters
  const [startType, setStartType] = useState('Campus Entrance'); // 'Campus Entrance', 'Building Entrance', 'Custom Room'
  const [startRoomId, setStartRoomId] = useState('');
  const [accessibleOnly, setAccessibleOnly] = useState(false);

  // Path Results
  const [routeData, setRouteData] = useState(null);
  const [activeFloorLevel, setActiveFloorLevel] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, [roomId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [destRes, roomsRes] = await Promise.all([
        api.get(`/rooms/${roomId}`),
        api.get('/rooms')
      ]);

      const dest = destRes.data.data;
      setDestinationRoom(dest);
      setAllRooms(roomsRes.data.data.filter(r => r._id !== roomId));

      if (dest?.floor?.floorNumber !== undefined) {
        setActiveFloorLevel(dest.floor.floorNumber);
      }

      // Calculate path initially
      await handleCalculateRoute(dest, 'Campus Entrance', '', false);
    } catch (error) {
      console.error('Error loading destination room data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateRoute = async (
    targetRoom = destinationRoom,
    sLocType = startType,
    sRoomId = startRoomId,
    accessible = accessibleOnly
  ) => {
    if (!targetRoom) return;
    try {
      setCalculating(true);
      const payload = {
        destinationRoomId: targetRoom._id,
        startType: sLocType,
        startRoomId: sLocType === 'Custom Room' ? sRoomId : undefined,
        accessibleOnly: accessible
      };

      const { data } = await api.post('/navigation/calculate-path', payload);
      setRouteData(data.data);

      if (data.data.pathNodes && data.data.pathNodes.length > 0) {
        const targetFloor = targetRoom?.floor?.floorNumber || 0;
        setActiveFloorLevel(targetFloor);
      }
    } catch (error) {
      console.error('Failed to calculate route', error);
    } finally {
      setCalculating(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-500 font-medium text-sm">Initializing SIET Digital Campus Twin Navigation...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all text-gray-600 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">Digital Twin Engine</span>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">A* Indoor Pathfinding</span>
            </div>
            <h1 className="text-2xl font-black font-display text-gray-900 tracking-tight mt-0.5">
              {destinationRoom?.roomNumber} — {destinationRoom?.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert(`QR Link for ${destinationRoom?.roomNumber}: https://smartnavclass-o2qm.vercel.app/rooms/${destinationRoom?._id}`)}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-700 shadow-sm transition-all"
          >
            <QrCode className="w-4 h-4 text-blue-600" /> Room QR Code
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Navigate to ${destinationRoom?.roomNumber}`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Navigation link copied to clipboard!');
              }
            }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-blue-200 transition-all"
          >
            <Share2 className="w-4 h-4" /> Share Route
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left Column: Navigation Setup & Turn-By-Turn Instructions */}
        <div className="space-y-6">

          {/* Controls Card */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" /> Navigation Origin
            </h2>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700 block">Select Starting Point</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Campus Entrance', label: 'Main Campus Gate' },
                  { id: 'Building Entrance', label: 'Block Entrance' },
                  { id: 'Custom Room', label: 'Select Room' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setStartType(opt.id);
                      handleCalculateRoute(destinationRoom, opt.id, startRoomId, accessibleOnly);
                    }}
                    className={`p-3 rounded-2xl text-xs font-bold text-left transition-all border ${
                      startType === opt.id
                      ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-100'
                      : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {startType === 'Custom Room' && (
                <div className="pt-2">
                  <select
                    value={startRoomId}
                    onChange={(e) => {
                      setStartRoomId(e.target.value);
                      handleCalculateRoute(destinationRoom, 'Custom Room', e.target.value, accessibleOnly);
                    }}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select Starting Classroom...</option>
                    {allRooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.roomNumber} - {r.name} ({r.block?.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Accessibility Toggle */}
            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Accessibility className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs font-bold text-gray-800">Accessible Route</p>
                  <p className="text-[10px] text-gray-400 font-medium">Avoid stairs, prefer elevators/ramps</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextVal = !accessibleOnly;
                  setAccessibleOnly(nextVal);
                  handleCalculateRoute(destinationRoom, startType, startRoomId, nextVal);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${accessibleOnly ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${accessibleOnly ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </section>

          {/* Route Summary Card */}
          {routeData && (
            <section className="bg-gradient-to-br from-blue-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">Route Metrics</span>
                <span className="bg-green-500/20 text-green-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-green-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Optimal A* Path
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-blue-300 text-xs font-bold mb-1">
                    <Footprints className="w-4 h-4" /> Distance
                  </div>
                  <p className="text-2xl font-black font-display">{routeData.totalDistanceMeters} <span className="text-xs font-medium text-gray-300">meters</span></p>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-blue-300 text-xs font-bold mb-1">
                    <Clock className="w-4 h-4" /> Walk Time
                  </div>
                  <p className="text-2xl font-black font-display">{routeData.walkingTimeText || '1 min'}</p>
                </div>
              </div>
            </section>
          )}

          {/* Turn-By-Turn Instructions */}
          {routeData?.directions && (
            <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600" /> Turn-By-Turn Instructions
              </h3>

              <div className="space-y-3">
                {routeData.directions.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50/70 border border-gray-100">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-xs font-bold text-gray-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Visual Floor Plan & Path Overlay */}
        <div className="lg:col-span-2 space-y-6">

          {/* Floor Selector Tabs */}
          <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3">Floor Level:</span>
            {[0, 1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setActiveFloorLevel(num)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  activeFloorLevel === num
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Level {num} {num === destinationRoom?.floor?.floorNumber && '(Target)'}
              </button>
            ))}
          </div>

          {/* Interactive Digital Twin Visual Canvas */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden min-h-[520px] relative flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-gray-800">
                  {destinationRoom?.block?.name} — Floor Level {activeFloorLevel} Plan
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-green-100 text-green-700 rounded-lg">
                Interactive Digital Twin
              </span>
            </div>

            {/* SVG Interactive Floor Plan Drawing */}
            <div className="flex-1 p-6 relative flex items-center justify-center bg-slate-950 overflow-auto">
              <svg viewBox="0 0 800 500" className="w-full max-w-3xl h-auto rounded-2xl shadow-2xl border border-slate-800 bg-slate-900">
                {/* Grid Background Lines */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
                  </pattern>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                  </marker>
                </defs>
                <rect width="800" height="500" fill="url(#grid)" />

                {/* Building Outer Bounds */}
                <rect x="40" y="40" width="720" height="420" rx="16" fill="#0f172a" stroke="#334155" strokeWidth="3" />

                {/* Corridor System */}
                <rect x="80" y="220" width="640" height="60" fill="#1e293b" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />
                <text x="400" y="255" fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="2">MAIN WALKWAY CORRIDOR</text>

                {/* Rooms Grid Layout */}
                {/* Room Left: G101 / Reception */}
                <g>
                  <rect x="80" y="80" width="160" height="120" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                  <text x="160" y="135" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">Reception / Office</text>
                  <text x="160" y="155" fill="#64748b" fontSize="10" textAnchor="middle">G101</text>
                </g>

                {/* Room Center: F101 */}
                <g>
                  <rect x="280" y="80" width="180" height="120" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                  <text x="370" y="135" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">Lecture Hall A</text>
                  <text x="370" y="155" fill="#64748b" fontSize="10" textAnchor="middle">F101</text>
                </g>

                {/* Room Target: F105 (Highlighted if target) */}
                <g>
                  <rect
                    x="500" y="80" width="220" height="120" rx="8"
                    fill={destinationRoom?.roomNumber === 'F105' ? '#1e3a8a' : '#1e293b'}
                    stroke={destinationRoom?.roomNumber === 'F105' ? '#3b82f6' : '#475569'}
                    strokeWidth="3"
                    className={destinationRoom?.roomNumber === 'F105' ? 'animate-pulse' : ''}
                  />
                  <text x="610" y="130" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                    {destinationRoom?.name || 'Programming Lab'}
                  </text>
                  <text x="610" y="150" fill="#60a5fa" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {destinationRoom?.roomNumber || 'F105'} (Target)
                  </text>

                  {/* Room Door Entrance */}
                  <rect x="580" y="195" width="40" height="10" fill="#3b82f6" rx="2" />
                  <text x="600" y="215" fill="#93c5fd" fontSize="9" textAnchor="middle">Door Entrance</text>
                </g>

                {/* Stairs / Elevator Area */}
                <g>
                  <rect x="80" y="310" width="140" height="120" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                  <text x="150" y="365" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle">Stairwell A / Lift</text>
                  <text x="150" y="385" fill="#d97706" fontSize="10" textAnchor="middle">Floor Transition</text>
                </g>

                {/* A* PATH OVERLAY LINE */}
                <path
                  d="M 150 350 L 150 250 L 600 250 L 600 195"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="5"
                  strokeDasharray="8 4"
                  markerEnd="url(#arrow)"
                />

                {/* Path Animation Markers */}
                <circle cx="150" cy="350" r="8" fill="#22c55e" stroke="#ffffff" strokeWidth="2" />
                <text x="150" y="380" fill="#4ade80" fontSize="10" fontWeight="bold" textAnchor="middle">START</text>

                <circle cx="150" cy="250" r="6" fill="#3b82f6" />
                <circle cx="350" cy="250" r="6" fill="#3b82f6" />

                <circle cx="600" cy="195" r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                <text x="600" y="175" fill="#f87171" fontSize="10" fontWeight="bold" textAnchor="middle">DESTINATION</text>
              </svg>
            </div>

            {/* Bottom Status Ribbon */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 text-slate-400 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                <span>Follow the blue dashed line through the corridor to reach room entrance door.</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">SIET Digital Twin Spatial Model</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalTwinNavigationPage;
