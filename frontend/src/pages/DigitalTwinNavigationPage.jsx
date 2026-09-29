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
  Info,
  Edit,
  Check,
  X
} from 'lucide-react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const DigitalTwinNavigationPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const isAdmin = userInfo?.role === 'admin';

  const [destinationRoom, setDestinationRoom] = useState(null);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // Editable Room Numbers State for Admin
  const [isEditingMapNumbers, setIsEditingMapNumbers] = useState(false);
  const [editableRoomNumbers, setEditableRoomNumbers] = useState({});
  const [savingNumbers, setSavingNumbers] = useState(false);

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
      const loadedRooms = roomsRes.data.data;
      setDestinationRoom(dest);
      setAllRooms(loadedRooms.filter(r => r._id !== roomId));

      // Build initial editableRoomNumbers map
      const numMap = {};
      loadedRooms.forEach(r => {
        numMap[r._id] = r.roomNumber;
      });
      setEditableRoomNumbers(numMap);

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

  const startEditMapNumbers = () => {
    const numMap = {};
    [destinationRoom, ...allRooms].forEach(r => {
      if (r) numMap[r._id] = r.roomNumber;
    });
    setEditableRoomNumbers(numMap);
    setIsEditingMapNumbers(true);
  };

  const handleSaveMapNumbers = async () => {
    try {
      setSavingNumbers(true);
      const promises = Object.keys(editableRoomNumbers).map(rId => {
        const newNum = editableRoomNumbers[rId];
        if (newNum) {
          const rawNum = newNum.trim().toUpperCase();
          const digits = rawNum.replace(/^[A-Z\s_-]+/, '');
          let newName = `Room ${newNum}`;
          if (rawNum.startsWith('LH')) newName = `Lecture Hall ${digits || rawNum}`;
          if (rawNum.startsWith('CL')) newName = `Computer Lab ${digits || rawNum}`;
          if (rawNum.startsWith('SH')) newName = `Seminar Hall ${digits || rawNum}`;

          return api.put(`/rooms/${rId}`, { roomNumber: newNum, name: newName });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      alert('Room numbers and common names updated successfully!');
      setIsEditingMapNumbers(false);
      await fetchInitialData();
    } catch (error) {
      alert('Failed to update room numbers');
    } finally {
      setSavingNumbers(false);
    }
  };

  const handleRoomNumberChange = (rId, val) => {
    setEditableRoomNumbers(prev => ({
      ...prev,
      [rId]: val
    }));
  };

  const isAdminBlock = destinationRoom?.block?.code === 'ADMB' || destinationRoom?.block?.name?.includes('Admin');

  // Get all rooms on current active floor for the current block
  const currentFloorRooms = [destinationRoom, ...allRooms].filter(
    r => r && r.floor?.floorNumber === activeFloorLevel && (
      isAdminBlock
        ? (r.block?.code === 'ADMB' || r.block?.name?.includes('Admin'))
        : (r.block?.code === 'ACAB' || !r.block?.name?.includes('Admin'))
    )
  );

  // Find target room's current box index on this floor
  const targetBoxIndex = currentFloorRooms.findIndex(r => r._id === destinationRoom?._id);

  // DYNAMIC ROOM CENTER POS & PATH BASED ON DYNAMIC BOX INDEX
  const getDynamicTargetBoxData = () => {
    const idx = targetBoxIndex >= 0 ? targetBoxIndex : 0;

    if (!isAdminBlock) {
      if (activeFloorLevel === 0) {
        const boxes = [
          { center: { x: 160, y: 380 }, path: "M 400 400 L 400 310 L 160 310 L 160 340" },
          { center: { x: 120, y: 110 }, path: "M 400 400 L 400 310 L 160 310 L 160 160 L 120 160 L 120 120" },
          { center: { x: 240, y: 110 }, path: "M 400 400 L 400 310 L 160 310 L 160 160 L 240 160 L 240 120" },
          { center: { x: 560, y: 110 }, path: "M 400 400 L 400 310 L 640 310 L 640 160 L 560 160 L 560 120" },
          { center: { x: 680, y: 110 }, path: "M 400 400 L 400 310 L 640 310 L 640 160 L 680 160 L 680 120" },
          { center: { x: 640, y: 380 }, path: "M 400 400 L 400 310 L 640 310 L 640 340" }
        ];
        return boxes[idx % boxes.length];
      } else if (activeFloorLevel === 1) {
        const boxes = [
          { center: { x: 160, y: 380 }, path: "M 600 250 L 600 320 L 160 320 L 160 340" },
          { center: { x: 120, y: 110 }, path: "M 600 250 L 600 170 L 120 170 L 120 120" },
          { center: { x: 240, y: 110 }, path: "M 600 250 L 600 170 L 240 170 L 240 120" },
          { center: { x: 560, y: 110 }, path: "M 600 250 L 600 170 L 560 170 L 560 120" },
          { center: { x: 680, y: 110 }, path: "M 600 250 L 600 170 L 680 170 L 680 120" },
          { center: { x: 640, y: 380 }, path: "M 600 250 L 600 320 L 640 320 L 640 340" }
        ];
        return boxes[idx % boxes.length];
      } else if (activeFloorLevel === 2) {
        const boxes = [
          { center: { x: 160, y: 380 }, path: "M 600 250 L 600 320 L 160 320 L 160 340" },
          { center: { x: 120, y: 110 }, path: "M 600 250 L 600 170 L 120 170 L 120 120" },
          { center: { x: 400, y: 100 }, path: "M 600 250 L 600 170 L 400 170 L 400 120" },
          { center: { x: 680, y: 110 }, path: "M 600 250 L 600 170 L 680 170 L 680 120" },
          { center: { x: 640, y: 380 }, path: "M 600 250 L 600 320 L 640 320 L 640 340" }
        ];
        return boxes[idx % boxes.length];
      } else {
        const boxes = [
          { center: { x: 235, y: 110 }, path: "M 600 250 L 530 250 L 530 215 L 340 215 L 340 160 L 235 160 L 235 120" },
          { center: { x: 335, y: 110 }, path: "M 600 250 L 530 250 L 530 160 L 335 160 L 335 120" },
          { center: { x: 145, y: 380 }, path: "M 600 250 L 600 320 L 145 320 L 145 340" },
          { center: { x: 120, y: 110 }, path: "M 600 250 L 530 250 L 530 160 L 120 160 L 120 120" },
          { center: { x: 435, y: 110 }, path: "M 600 250 L 600 160 L 435 160 L 435 120" },
          { center: { x: 670, y: 110 }, path: "M 600 250 L 600 160 L 670 160 L 670 120" },
          { center: { x: 280, y: 380 }, path: "M 600 250 L 600 320 L 280 320 L 280 340" },
          { center: { x: 390, y: 380 }, path: "M 600 250 L 600 320 L 390 320 L 390 340" },
          { center: { x: 640, y: 380 }, path: "M 600 250 L 600 320 L 640 320 L 640 340" }
        ];
        return boxes[idx % boxes.length];
      }
    } else {
      if (activeFloorLevel === 0) {
        const boxes = [
          { center: { x: 212, y: 90 }, path: "M 387 400 L 387 110 L 212 110 L 212 90" },
          { center: { x: 157, y: 90 }, path: "M 387 400 L 387 110 L 157 110 L 157 90" },
          { center: { x: 615, y: 230 }, path: "M 387 400 L 387 230 L 615 230" }
        ];
        return boxes[idx % boxes.length];
      } else if (activeFloorLevel === 2) {
        const boxes = [
          { center: { x: 730, y: 230 }, path: "M 520 280 L 520 230 L 730 230" },
          { center: { x: 655, y: 230 }, path: "M 520 280 L 520 230 L 655 230" },
          { center: { x: 585, y: 230 }, path: "M 520 280 L 520 230 L 585 230" },
          { center: { x: 515, y: 230 }, path: "M 520 280 L 520 230 L 515 230" },
          { center: { x: 817, y: 230 }, path: "M 520 280 L 520 230 L 817 230" },
          { center: { x: 527, y: 330 }, path: "M 520 280 L 520 330 L 527 330" },
          { center: { x: 620, y: 330 }, path: "M 520 280 L 520 330 L 620 330" },
          { center: { x: 710, y: 330 }, path: "M 520 280 L 520 330 L 710 330" },
          { center: { x: 810, y: 330 }, path: "M 520 280 L 520 330 L 810 330" }
        ];
        return boxes[idx % boxes.length];
      } else {
        const boxes = [
          { center: { x: 520, y: 330 }, path: "M 520 280 L 520 330 L 520 330" },
          { center: { x: 605, y: 330 }, path: "M 520 280 L 520 330 L 605 330" },
          { center: { x: 812, y: 330 }, path: "M 520 280 L 520 330 L 812 330" },
          { center: { x: 550, y: 230 }, path: "M 520 280 L 520 230 L 550 230" }
        ];
        return boxes[idx % boxes.length];
      }
    }
  };

  const activeBoxData = getDynamicTargetBoxData();

  // Helper to render room text or editable input
  const renderRoomLabel = (roomObj, defaultLabel, x, y, width = 90, height = 40) => {
    if (!roomObj) {
      return (
        <text x={x + width / 2} y={y + height / 2 + 4} fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">
          {defaultLabel}
        </text>
      );
    }

    const currentNum = editableRoomNumbers[roomObj._id] !== undefined ? editableRoomNumbers[roomObj._id] : roomObj.roomNumber;

    if (isEditingMapNumbers && isAdmin) {
      return (
        <foreignObject x={x + 5} y={y + 5} width={width - 10} height={height - 10}>
          <div className="w-full h-full flex items-center justify-center">
            <input
              type="text"
              value={currentNum}
              onChange={(e) => handleRoomNumberChange(roomObj._id, e.target.value)}
              className="w-full text-center font-black text-blue-900 bg-blue-50 border-2 border-blue-500 rounded px-1 text-xs shadow-sm focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
        </foreignObject>
      );
    }

    return (
      <text x={x + width / 2} y={y + height / 2 + 4} fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">
        {currentNum}
      </text>
    );
  };

  // Find room object by index
  const findRoomByPosIdx = (idx) => {
    return currentFloorRooms[idx] || null;
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

            {/* Banner Header with Edit Map Numbers option for Admin */}
            <div className="p-4 bg-slate-100 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
              <div className="bg-white px-4 py-1.5 rounded-full border border-gray-300 text-xs font-black text-gray-900 tracking-wide uppercase shadow-sm">
                {destinationRoom?.block?.name?.toUpperCase() || 'ADMINISTRATIVE BLOCK'} | {activeFloorLevel === 0 ? 'GROUND FLOOR' : activeFloorLevel === 1 ? 'FIRST FLOOR' : activeFloorLevel === 2 ? 'SECOND FLOOR' : 'THIRD FLOOR'} | ENTRANCE → {destinationRoom?.roomNumber || 'LH55'}
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  !isEditingMapNumbers ? (
                    <button
                      onClick={startEditMapNumbers}
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Map Numbers
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveMapNumbers}
                        disabled={savingNumbers}
                        className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all"
                      >
                        {savingNumbers ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Save Numbers
                      </button>
                      <button
                        onClick={() => setIsEditingMapNumbers(false)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  )
                )}
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-green-100 text-green-700 rounded-lg">
                  Verified SIET Floor Map
                </span>
              </div>
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

                {/* --- RENDER ACADEMIC BLOCK MAP WITH EDITABLE ROOM NUMBERS --- */}
                {!isAdminBlock && (
                  <g>
                    {activeFloorLevel === 0 && (
                      <g>
                        <rect x="70" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(1), 'LH02', 70, 60, 100, 90)}

                        <rect x="190" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(2), 'LH03', 190, 60, 100, 90)}

                        <rect x="330" y="60" width="140" height="40" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
                        <text x="400" y="85" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">EXIT</text>

                        <rect x="510" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(3), 'LH04', 510, 60, 100, 90)}

                        <rect x="630" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(4), 'LH05', 630, 60, 100, 90)}

                        <rect x="70" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="160" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                        <rect x="550" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="640" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                        <rect x="70" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(0), 'LH01', 70, 330, 180, 100)}

                        <rect x="320" y="380" width="160" height="50" fill="#ffffff" stroke="#dc2626" strokeWidth="2" />
                        <text x="400" y="412" fill="#dc2626" fontSize="13" fontWeight="900" textAnchor="middle">ENTRY</text>

                        <rect x="550" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(5), 'LH06', 550, 330, 180, 100)}
                      </g>
                    )}

                    {activeFloorLevel === 1 && (
                      <g>
                        <rect x="70" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(1), 'LH08', 70, 60, 100, 90)}

                        <rect x="190" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(2), 'LH09', 190, 60, 100, 90)}

                        <rect x="510" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(3), 'LH10', 510, 60, 100, 90)}

                        <rect x="630" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(4), 'LH11', 630, 60, 100, 90)}

                        <rect x="70" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="160" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                        <rect x="310" y="190" width="180" height="100" rx="12" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />

                        <rect x="550" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="640" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                        <rect x="70" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(0), 'LH07', 70, 330, 180, 100)}

                        <rect x="550" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(5), 'LH12', 550, 330, 180, 100)}
                      </g>
                    )}

                    {activeFloorLevel === 2 && (
                      <g>
                        <rect x="70" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(1), 'LH14', 70, 60, 100, 90)}

                        <rect x="230" y="60" width="340" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="400" y="102" fill="#dc2626" fontSize="14" fontWeight="900" textAnchor="middle">SEMINAR HALL - 1</text>

                        <rect x="630" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(3), 'LH15', 630, 60, 100, 90)}

                        <rect x="70" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="160" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                        <rect x="310" y="190" width="180" height="100" rx="12" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />

                        <rect x="550" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="640" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                        <rect x="70" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(0), 'LH13', 70, 330, 180, 100)}

                        <rect x="550" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(4), 'LH16', 550, 330, 180, 100)}
                      </g>
                    )}

                    {activeFloorLevel === 3 && (
                      <g>
                        <rect x="70" y="60" width="100" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(3), 'LH18', 70, 60, 100, 90)}

                        <rect x="190" y="60" width="90" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(0), 'LH19', 190, 60, 90, 90)}

                        <rect x="290" y="60" width="90" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(1), 'LH20', 290, 60, 90, 90)}

                        <rect x="390" y="60" width="90" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(4), 'LH21', 390, 60, 90, 90)}

                        <rect x="610" y="60" width="120" height="90" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(5), 'LH22', 610, 60, 120, 90)}

                        <rect x="310" y="190" width="180" height="100" rx="12" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />

                        <rect x="550" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        <text x="640" y="215" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                        <rect x="70" y="330" width="150" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(2), 'LH17', 70, 330, 150, 100)}

                        <rect x="230" y="330" width="100" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(6), 'LH23A', 230, 330, 100, 100)}

                        <rect x="340" y="330" width="100" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(7), 'LH23B', 340, 330, 100, 100)}

                        <rect x="550" y="330" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                        {renderRoomLabel(findRoomByPosIdx(8), 'LH23', 550, 330, 180, 100)}
                      </g>
                    )}
                  </g>
                )}

                {/* --- RENDER ADMINISTRATIVE BLOCK MAP WITH EDITABLE ROOM NUMBERS --- */}
                {isAdminBlock && (
                  <g>
                    {activeFloorLevel === 0 && (
                      <g>
                        <rect x="50" y="50" width="80" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="90" y="85" fill="#a855f7" fontSize="10" fontWeight="900" textAnchor="middle">MECH LAB</text>

                        <rect x="130" y="50" width="55" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        {renderRoomLabel(findRoomByPosIdx(1), 'LH52', 130, 50, 55, 70)}

                        <rect x="185" y="50" width="55" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        {renderRoomLabel(findRoomByPosIdx(0), 'LH51', 185, 50, 55, 70)}

                        <rect x="240" y="50" width="60" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="270" y="82" fill="#1e40af" fontSize="9" fontWeight="900" textAnchor="middle">MECH DEPT</text>

                        <rect x="300" y="50" width="45" height="30" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" />
                        <text x="322" y="70" fill="#dc2626" fontSize="9" fontWeight="900" textAnchor="middle">EXIT</text>

                        <rect x="430" y="50" width="45" height="30" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" />
                        <text x="452" y="70" fill="#dc2626" fontSize="9" fontWeight="900" textAnchor="middle">EXIT</text>

                        <rect x="480" y="50" width="160" height="75" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="560" y="92" fill="#1e40af" fontSize="12" fontWeight="900" textAnchor="middle">LIBRARY</text>

                        <rect x="650" y="50" width="215" height="75" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="757" y="92" fill="#dc2626" fontSize="13" fontWeight="900" textAnchor="middle">SEMINAR HALL-2</text>

                        <rect x="50" y="170" width="110" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="105" y="205" fill="#a855f7" fontSize="10" fontWeight="900" textAnchor="middle">EEE LAB</text>

                        <rect x="160" y="170" width="115" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="217" y="205" fill="#1e40af" fontSize="10" fontWeight="900" textAnchor="middle">EEE DEPT.</text>

                        <rect x="50" y="300" width="110" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="105" y="335" fill="#a855f7" fontSize="10" fontWeight="900" textAnchor="middle">EE LAB</text>

                        <rect x="160" y="300" width="115" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="217" y="330" fill="#1e40af" fontSize="9" fontWeight="900" textAnchor="middle">AGRI DEPT</text>

                        <rect x="480" y="200" width="100" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="530" y="228" fill="#1e40af" fontSize="9" fontWeight="900" textAnchor="middle">CIVIL DEPT</text>

                        <rect x="580" y="200" width="70" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        {renderRoomLabel(findRoomByPosIdx(2), 'LH50', 580, 200, 70, 60)}

                        <rect x="650" y="200" width="215" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="757" y="235" fill="#a855f7" fontSize="11" fontWeight="900" textAnchor="middle">STRENGTH MATERIAL LAB</text>

                        <rect x="480" y="310" width="385" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="672" y="345" fill="#1e40af" fontSize="13" fontWeight="900" textAnchor="middle">OFFICE ROOM</text>

                        <rect x="50" y="400" width="225" height="35" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="162" y="422" fill="#1e40af" fontSize="11" fontWeight="900" textAnchor="middle">AGRI DEPARTMENT</text>

                        <rect x="345" y="400" width="85" height="35" fill="#ffffff" stroke="#dc2626" strokeWidth="2" />
                        <text x="387" y="422" fill="#dc2626" fontSize="11" fontWeight="900" textAnchor="middle">ENTRANCE</text>
                      </g>
                    )}

                    {/* FIRST / SECOND / THIRD FLOOR */}
                    {activeFloorLevel > 0 && (
                      <g>
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
                            {renderRoomLabel(findRoomByPosIdx(0), 'LH36', 480, 300, 80, 60)}

                            <rect x="560" y="300" width="90" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(1), 'CL01', 560, 300, 90, 60)}

                            <rect x="650" y="300" width="110" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="705" y="335" fill="#1e40af" fontSize="10" fontWeight="900" textAnchor="middle">CSE DEPT</text>

                            <rect x="760" y="300" width="105" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(4), 'LH37', 760, 300, 105, 60)}
                          </g>
                        )}

                        {/* LEVEL 2 */}
                        {activeFloorLevel === 2 && (
                          <g>
                            {/* Top row */}
                            <rect x="50" y="50" width="100" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="100" y="85" fill="#a855f7" fontSize="9" fontWeight="900" textAnchor="middle">ELECTRONICS LAB</text>

                            <rect x="150" y="50" width="50" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(10), 'CL10', 150, 50, 50, 70)}

                            <rect x="200" y="50" width="90" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(9), 'CL09', 200, 50, 90, 70)}

                            <rect x="480" y="50" width="70" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="515" y="85" fill="#1e40af" fontSize="8" fontWeight="900" textAnchor="middle">MATHS DEPT</text>

                            <rect x="550" y="50" width="60" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(12), 'CL13', 550, 50, 60, 70)}

                            <rect x="610" y="50" width="80" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(14), 'LH24', 610, 50, 80, 70)}

                            <rect x="690" y="50" width="80" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(15), 'LH25', 690, 50, 80, 70)}

                            <rect x="770" y="50" width="95" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(16), 'LH26', 770, 50, 95, 70)}

                            {/* Middle Row */}
                            <rect x="50" y="200" width="80" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(12), 'LH49', 50, 200, 80, 60)}

                            <rect x="130" y="200" width="70" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(8), 'CL06', 130, 200, 70, 60)}

                            <rect x="200" y="200" width="75" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(11), 'LH48', 200, 200, 75, 60)}

                            {/* Middle Row Right */}
                            <rect x="480" y="200" width="70" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(3), 'LH32', 480, 200, 70, 60)}

                            <rect x="550" y="200" width="70" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(2), 'LH53', 550, 200, 70, 60)}

                            <rect x="620" y="200" width="70" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(1), 'LH54', 620, 200, 70, 60)}

                            {/* LH55 */}
                            <rect x="690" y="200" width="80" height="60" fill={destinationRoom?._id === findRoomByPosIdx(0)?._id ? '#dbeafe' : '#ffffff'} stroke={destinationRoom?._id === findRoomByPosIdx(0)?._id ? '#2563eb' : '#1e293b'} strokeWidth={destinationRoom?._id === findRoomByPosIdx(0)?._id ? "3" : "1.5"} />
                            {renderRoomLabel(findRoomByPosIdx(0), 'LH55', 690, 200, 80, 60)}

                            <rect x="770" y="200" width="95" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(4), 'LH33', 770, 200, 95, 60)}

                            {/* Row above Toilets */}
                            <rect x="50" y="300" width="80" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(10), 'LH43', 50, 300, 80, 60)}

                            <rect x="130" y="300" width="70" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(9), 'CL11', 130, 300, 70, 60)}

                            <rect x="200" y="300" width="75" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(8), 'LH42', 200, 300, 75, 60)}

                            <rect x="480" y="300" width="95" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(5), 'LH38', 480, 300, 95, 60)}

                            <rect x="575" y="300" width="90" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(6), 'CL02', 575, 300, 90, 60)}

                            <rect x="665" y="300" width="90" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(7), 'CL03', 665, 300, 90, 60)}

                            <rect x="755" y="300" width="110" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(13), 'LH39', 755, 300, 110, 60)}
                          </g>
                        )}

                        {/* LEVEL 3 */}
                        {activeFloorLevel === 3 && (
                          <g>
                            <rect x="50" y="300" width="50" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(12), 'LH45', 50, 300, 50, 60)}

                            <rect x="100" y="300" width="80" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="140" y="328" fill="#1e40af" fontSize="8" fontWeight="900" textAnchor="middle">AIDS DEPT</text>
                            {renderRoomLabel(findRoomByPosIdx(2), 'CL15', 100, 320, 80, 40)}

                            <rect x="180" y="300" width="50" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(1), 'CL14', 180, 300, 50, 60)}

                            <rect x="230" y="300" width="45" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(11), 'LH44', 230, 300, 45, 60)}

                            <rect x="480" y="300" width="65" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(9), 'LH40', 480, 300, 65, 60)}

                            <rect x="545" y="300" width="105" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            <text x="597" y="335" fill="#1e40af" fontSize="8" fontWeight="900" textAnchor="middle">CYBER SECURITY</text>

                            <rect x="650" y="300" width="80" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(0), 'CL04', 650, 300, 80, 60)}

                            <rect x="730" y="300" width="135" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                            {renderRoomLabel(findRoomByPosIdx(10), 'LH41', 730, 300, 135, 60)}
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
                )}

                {/* --- DYNAMIC NAVIGATION PATH LINE OVERLAY MATCHING TARGET ROOM BOX --- */}
                {activeBoxData?.path && (
                  <path
                    d={activeBoxData.path}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="5"
                    strokeDasharray="8 6"
                    markerEnd="url(#arrowRed)"
                  />
                )}

                {/* Target Room Blue Location Drop Pin matching target box center */}
                {activeBoxData?.center && (
                  <g transform={`translate(${activeBoxData.center.x}, ${activeBoxData.center.y - 20})`}>
                    <circle cx="0" cy="0" r="12" fill="#2563eb" stroke="#ffffff" strokeWidth="2" className="animate-bounce" />
                    <circle cx="0" cy="0" r="4" fill="#ffffff" />
                    <path d="M -12 0 L 0 16 L 12 0 Z" fill="#2563eb" />
                  </g>
                )}

              </svg>
            </div>

            {/* Bottom Status Ribbon */}
            <div className="p-4 bg-slate-100 border-t border-gray-200 text-gray-600 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Path highlighted in red dashed line following {destinationRoom?.block?.name || 'Administrative Block'} corridors to {destinationRoom?.roomNumber}.</span>
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
