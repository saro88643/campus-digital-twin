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

  const isAdminBlock = destinationRoom?.block?.code === 'ADMB' || destinationRoom?.block?.name?.includes('Admin');

  // Helper to get room location coordinates for path line drawing
  const getRoomCenterPos = (roomNum) => {
    const num = roomNum?.toUpperCase() || '';

    // Academic Block
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

    // Admin Block Ground Floor
    if (num === 'LH51') return { x: 245, y: 90 };
    if (num === 'LH52') return { x: 190, y: 90 };
    if (num === 'LH50') return { x: 660, y: 260 };

    // Admin Block 1st Floor
    if (num === 'LH36') return { x: 550, y: 360 };
    if (num === 'CL01') return { x: 645, y: 360 };
    if (num === 'LH37') return { x: 840, y: 360 };
    if (num === 'LH30') return { x: 550, y: 270 };

    // Admin Block 2nd Floor
    if (num === 'LH38') return { x: 560, y: 360 };
    if (num === 'CL02') return { x: 660, y: 360 };
    if (num === 'CL03') return { x: 750, y: 360 };
    if (num === 'LH39') return { x: 850, y: 360 };
    if (num === 'LH32') return { x: 560, y: 270 };
    if (num === 'LH53') return { x: 630, y: 270 };
    if (num === 'LH54') return { x: 700, y: 270 };

    // Admin Block 3rd Floor
    if (num === 'LH40') return { x: 550, y: 360 };
    if (num === 'LH41') return { x: 840, y: 360 };
    if (num === 'LH44') return { x: 290, y: 360 };
    if (num === 'LH45') return { x: 95, y: 360 };
    if (num === 'LH34') return { x: 550, y: 270 };

    return { x: 400, y: 250 };
  };

  // Generate SVG path command string for path display
  const renderPathD = () => {
    const targetNum = destinationRoom?.roomNumber || 'LH01';
    const targetPos = getRoomCenterPos(targetNum);

    if (isAdminBlock) {
      if (activeFloorLevel === 0) {
        return `M 430 400 L 370 400 L 370 120 L 245 120 L 245 90`;
      }
      if (activeFloorLevel === 1) {
        return `M 520 310 L 520 335 L 560 335 L 560 360`;
      }
      if (activeFloorLevel === 2) {
        return `M 520 310 L 520 335 L 560 335 L 560 360`;
      }
      if (activeFloorLevel === 3) {
        return `M 520 310 L 520 330 L 330 330 L 330 360 L 290 360`;
      }
    }

    if (activeFloorLevel === 0) {
      if (targetNum === 'LH01') return "M 400 400 L 400 310 L 150 310 L 150 340";
      if (targetNum === 'LH06') return "M 400 400 L 400 310 L 650 310 L 650 340";
      if (['LH02', 'LH03'].includes(targetNum)) return `M 400 400 L 400 310 L 150 310 L 150 160 L ${targetPos.x} 160 L ${targetPos.x} 120`;
      return `M 400 400 L 400 310 L 650 310 L 650 160 L ${targetPos.x} 160 L ${targetPos.x} 120`;
    } else if (activeFloorLevel === 3) {
      if (targetNum === 'LH19') return "M 600 250 L 530 250 L 530 215 L 340 215 L 340 160 L 235 160 L 235 120";
      if (['LH18', 'LH20'].includes(targetNum)) return `M 600 250 L 530 250 L 530 160 L ${targetPos.x} 160 L ${targetPos.x} 120`;
      if (['LH21', 'LH22'].includes(targetNum)) return `M 600 250 L 600 160 L ${targetPos.x} 160 L ${targetPos.x} 120`;
      return `M 600 250 L 600 320 L ${targetPos.x} 320 L ${targetPos.x} 340`;
    } else {
      if (['LH07', 'LH13'].includes(targetNum)) return "M 600 250 L 600 320 L 150 320 L 150 340";
      if (['LH12', 'LH16'].includes(targetNum)) return "M 600 250 L 600 320 L 650 320 L 650 340";
      if (['LH08', 'LH09', 'LH14'].includes(targetNum)) return `M 600 250 L 600 170 L ${targetPos.x} 170 L ${targetPos.x} 120`;
      return `M 600 250 L 600 170 L ${targetPos.x} 170 L ${targetPos.x} 120`;
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-500 font-medium text-sm">Initializing SIET Digital Campus Twin Engine...</p>
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
              <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">SIET Campus Twin</span>
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
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3">Floor Level:</span>
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

            {/* Banner Header matching screenshot */}
            <div className="p-4 bg-slate-100 border-b border-gray-200 flex items-center justify-between">
              <div className="bg-white px-4 py-1.5 rounded-full border border-gray-300 text-xs font-black text-gray-900 tracking-wide uppercase shadow-sm">
                {destinationRoom?.block?.name?.toUpperCase() || 'ADMINISTRATIVE BLOCK'} | {activeFloorLevel === 0 ? 'GROUND FLOOR' : activeFloorLevel === 1 ? 'FIRST FLOOR' : activeFloorLevel === 2 ? 'SECOND FLOOR' : 'THIRD FLOOR'} | ENTRANCE → {destinationRoom?.roomNumber || 'LH51'}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-green-100 text-green-700 rounded-lg">
                Verified SIET Floor Map
              </span>
            </div>

            {/* SVG Canvas */}
            <div className="flex-1 p-6 relative flex items-center justify-center bg-slate-200 overflow-auto">
              <svg viewBox="0 0 920 480" className="w-full max-w-4xl h-auto rounded-2xl shadow-xl border border-gray-400 bg-white">
                <defs>
                  <marker id="arrowRed" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                  </marker>
                </defs>

                {/* Outer Building Boundary */}
                <rect x="40" y="40" width="840" height="400" fill="#f8fafc" stroke="#334155" strokeWidth="3" />

                {/* --- RENDER ADMINISTRATIVE BLOCK MAP --- */}
                {isAdminBlock ? (
                  <g>
                    {/* GROUND FLOOR (LEVEL 0) */}
                    {activeFloorLevel === 0 && (
                      <g>
                        {/* Top row */}
                        <rect x="50" y="50" width="80" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="90" y="85" fill="#a855f7" fontSize="10" fontWeight="900" textAnchor="middle">MECH LAB</text>

                        <rect x="130" y="50" width="55" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="157" y="85" fill="#1e40af" fontSize="11" fontWeight="900" textAnchor="middle">LH52</text>

                        <rect x="185" y="50" width="55" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="212" y="85" fill="#1e40af" fontSize="11" fontWeight="900" textAnchor="middle">LH51</text>

                        <rect x="240" y="50" width="60" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="270" y="82" fill="#1e40af" fontSize="9" fontWeight="900" textAnchor="middle">MECH</text>
                        <text x="270" y="94" fill="#1e40af" fontSize="9" fontWeight="900" textAnchor="middle">DEPT.</text>

                        <rect x="300" y="50" width="45" height="30" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" />
                        <text x="322" y="70" fill="#dc2626" fontSize="9" fontWeight="900" textAnchor="middle">EXIT</text>

                        <rect x="430" y="50" width="45" height="30" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" />
                        <text x="452" y="70" fill="#dc2626" fontSize="9" fontWeight="900" textAnchor="middle">EXIT</text>

                        <rect x="480" y="50" width="160" height="75" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="560" y="92" fill="#1e40af" fontSize="12" fontWeight="900" textAnchor="middle">LIBRARY</text>

                        <rect x="650" y="50" width="215" height="75" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="757" y="92" fill="#dc2626" fontSize="13" fontWeight="900" textAnchor="middle">SEMINAR HALL-2</text>

                        {/* Middle Rows Left */}
                        <rect x="50" y="170" width="110" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="105" y="205" fill="#a855f7" fontSize="10" fontWeight="900" textAnchor="middle">EEE LAB</text>

                        <rect x="160" y="170" width="115" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="217" y="205" fill="#1e40af" fontSize="10" fontWeight="900" textAnchor="middle">EEE DEPT.</text>

                        <rect x="50" y="300" width="110" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="105" y="335" fill="#a855f7" fontSize="10" fontWeight="900" textAnchor="middle">EE LAB</text>

                        <rect x="160" y="300" width="115" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="217" y="330" fill="#1e40af" fontSize="9" fontWeight="900" textAnchor="middle">AGRI</text>
                        <text x="217" y="342" fill="#1e40af" fontSize="9" fontWeight="900" textAnchor="middle">DEPT.</text>

                        {/* Middle Rows Right */}
                        <rect x="480" y="200" width="100" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="530" y="228" fill="#1e40af" fontSize="9" fontWeight="900" textAnchor="middle">CIVIL</text>
                        <text x="530" y="240" fill="#1e40af" fontSize="9" fontWeight="900" textAnchor="middle">DEPT.</text>

                        <rect x="580" y="200" width="70" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="615" y="235" fill="#1e40af" fontSize="11" fontWeight="900" textAnchor="middle">LH50</text>

                        <rect x="650" y="200" width="215" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="757" y="235" fill="#a855f7" fontSize="11" fontWeight="900" textAnchor="middle">STRENGTH MATERIAL LAB</text>

                        <rect x="480" y="310" width="385" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="672" y="345" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">OFFICE ROOM</text>

                        {/* Bottom Row */}
                        <rect x="50" y="400" width="225" height="35" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="162" y="422" fill="#1e40af" fontSize="11" fontWeight="900" textAnchor="middle">AGRI DEPARTMENT</text>

                        <rect x="345" y="400" width="85" height="35" fill="#ffffff" stroke="#dc2626" strokeWidth="2" />
                        <text x="387" y="422" fill="#dc2626" fontSize="11" fontWeight="900" textAnchor="middle">ENTRANCE</text>
                      </g>
                    )}

                    {/* FIRST / SECOND / THIRD FLOOR (LEVEL 1, 2, 3) */}
                    {activeFloorLevel > 0 && (
                      <g>
                        {/* Common Bottom Toilets */}
                        <rect x="50" y="400" width="235" height="35" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="167" y="422" fill="#475569" fontSize="11" fontWeight="900" textAnchor="middle">BOYS TOILET</text>

                        <rect x="480" y="400" width="385" height="35" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="672" y="422" fill="#475569" fontSize="11" fontWeight="900" textAnchor="middle">GIRLS TOILET</text>

                        {/* LEVEL 1 */}
                        {activeFloorLevel === 1 && (
                          <g>
                            <rect x="50" y="300" width="55" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="77" y="335" fill="#1e40af" fontSize="9" fontWeight="900" textAnchor="middle">CHEM</text>

                            <rect x="105" y="300" width="55" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="132" y="335" fill="#1e40af" fontSize="9" fontWeight="900" textAnchor="middle">ENG</text>

                            <rect x="160" y="300" width="55" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="187" y="335" fill="#a855f7" fontSize="9" fontWeight="900" textAnchor="middle">PHY LAB</text>

                            <rect x="215" y="300" width="60" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="245" y="335" fill="#a855f7" fontSize="9" fontWeight="900" textAnchor="middle">PROZONE</text>

                            <rect x="480" y="300" width="80" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="520" y="335" fill="#1e40af" fontSize="11" fontWeight="900" textAnchor="middle">LH36</text>

                            <rect x="560" y="300" width="90" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="605" y="335" fill="#a855f7" fontSize="11" fontWeight="900" textAnchor="middle">CL01</text>

                            <rect x="650" y="300" width="110" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="705" y="335" fill="#1e40af" fontSize="10" fontWeight="900" textAnchor="middle">CSE DEPT</text>

                            <rect x="760" y="300" width="105" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="812" y="335" fill="#1e40af" fontSize="11" fontWeight="900" textAnchor="middle">LH37</text>
                          </g>
                        )}

                        {/* LEVEL 2 */}
                        {activeFloorLevel === 2 && (
                          <g>
                            <rect x="50" y="300" width="80" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="90" y="335" fill="#1e40af" fontSize="11" fontWeight="900" textAnchor="middle">LH43</text>

                            <rect x="130" y="300" width="70" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="165" y="335" fill="#a855f7" fontSize="11" fontWeight="900" textAnchor="middle">CL11</text>

                            <rect x="200" y="300" width="75" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="237" y="335" fill="#1e40af" fontSize="11" fontWeight="900" textAnchor="middle">LH42</text>

                            <rect x="480" y="300" width="95" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="527" y="335" fill="#1e40af" fontSize="11" fontWeight="900" textAnchor="middle">LH38</text>

                            <rect x="575" y="300" width="90" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="620" y="335" fill="#a855f7" fontSize="11" fontWeight="900" textAnchor="middle">CL02</text>

                            <rect x="665" y="300" width="90" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="710" y="335" fill="#a855f7" fontSize="11" fontWeight="900" textAnchor="middle">CL03</text>

                            <rect x="755" y="300" width="110" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="810" y="335" fill="#1e40af" fontSize="11" fontWeight="900" textAnchor="middle">LH39</text>
                          </g>
                        )}

                        {/* LEVEL 3 */}
                        {activeFloorLevel === 3 && (
                          <g>
                            <rect x="50" y="300" width="50" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="75" y="335" fill="#1e40af" fontSize="10" fontWeight="900" textAnchor="middle">LH45</text>

                            <rect x="100" y="300" width="80" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="140" y="328" fill="#1e40af" fontSize="8" fontWeight="900" textAnchor="middle">AIDS DEPT</text>
                            <text x="140" y="340" fill="#a855f7" fontSize="8" fontWeight="900" textAnchor="middle">CL15</text>

                            <rect x="180" y="300" width="50" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="205" y="335" fill="#a855f7" fontSize="10" fontWeight="900" textAnchor="middle">CL14</text>

                            <rect x="230" y="300" width="45" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="252" y="335" fill="#1e40af" fontSize="10" fontWeight="900" textAnchor="middle">LH44</text>

                            <rect x="480" y="300" width="65" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="512" y="335" fill="#1e40af" fontSize="10" fontWeight="900" textAnchor="middle">LH40</text>

                            <rect x="545" y="300" width="105" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="597" y="328" fill="#1e40af" fontSize="8" fontWeight="900" textAnchor="middle">CYBER SECURITY</text>
                            <text x="597" y="340" fill="#1e40af" fontSize="8" fontWeight="900" textAnchor="middle">DEPARTMENT</text>

                            <rect x="650" y="300" width="80" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="690" y="335" fill="#a855f7" fontSize="10" fontWeight="900" textAnchor="middle">CL04</text>

                            <rect x="730" y="300" width="135" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="797" y="335" fill="#1e40af" fontSize="11" fontWeight="900" textAnchor="middle">LH41</text>
                          </g>
                        )}

                        {/* Middle Stairs Indicator */}
                        <g>
                          <rect x="480" y="270" width="385" height="20" fill="#ffffff" stroke="#dc2626" strokeWidth="1" />
                          <text x="520" y="284" fill="#dc2626" fontSize="9" fontWeight="900" textAnchor="middle">STAIRS</text>
                        </g>
                      </g>
                    )}
                  </g>
                ) : (
                  /* --- RENDER ACADEMIC BLOCK MAP --- */
                  <g>
                    {activeFloorLevel === 0 && (
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

                        <rect x="70" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="160" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                        <rect x="550" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="640" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                        <rect x="70" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="160" y="390" fill="#1e40af" fontSize="14" fontWeight="900" textAnchor="middle">LH01</text>

                        <rect x="320" y="380" width="160" height="50" fill="#ffffff" stroke="#dc2626" strokeWidth="2" />
                        <text x="400" y="412" fill="#dc2626" fontSize="13" fontWeight="900" textAnchor="middle">ENTRY</text>

                        <rect x="550" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="640" y="390" fill="#1e40af" fontSize="14" fontWeight="900" textAnchor="middle">LH06</text>
                      </g>
                    )}

                    {activeFloorLevel === 1 && (
                      <g>
                        <rect x="70" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="120" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH08</text>

                        <rect x="190" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="240" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH09</text>

                        <rect x="510" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="560" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH10</text>

                        <rect x="630" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="680" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH11</text>

                        <rect x="70" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="160" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                        <rect x="310" y="190" width="180" height="100" rx="12" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />

                        <rect x="550" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="640" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                        <rect x="70" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="160" y="390" fill="#1e40af" fontSize="14" fontWeight="900" textAnchor="middle">LH07</text>

                        <rect x="550" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="640" y="390" fill="#1e40af" fontSize="14" fontWeight="900" textAnchor="middle">LH12</text>
                      </g>
                    )}

                    {activeFloorLevel === 2 && (
                      <g>
                        <rect x="70" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="120" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH14</text>

                        <rect x="230" y="60" width="340" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="400" y="102" fill="#dc2626" fontSize="14" fontWeight="900" textAnchor="middle">SEMINAR HALL - 1</text>

                        <rect x="630" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="680" y="115" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH15</text>

                        <rect x="70" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="160" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                        <rect x="310" y="190" width="180" height="100" rx="12" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />

                        <rect x="550" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="640" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                        <rect x="70" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="160" y="390" fill="#1e40af" fontSize="14" fontWeight="900" textAnchor="middle">LH13</text>

                        <rect x="550" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="640" y="390" fill="#1e40af" fontSize="14" fontWeight="900" textAnchor="middle">LH16</text>
                      </g>
                    )}

                    {activeFloorLevel === 3 && (
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

                        <rect x="310" y="190" width="180" height="100" rx="12" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />

                        <rect x="550" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="640" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                        <rect x="70" y="330" width="150" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="145" y="390" fill="#1e40af" fontSize="14" fontWeight="900" textAnchor="middle">LH17</text>

                        <rect x="230" y="330" width="100" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="280" y="390" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH23A</text>

                        <rect x="340" y="330" width="100" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="390" y="390" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">LH23B</text>

                        <rect x="550" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="640" y="390" fill="#1e40af" fontSize="14" fontWeight="900" textAnchor="middle">LH23</text>
                      </g>
                    )}
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
                <span>Path highlighted in red dashed line following {destinationRoom?.block?.name || 'Administrative Block'} corridors.</span>
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
