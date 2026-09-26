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
  const [startType, setStartType] = useState('Campus Entrance');
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

  // Helper to get room location coordinates for path line drawing
  const getRoomCenterPos = (roomNum) => {
    const num = roomNum?.toUpperCase() || '';
    if (num === 'LH01') return { x: 150, y: 380 };
    if (num === 'LH02') return { x: 120, y: 110 };
    if (num === 'LH03') return { x: 240, y: 110 };
    if (num === 'LH04') return { x: 560, y: 110 };
    if (num === 'LH05') return { x: 680, y: 110 };
    if (num === 'LH06') return { x: 650, y: 380 };

    if (num === 'LH07') return { x: 150, y: 380 };
    if (num === 'LH08') return { x: 120, y: 110 };
    if (num === 'LH09') return { x: 240, y: 110 };
    if (num === 'LH10') return { x: 560, y: 110 };
    if (num === 'LH11') return { x: 680, y: 110 };
    if (num === 'LH12') return { x: 650, y: 380 };

    if (num === 'LH13') return { x: 150, y: 380 };
    if (num === 'LH14') return { x: 120, y: 110 };
    if (num === 'SH01' || num.includes('SEMINAR')) return { x: 400, y: 110 };
    if (num === 'LH15') return { x: 680, y: 110 };
    if (num === 'LH16') return { x: 650, y: 380 };

    if (num === 'LH17') return { x: 145, y: 380 };
    if (num === 'LH18') return { x: 120, y: 110 };
    if (num === 'LH19') return { x: 235, y: 110 };
    if (num === 'LH20') return { x: 335, y: 110 };
    if (num === 'LH21') return { x: 435, y: 110 };
    if (num === 'LH22') return { x: 670, y: 110 };
    if (num === 'LH23A') return { x: 280, y: 380 };
    if (num === 'LH23B') return { x: 390, y: 380 };
    if (num === 'LH23') return { x: 640, y: 380 };

    return { x: 400, y: 250 };
  };

  // Generate SVG path command string for path display
  const renderPathD = () => {
    const targetNum = destinationRoom?.roomNumber || 'LH01';
    const targetPos = getRoomCenterPos(targetNum);

    if (activeFloorLevel === 0) {
      if (targetNum === 'LH01') return "M 400 400 L 400 310 L 150 310 L 150 340";
      if (targetNum === 'LH06') return "M 400 400 L 400 310 L 650 310 L 650 340";
      if (['LH02', 'LH03'].includes(targetNum)) return `M 400 400 L 400 310 L 150 310 L 150 160 L ${targetPos.x} 160 L ${targetPos.x} 120`;
      return `M 400 400 L 400 310 L 650 310 L 650 160 L ${targetPos.x} 160 L ${targetPos.x} 120`;
    } else if (activeFloorLevel === 3) {
      // Third Floor path matching user screenshot (Stairs -> Left -> Up -> Left -> Target)
      if (targetNum === 'LH19') {
        return "M 600 250 L 530 250 L 530 215 L 340 215 L 340 160 L 235 160 L 235 120";
      }
      if (['LH18', 'LH20'].includes(targetNum)) {
        return `M 600 250 L 530 250 L 530 160 L ${targetPos.x} 160 L ${targetPos.x} 120`;
      }
      if (['LH21', 'LH22'].includes(targetNum)) {
        return `M 600 250 L 600 160 L ${targetPos.x} 160 L ${targetPos.x} 120`;
      }
      return `M 600 250 L 600 320 L ${targetPos.x} 320 L ${targetPos.x} 340`;
    } else {
      // First / Second floor
      if (['LH07', 'LH13'].includes(targetNum)) return "M 600 250 L 600 320 L 150 320 L 150 340";
      if (['LH12', 'LH16'].includes(targetNum)) return "M 600 250 L 600 320 L 650 320 L 650 340";
      if (['LH08', 'LH09', 'LH14'].includes(targetNum)) return `M 600 250 L 600 170 L ${targetPos.x} 170 L ${targetPos.x} 120`;
      return `M 600 250 L 600 170 L ${targetPos.x} 170 L ${targetPos.x} 120`;
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-500 font-medium text-sm">Initializing SIET Academic Block Twin Engine...</p>
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
              <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">SIET Academic Twin</span>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">A* Indoor Navigation</span>
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
                  { id: 'Campus Entrance', label: 'Main Entrance' },
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
                    <option value="">Select Starting Room...</option>
                    {allRooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.roomNumber} - {r.name}
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
                  <p className="text-[10px] text-gray-400 font-medium">Avoid stairs, prefer ramps/elevators</p>
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
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3">Academic Floor:</span>
            {[
              { level: 0, label: 'Ground Floor' },
              { level: 1, label: 'First Floor' },
              { level: 2, label: 'Second Floor' },
              { level: 3, label: 'Third Floor' }
            ].map((f) => (
              <button
                key={f.level}
                onClick={() => setActiveFloorLevel(f.level)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  activeFloorLevel === f.level
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.label} {f.level === destinationRoom?.floor?.floorNumber && '(Target)'}
              </button>
            ))}
          </div>

          {/* Interactive Digital Twin Visual Canvas */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden min-h-[540px] relative flex flex-col">

            {/* Academic Floor Banner Header matching screenshot */}
            <div className="p-4 bg-slate-100 border-b border-gray-200 flex items-center justify-between">
              <div className="bg-white px-4 py-1.5 rounded-full border border-gray-300 text-xs font-black text-gray-900 tracking-wide uppercase shadow-sm">
                ACADEMIC BLOCK | {activeFloorLevel === 0 ? 'GROUND FLOOR' : activeFloorLevel === 1 ? 'FIRST FLOOR' : activeFloorLevel === 2 ? 'SECOND FLOOR' : 'THIRD FLOOR'} | STAIRS → {destinationRoom?.roomNumber || 'LH19'}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-green-100 text-green-700 rounded-lg">
                Verified SIET Floor Map
              </span>
            </div>

            {/* SVG Canvas drawing exact layout matching screenshots */}
            <div className="flex-1 p-6 relative flex items-center justify-center bg-slate-200 overflow-auto">
              <svg viewBox="0 0 800 480" className="w-full max-w-3xl h-auto rounded-2xl shadow-xl border border-gray-400 bg-white">
                <defs>
                  <marker id="arrowRed" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                  </marker>
                </defs>

                {/* Outer Building Boundary */}
                <rect x="50" y="50" width="700" height="390" fill="#f8fafc" stroke="#334155" strokeWidth="3" />

                {/* ---------------- GROUND FLOOR (LEVEL 0) ---------------- */}
                {activeFloorLevel === 0 && (
                  <g>
                    <g>
                      <rect x="70" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="120" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH02</text>

                      <rect x="190" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="240" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH03</text>

                      <rect x="330" y="60" width="140" height="40" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
                      <text x="400" y="85" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">EXIT</text>

                      <rect x="510" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="560" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH04</text>

                      <rect x="630" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="680" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH05</text>
                    </g>

                    <g>
                      <rect x="70" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <line x1="70" y1="210" x2="250" y2="210" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="70" y1="240" x2="250" y2="240" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="70" y1="270" x2="250" y2="270" stroke="#94a3b8" strokeWidth="1.5" />
                      <text x="160" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                      <rect x="550" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <line x1="550" y1="210" x2="730" y2="210" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="550" y1="240" x2="730" y2="240" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="550" y1="270" x2="730" y2="270" stroke="#94a3b8" strokeWidth="1.5" />
                      <text x="640" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>
                    </g>

                    <g>
                      <rect x="70" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="160" y="390" fill="#1e40af" fontSize="14" fontWeight="900" textAnchor="middle">LH01</text>

                      <rect x="320" y="380" width="160" height="50" fill="#ffffff" stroke="#dc2626" strokeWidth="2" />
                      <text x="400" y="412" fill="#dc2626" fontSize="13" fontWeight="900" textAnchor="middle">ENTRY</text>

                      <rect x="550" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="640" y="390" fill="#1e40af" fontSize="14" fontWeight="900" textAnchor="middle">LH06</text>
                    </g>
                  </g>
                )}

                {/* ---------------- FIRST FLOOR (LEVEL 1) ---------------- */}
                {activeFloorLevel === 1 && (
                  <g>
                    <g>
                      <rect x="70" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="120" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH08</text>

                      <rect x="190" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="240" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH09</text>

                      <rect x="510" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="560" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH10</text>

                      <rect x="630" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="680" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH11</text>
                    </g>

                    <g>
                      <rect x="70" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <line x1="70" y1="210" x2="250" y2="210" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="70" y1="240" x2="250" y2="240" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="70" y1="270" x2="250" y2="270" stroke="#94a3b8" strokeWidth="1.5" />
                      <text x="160" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                      <rect x="310" y="190" width="180" height="100" rx="12" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />

                      <rect x="550" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <line x1="550" y1="210" x2="730" y2="210" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="550" y1="240" x2="730" y2="240" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="550" y1="270" x2="730" y2="270" stroke="#94a3b8" strokeWidth="1.5" />
                      <text x="640" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>
                    </g>

                    <g>
                      <rect x="70" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="160" y="390" fill="#1e40af" fontSize="14" fontWeight="900" textAnchor="middle">LH07</text>

                      <rect x="300" y="350" width="90" height="80" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                      <text x="345" y="385" fill="#475569" fontSize="9" fontWeight="900" textAnchor="middle">GIRLS</text>
                      <text x="345" y="398" fill="#475569" fontSize="9" fontWeight="900" textAnchor="middle">TOILET</text>

                      <rect x="410" y="350" width="90" height="80" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                      <text x="455" y="385" fill="#475569" fontSize="9" fontWeight="900" textAnchor="middle">BOYS</text>
                      <text x="455" y="398" fill="#475569" fontSize="9" fontWeight="900" textAnchor="middle">TOILET</text>

                      <rect x="550" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="640" y="390" fill="#1e40af" fontSize="14" fontWeight="900" textAnchor="middle">LH12</text>
                    </g>
                  </g>
                )}

                {/* ---------------- SECOND FLOOR (LEVEL 2) ---------------- */}
                {activeFloorLevel === 2 && (
                  <g>
                    <g>
                      <rect x="70" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="120" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH14</text>

                      <rect x="230" y="60" width="340" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="400" y="102" fill="#dc2626" fontSize="14" fontWeight="900" textAnchor="middle">SEMINAR HALL - 1</text>

                      <rect x="630" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="680" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH15</text>
                    </g>

                    <g>
                      <rect x="70" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <line x1="70" y1="210" x2="250" y2="210" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="70" y1="240" x2="250" y2="240" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="70" y1="270" x2="250" y2="270" stroke="#94a3b8" strokeWidth="1.5" />
                      <text x="160" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                      <rect x="310" y="190" width="180" height="100" rx="12" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />

                      <rect x="550" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <line x1="550" y1="210" x2="730" y2="210" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="550" y1="240" x2="730" y2="240" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="550" y1="270" x2="730" y2="270" stroke="#94a3b8" strokeWidth="1.5" />
                      <text x="640" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>
                    </g>

                    <g>
                      <rect x="70" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="160" y="390" fill="#1e40af" fontSize="14" fontWeight="900" textAnchor="middle">LH13</text>

                      <rect x="300" y="350" width="90" height="80" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                      <text x="345" y="385" fill="#475569" fontSize="9" fontWeight="900" textAnchor="middle">GIRLS</text>
                      <text x="345" y="398" fill="#475569" fontSize="9" fontWeight="900" textAnchor="middle">TOILET</text>

                      <rect x="410" y="350" width="90" height="80" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                      <text x="455" y="385" fill="#475569" fontSize="9" fontWeight="900" textAnchor="middle">BOYS</text>
                      <text x="455" y="398" fill="#475569" fontSize="9" fontWeight="900" textAnchor="middle">TOILET</text>

                      <rect x="550" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="640" y="390" fill="#1e40af" fontSize="14" fontWeight="900" textAnchor="middle">LH16</text>
                    </g>
                  </g>
                )}

                {/* ---------------- THIRD FLOOR (LEVEL 3) ---------------- */}
                {activeFloorLevel === 3 && (
                  <g>
                    {/* Top Row: LH18, LH19, LH20, LH21, LH22 */}
                    <g>
                      <rect x="70" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="120" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH18</text>

                      <rect x="190" y="60" width="90" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="235" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH19</text>

                      <rect x="290" y="60" width="90" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="335" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH20</text>

                      <rect x="390" y="60" width="90" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="435" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH21</text>

                      <rect x="610" y="60" width="120" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="670" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH22</text>
                    </g>

                    {/* Middle Row: Courtyard Void, Stairs East */}
                    <g>
                      <rect x="310" y="190" width="180" height="100" rx="12" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />

                      <rect x="550" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <line x1="550" y1="210" x2="730" y2="210" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="550" y1="240" x2="730" y2="240" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="550" y1="270" x2="730" y2="270" stroke="#94a3b8" strokeWidth="1.5" />
                      <text x="640" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>
                    </g>

                    {/* Bottom Row: LH17, LH23A, LH23B, LH23 */}
                    <g>
                      <rect x="70" y="330" width="150" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="145" y="390" fill="#1e40af" fontSize="14" fontWeight="900" textAnchor="middle">LH17</text>

                      <rect x="230" y="330" width="100" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="280" y="390" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH23A</text>

                      <rect x="340" y="330" width="100" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="390" y="390" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH23B</text>

                      <rect x="550" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                      <text x="640" y="390" fill="#1e40af" fontSize="14" fontWeight="900" textAnchor="middle">LH23</text>
                    </g>
                  </g>
                )}

                {/* --- NAVIGATION PATH LINE OVERLAY matching screenshot --- */}
                <path
                  d={renderPathD()}
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="5"
                  strokeDasharray="8 6"
                  markerEnd="url(#arrowRed)"
                />

                {/* Target Room Blue Location Drop Pin */}
                {(() => {
                  const pos = getRoomCenterPos(destinationRoom?.roomNumber);
                  return (
                    <g transform={`translate(${pos.x}, ${pos.y - 20})`}>
                      <circle cx="0" cy="0" r="12" fill="#2563eb" stroke="#ffffff" strokeWidth="2" className="animate-bounce" />
                      <circle cx="0" cy="0" r="4" fill="#ffffff" />
                      <path d="M -12 0 L 0 16 L 12 0 Z" fill="#2563eb" />
                    </g>
                  );
                })()}

              </svg>
            </div>

            {/* Bottom Status Ribbon */}
            <div className="p-4 bg-slate-100 border-t border-gray-200 text-gray-600 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Path highlighted in red dashed line following Academic Block corridors.</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">SIET Digital Twin Spatial Model</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalTwinNavigationPage;
