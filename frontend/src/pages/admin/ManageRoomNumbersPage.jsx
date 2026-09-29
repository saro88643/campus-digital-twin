import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Layers,
  DoorOpen,
  Edit3,
  Check,
  Loader2,
  Info,
  Navigation,
  Save,
  Plus,
  Move,
  CheckCircle2,
  Trash2,
  Route,
  Maximize2
} from 'lucide-react';
import api from '../../services/api';

const ManageRoomNumbersPage = () => {
  const navigate = useNavigate();

  const [blocks, setBlocks] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [activeFloorLevel, setActiveFloorLevel] = useState(0);

  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [activeFloorObj, setActiveFloorObj] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable room numbers dictionary { [roomId]: roomNumber }
  const [editableNumbers, setEditableRoomNumbers] = useState({});

  // New Custom Movable & Resizable Classroom Boxes
  const [customBoxes, setCustomBoxes] = useState([]);
  const [isAddingBox, setIsAddingBox] = useState(false);
  const [newBoxNum, setNewBoxNum] = useState('');
  const [newBoxName, setNewBoxName] = useState('');
  const [boxWidth, setBoxWidth] = useState(90);
  const [boxHeight, setBoxHeight] = useState(60);

  // Dragging State
  const [draggingBoxId, setDraggingBoxId] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, boxX: 0, boxY: 0 });

  // Path Creation Points
  const [pathPoints, setPathPoints] = useState([]);
  const [isDrawingPath, setIsDrawingPath] = useState(false);

  useEffect(() => {
    fetchBlocks();
  }, []);

  useEffect(() => {
    if (selectedBlockId) {
      fetchFloorRooms();
    }
  }, [selectedBlockId, activeFloorLevel]);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/blocks');
      const loadedBlocks = data.data || [];
      setBlocks(loadedBlocks);
      if (loadedBlocks.length > 0) {
        setSelectedBlockId(loadedBlocks[0]._id);
        setSelectedBlock(loadedBlocks[0]);
      }
    } catch (error) {
      console.error('Failed to fetch blocks');
    } finally {
      setLoading(false);
    }
  };

  const fetchFloorRooms = async () => {
    try {
      setLoading(true);
      const blk = blocks.find(b => b._id === selectedBlockId);
      setSelectedBlock(blk || null);

      const [roomsRes, floorsRes] = await Promise.all([
        api.get(`/rooms?blockId=${selectedBlockId}`),
        api.get(`/floors?blockId=${selectedBlockId}`)
      ]);

      const allBlkRooms = roomsRes.data.data || [];
      const blkFloors = floorsRes.data.data || [];
      setFloors(blkFloors);

      const currFloor = blkFloors.find(f => f.floorNumber === activeFloorLevel);
      setActiveFloorObj(currFloor || null);

      const floorRooms = allBlkRooms.filter(r => r.floor?.floorNumber === activeFloorLevel);
      setRooms(floorRooms);

      // Populate editable map
      const numMap = {};
      floorRooms.forEach(r => {
        numMap[r._id] = r.roomNumber;
      });
      setEditableRoomNumbers(numMap);
    } catch (error) {
      console.error('Failed to fetch floor rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleNumberChange = (roomId, newNum) => {
    setEditableRoomNumbers(prev => ({
      ...prev,
      [roomId]: newNum
    }));
  };

  const handleAddCustomBox = () => {
    if (!newBoxNum.trim()) return alert('Please enter a room number');
    const newBox = {
      id: `custom_${Date.now()}`,
      roomNumber: newBoxNum.trim().toUpperCase(),
      name: newBoxName.trim() || `Lecture Hall ${newBoxNum.trim().toUpperCase()}`,
      x: 350 + (customBoxes.length * 15),
      y: 200 + (customBoxes.length * 15),
      w: parseInt(boxWidth) || 90,
      h: parseInt(boxHeight) || 60,
      isCustom: true
    };
    setCustomBoxes(prev => [...prev, newBox]);
    setNewBoxNum('');
    setNewBoxName('');
    setIsAddingBox(false);
  };

  // Dragging Mouse Handlers
  const handleBoxMouseDown = (e, box) => {
    e.stopPropagation();
    setDraggingBoxId(box.id);
    const svg = e.currentTarget.ownerSVGElement;
    const rect = svg.getBoundingClientRect();
    const mouseX = Math.round(((e.clientX - rect.left) / rect.width) * 920);
    const mouseY = Math.round(((e.clientY - rect.top) / rect.height) * 480);
    setDragStart({ x: mouseX, y: mouseY, boxX: box.x, boxY: box.y });
  };

  const handleSvgMouseMove = (e) => {
    if (!draggingBoxId) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const currentX = Math.round(((e.clientX - rect.left) / rect.width) * 920);
    const currentY = Math.round(((e.clientY - rect.top) / rect.height) * 480);

    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;

    const newX = Math.max(50, Math.min(800, dragStart.boxX + deltaX));
    const newY = Math.max(50, Math.min(380, dragStart.boxY + deltaY));

    setCustomBoxes(prev => prev.map(b => b.id === draggingBoxId ? { ...b, x: newX, y: newY } : b));
  };

  const handleSvgMouseUp = () => {
    setDraggingBoxId(null);
  };

  const handleCanvasClickForPath = (e) => {
    if (!isDrawingPath) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 920);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 480);
    setPathPoints(prev => [...prev, { x, y }]);
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);

      // 1. Save existing room number updates
      const promises = Object.keys(editableNumbers).map(rId => {
        const newNumber = editableNumbers[rId];
        if (newNumber) {
          const rawNum = newNumber.trim().toUpperCase();
          const digits = rawNum.replace(/^[A-Z\s_-]+/, '');
          let newName = `Room ${newNumber}`;
          if (rawNum.startsWith('LH')) newName = `Lecture Hall ${digits || rawNum}`;
          if (rawNum.startsWith('CL')) newName = `Computer Lab ${digits || rawNum}`;
          if (rawNum.startsWith('SH')) newName = `Seminar Hall ${digits || rawNum}`;

          return api.put(`/rooms/${rId}`, { roomNumber: newNumber, name: newName });
        }
        return Promise.resolve();
      });

      // 2. Automatically create newly added custom classroom boxes in MongoDB
      if (activeFloorObj && selectedBlockId) {
        for (const box of customBoxes) {
          promises.push(
            api.post('/rooms', {
              roomNumber: box.roomNumber,
              name: box.name,
              roomType: box.roomNumber.startsWith('CL') ? 'Computer Lab' : 'Classroom',
              block: selectedBlockId,
              floor: activeFloorObj._id,
              capacity: 60,
              status: 'Available',
              digitalTwinMapped: true,
              geometry: { x: box.x, y: box.y, width: box.w, height: box.h }
            })
          );
        }
      }

      await Promise.all(promises);
      alert('Floor map, classroom numbers, and new workspaces created & updated successfully!');
      setCustomBoxes([]);
      setIsDrawingPath(false);
      await fetchFloorRooms();
    } catch (error) {
      alert('Failed to save room updates');
    } finally {
      setSaving(false);
    }
  };

  const isAdminBlock = selectedBlock?.code === 'ADMB' || selectedBlock?.name?.includes('Admin');

  // Find room by number or index
  const findRoomByNum = (numStr) => {
    return rooms.find(r => r.roomNumber?.toUpperCase() === numStr.toUpperCase()) || null;
  };

  const renderRoomBox = (roomObj, defaultLabel, x, y, w = 90, h = 60) => {
    const currentNum = roomObj && editableNumbers[roomObj._id] !== undefined
      ? editableNumbers[roomObj._id]
      : defaultLabel;

    return (
      <g key={roomObj?._id || `${x}-${y}`}>
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          fill="#ffffff"
          stroke={roomObj ? "#2563eb" : "#334155"}
          strokeWidth={roomObj ? "2" : "1.5"}
          rx="4"
        />
        {roomObj ? (
          <foreignObject x={x + 3} y={y + 3} width={w - 6} height={h - 6}>
            <div className="w-full h-full flex flex-col items-center justify-center p-0.5">
              <input
                type="text"
                value={currentNum}
                onChange={(e) => handleNumberChange(roomObj._id, e.target.value)}
                className="w-full text-center font-black text-blue-900 bg-blue-50 border border-blue-400 focus:border-blue-600 rounded text-xs py-0.5 outline-none shadow-xs"
              />
              <span className="text-[8px] font-bold text-gray-500 truncate max-w-full px-0.5 mt-0.5">{roomObj.name}</span>
            </div>
          </foreignObject>
        ) : (
          <text x={x + w / 2} y={y + h / 2 + 4} fill="#475569" fontSize="11" fontWeight="800" textAnchor="middle">
            {defaultLabel}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">Admin Floor Builder</span>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Movable & Adjustable Workspaces</span>
          </div>
          <h2 className="text-3xl font-bold font-display text-gray-900 tracking-tight">Floor Map & Classroom Builder</h2>
          <p className="text-gray-500 text-sm mt-1">
            Drag, adjust size, and place new classroom boxes directly on the floor map.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddingBox(!isAddingBox)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-100 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Classroom Box
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-green-100 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Map Changes
          </button>
        </div>
      </div>

      {/* Add Custom Classroom Popover Bar */}
      {isAddingBox && (
        <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-3xl animate-in fade-in space-y-4">
          <h3 className="text-sm font-black text-blue-900 uppercase tracking-wide flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" /> Create Adjustable Classroom Box
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-black text-blue-700 uppercase tracking-widest block mb-1">Room Number ID</label>
              <input
                type="text"
                placeholder="e.g. LH60 / CL16"
                value={newBoxNum}
                onChange={(e) => setNewBoxNum(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-gray-900"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-blue-700 uppercase tracking-widest block mb-1">Room Name</label>
              <input
                type="text"
                placeholder="e.g. Lecture Hall 60"
                value={newBoxName}
                onChange={(e) => setNewBoxName(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-gray-900"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-blue-700 uppercase tracking-widest block mb-1">Adjust Width / Height</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={boxWidth}
                  onChange={(e) => setBoxWidth(e.target.value)}
                  className="w-1/2 px-2 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold"
                  placeholder="Width"
                />
                <input
                  type="number"
                  value={boxHeight}
                  onChange={(e) => setBoxHeight(e.target.value)}
                  className="w-1/2 px-2 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold"
                  placeholder="Height"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleAddCustomBox}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Place Movable Box
              </button>
              <button
                onClick={() => setIsAddingBox(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Block Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="flex-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Select Building Block</label>
            <select
              value={selectedBlockId}
              onChange={(e) => setSelectedBlockId(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-sm font-bold text-gray-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-100 cursor-pointer w-full md:w-64"
            >
              {blocks.map(b => (
                <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Floor Level Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 shrink-0">Floor Level:</span>
          {[
            { level: 0, label: 'Ground Floor' },
            { level: 1, label: 'First Floor' },
            { level: 2, label: 'Second Floor' },
            { level: 3, label: 'Third Floor' }
          ].map((f) => (
            <button
              key={f.level}
              onClick={() => setActiveFloorLevel(f.level)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                activeFloorLevel === f.level
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Floor Structure Map Canvas with Drag & Drop */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative flex flex-col">
        <div className="p-4 bg-slate-100 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>{selectedBlock?.name} — Level {activeFloorLevel} Interactive Map Builder</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsDrawingPath(!isDrawingPath);
                if (!isDrawingPath) setPathPoints([]);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isDrawingPath ? 'bg-red-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              {isDrawingPath ? 'Cancel Path Draw' : 'Draw Path Line'}
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg">
              Drag & Place Classroom Boxes
            </span>
          </div>
        </div>

        <div className="p-6 bg-slate-200 overflow-auto flex items-center justify-center">
          <svg
            viewBox="0 0 920 480"
            className="w-full max-w-4xl h-auto rounded-2xl shadow-xl border border-gray-400 bg-white select-none"
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onClick={handleCanvasClickForPath}
          >
            {/* Outer Building Boundary */}
            <rect x="40" y="40" width="840" height="400" fill="#f8fafc" stroke="#334155" strokeWidth="3" />

            {/* --- COMPLETE ACADEMIC BLOCK CANVAS MAP --- */}
            {!isAdminBlock && (
              <g>
                {activeFloorLevel === 0 && (
                  <g>
                    {renderRoomBox(findRoomByNum('LH02'), 'LH02', 70, 60, 100, 90)}
                    {renderRoomBox(findRoomByNum('LH03'), 'LH03', 190, 60, 100, 90)}
                    <rect x="330" y="60" width="140" height="40" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
                    <text x="400" y="85" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">EXIT</text>
                    {renderRoomBox(findRoomByNum('LH04'), 'LH04', 510, 60, 100, 90)}
                    {renderRoomBox(findRoomByNum('LH05'), 'LH05', 630, 60, 100, 90)}

                    <rect x="70" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                    <text x="160" y="240" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>
                    <rect x="550" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                    <text x="640" y="240" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                    {renderRoomBox(findRoomByNum('LH01'), 'LH01', 70, 330, 180, 100)}
                    <rect x="320" y="380" width="160" height="50" fill="#ffffff" stroke="#dc2626" strokeWidth="2" />
                    <text x="400" y="412" fill="#dc2626" fontSize="13" fontWeight="900" textAnchor="middle">ENTRY</text>
                    {renderRoomBox(findRoomByNum('LH06'), 'LH06', 550, 330, 180, 100)}
                  </g>
                )}

                {activeFloorLevel === 1 && (
                  <g>
                    {renderRoomBox(findRoomByNum('LH08'), 'LH08', 70, 60, 100, 90)}
                    {renderRoomBox(findRoomByNum('LH09'), 'LH09', 190, 60, 100, 90)}
                    {renderRoomBox(findRoomByNum('LH10'), 'LH10', 510, 60, 100, 90)}
                    {renderRoomBox(findRoomByNum('LH11'), 'LH11', 630, 60, 100, 90)}

                    <rect x="70" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                    <text x="160" y="240" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>
                    <rect x="310" y="190" width="180" height="100" rx="12" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
                    <rect x="550" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                    <text x="640" y="240" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                    {renderRoomBox(findRoomByNum('LH07'), 'LH07', 70, 330, 180, 100)}
                    {renderRoomBox(findRoomByNum('LH12'), 'LH12', 550, 330, 180, 100)}
                  </g>
                )}

                {activeFloorLevel === 2 && (
                  <g>
                    {renderRoomBox(findRoomByNum('LH14'), 'LH14', 70, 60, 100, 90)}
                    <rect x="230" y="60" width="340" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                    <text x="400" y="102" fill="#dc2626" fontSize="14" fontWeight="900" textAnchor="middle">SEMINAR HALL - 1</text>
                    {renderRoomBox(findRoomByNum('LH15'), 'LH15', 630, 60, 100, 90)}

                    <rect x="70" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                    <text x="160" y="240" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>
                    <rect x="310" y="190" width="180" height="100" rx="12" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
                    <rect x="550" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                    <text x="640" y="240" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                    {renderRoomBox(findRoomByNum('LH13'), 'LH13', 70, 330, 180, 100)}
                    {renderRoomBox(findRoomByNum('LH16'), 'LH16', 550, 330, 180, 100)}
                  </g>
                )}

                {activeFloorLevel === 3 && (
                  <g>
                    {renderRoomBox(findRoomByNum('LH18'), 'LH18', 70, 60, 100, 90)}
                    {renderRoomBox(findRoomByNum('LH19'), 'LH19', 190, 60, 90, 90)}
                    {renderRoomBox(findRoomByNum('LH20'), 'LH20', 290, 60, 90, 90)}
                    {renderRoomBox(findRoomByNum('LH21'), 'LH21', 390, 60, 90, 90)}
                    {renderRoomBox(findRoomByNum('LH22'), 'LH22', 610, 60, 120, 90)}

                    <rect x="310" y="190" width="180" height="100" rx="12" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
                    <rect x="550" y="180" width="180" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                    <text x="640" y="240" fill="#dc2626" fontSize="12" fontWeight="900" textAnchor="middle">STAIRS</text>

                    {renderRoomBox(findRoomByNum('LH17'), 'LH17', 70, 330, 150, 100)}
                    {renderRoomBox(findRoomByNum('LH23A'), 'LH23A', 230, 330, 100, 100)}
                    {renderRoomBox(findRoomByNum('LH23B'), 'LH23B', 340, 330, 100, 100)}
                    {renderRoomBox(findRoomByNum('LH23'), 'LH23', 550, 330, 180, 100)}
                  </g>
                )}
              </g>
            )}

            {/* --- COMPLETE ADMINISTRATIVE BLOCK CANVAS MAP --- */}
            {isAdminBlock && (
              <g>
                {/* GROUND FLOOR (LEVEL 0) */}
                {activeFloorLevel === 0 && (
                  <g>
                    <rect x="50" y="50" width="80" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                    <text x="90" y="85" fill="#a855f7" fontSize="10" fontWeight="900" textAnchor="middle">MECH LAB</text>

                    {renderRoomBox(findRoomByNum('LH52'), 'LH52', 130, 50, 55, 70)}
                    {renderRoomBox(findRoomByNum('LH51'), 'LH51', 185, 50, 55, 70)}

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

                    {renderRoomBox(findRoomByNum('LH50'), 'LH50', 580, 200, 70, 60)}

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

                    {/* FIRST FLOOR (LEVEL 1) */}
                    {activeFloorLevel === 1 && (
                      <g>
                        <rect x="50" y="50" width="80" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="90" y="85" fill="#1e40af" fontSize="10" fontWeight="900" textAnchor="middle">E-CELL</text>
                        <rect x="130" y="50" width="80" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="170" y="85" fill="#a855f7" fontSize="10" fontWeight="900" textAnchor="middle">ECE LAB</text>
                        <rect x="210" y="50" width="90" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="255" y="85" fill="#1e40af" fontSize="10" fontWeight="900" textAnchor="middle">ECE DEPT</text>

                        <rect x="480" y="50" width="150" height="50" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="555" y="80" fill="#1e40af" fontSize="10" fontWeight="900" textAnchor="middle">AIML DEPT</text>
                        <rect x="480" y="105" width="110" height="45" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="535" y="132" fill="#1e40af" fontSize="10" fontWeight="900" textAnchor="middle">IT DEPT</text>

                        {renderRoomBox(findRoomByNum('CL07'), 'CL07', 595, 105, 85, 45)}

                        <rect x="685" y="50" width="180" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="775" y="105" fill="#1e40af" fontSize="12" fontWeight="900" textAnchor="middle">EXAM CELL</text>

                        {renderRoomBox(findRoomByNum('LH47'), 'LH47', 50, 200, 80, 60)}
                        {renderRoomBox(findRoomByNum('CL12'), 'CL12', 130, 200, 70, 60)}
                        {renderRoomBox(findRoomByNum('LH46'), 'LH46', 200, 200, 75, 60)}

                        {renderRoomBox(findRoomByNum('LH30'), 'LH30', 480, 200, 100, 60)}
                        <rect x="585" y="200" width="130" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="650" y="235" fill="#a855f7" fontSize="10" fontWeight="900" textAnchor="middle">BIO-TECH LAB</text>
                        <rect x="720" y="200" width="145" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="792" y="235" fill="#a855f7" fontSize="10" fontWeight="900" textAnchor="middle">PLANT LAB</text>

                        <rect x="50" y="300" width="55" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="77" y="335" fill="#1e40af" fontSize="9" fontWeight="900" textAnchor="middle">CHEM</text>
                        <rect x="105" y="300" width="55" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="132" y="335" fill="#1e40af" fontSize="9" fontWeight="900" textAnchor="middle">ENG</text>
                        <rect x="160" y="300" width="55" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="187" y="335" fill="#a855f7" fontSize="9" fontWeight="900" textAnchor="middle">PHY LAB</text>
                        <rect x="215" y="300" width="60" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="245" y="335" fill="#a855f7" fontSize="9" fontWeight="900" textAnchor="middle">PROZONE</text>

                        {renderRoomBox(findRoomByNum('LH36'), 'LH36', 480, 300, 80, 60)}
                        {renderRoomBox(findRoomByNum('CL01'), 'CL01', 560, 300, 90, 60)}
                        <rect x="650" y="300" width="110" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="705" y="335" fill="#1e40af" fontSize="10" fontWeight="900" textAnchor="middle">CSE DEPT</text>
                        {renderRoomBox(findRoomByNum('LH37'), 'LH37', 760, 300, 105, 60)}
                      </g>
                    )}

                    {/* SECOND FLOOR (LEVEL 2) */}
                    {activeFloorLevel === 2 && (
                      <g>
                        <rect x="50" y="50" width="100" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="100" y="85" fill="#a855f7" fontSize="9" fontWeight="900" textAnchor="middle">ELECTRONICS LAB</text>
                        {renderRoomBox(findRoomByNum('CL10'), 'CL10', 150, 50, 50, 70)}
                        {renderRoomBox(findRoomByNum('CL09'), 'CL09', 200, 50, 90, 70)}
                        <rect x="480" y="50" width="70" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="515" y="85" fill="#1e40af" fontSize="8" fontWeight="900" textAnchor="middle">MATHS DEPT</text>
                        {renderRoomBox(findRoomByNum('CL13'), 'CL13', 550, 50, 60, 70)}
                        {renderRoomBox(findRoomByNum('LH24'), 'LH24', 610, 50, 80, 70)}
                        {renderRoomBox(findRoomByNum('LH25'), 'LH25', 690, 50, 80, 70)}
                        {renderRoomBox(findRoomByNum('LH26'), 'LH26', 770, 50, 95, 70)}

                        {renderRoomBox(findRoomByNum('LH49'), 'LH49', 50, 200, 80, 60)}
                        {renderRoomBox(findRoomByNum('CL06'), 'CL06', 130, 200, 70, 60)}
                        {renderRoomBox(findRoomByNum('LH48'), 'LH48', 200, 200, 75, 60)}

                        {renderRoomBox(findRoomByNum('LH32'), 'LH32', 480, 200, 70, 60)}
                        {renderRoomBox(findRoomByNum('LH53'), 'LH53', 550, 200, 70, 60)}
                        {renderRoomBox(findRoomByNum('LH54'), 'LH54', 620, 200, 70, 60)}
                        {renderRoomBox(findRoomByNum('LH55'), 'LH55', 690, 200, 80, 60)}
                        {renderRoomBox(findRoomByNum('LH33'), 'LH33', 770, 200, 95, 60)}

                        {renderRoomBox(findRoomByNum('LH43'), 'LH43', 50, 300, 80, 60)}
                        {renderRoomBox(findRoomByNum('CL11'), 'CL11', 130, 300, 70, 60)}
                        {renderRoomBox(findRoomByNum('LH42'), 'LH42', 200, 300, 75, 60)}
                        {renderRoomBox(findRoomByNum('LH38'), 'LH38', 480, 300, 95, 60)}
                        {renderRoomBox(findRoomByNum('CL02'), 'CL02', 575, 300, 90, 60)}
                        {renderRoomBox(findRoomByNum('CL03'), 'CL03', 665, 300, 90, 60)}
                        {renderRoomBox(findRoomByNum('LH39'), 'LH39', 755, 300, 110, 60)}
                      </g>
                    )}

                    {/* THIRD FLOOR (LEVEL 3) */}
                    {activeFloorLevel === 3 && (
                      <g>
                        <rect x="50" y="50" width="225" height="100" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="162" y="105" fill="#dc2626" fontSize="14" fontWeight="900" textAnchor="middle">AUDITORIUM</text>

                        <rect x="480" y="50" width="65" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="512" y="85" fill="#a855f7" fontSize="8" fontWeight="900" textAnchor="middle">BME LAB1</text>
                        <rect x="550" y="50" width="65" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="582" y="85" fill="#a855f7" fontSize="8" fontWeight="900" textAnchor="middle">BME LAB2</text>
                        <rect x="620" y="50" width="65" height="70" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="652" y="85" fill="#a855f7" fontSize="8" fontWeight="900" textAnchor="middle">BME LAB3</text>

                        {renderRoomBox(findRoomByNum('LH28'), 'LH28', 690, 50, 85, 70)}
                        {renderRoomBox(findRoomByNum('LH27'), 'LH27', 780, 50, 85, 70)}

                        <rect x="50" y="200" width="110" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="105" y="235" fill="#1e40af" fontSize="10" fontWeight="900" textAnchor="middle">BALL ROOM</text>
                        <rect x="160" y="200" width="115" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="217" y="235" fill="#a855f7" fontSize="10" fontWeight="900" textAnchor="middle">INTEL AI LAB</text>

                        {renderRoomBox(findRoomByNum('LH34'), 'LH34', 480, 200, 70, 60)}
                        {renderRoomBox(findRoomByNum('LH34A'), 'LH34A', 550, 200, 70, 60)}
                        {renderRoomBox(findRoomByNum('LH34B'), 'LH34B', 620, 200, 70, 60)}
                        {renderRoomBox(findRoomByNum('LH34C'), 'LH34C', 690, 200, 85, 60)}

                        {renderRoomBox(findRoomByNum('LH45'), 'LH45', 50, 300, 50, 60)}
                        <rect x="100" y="300" width="80" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="140" y="328" fill="#1e40af" fontSize="8" fontWeight="900" textAnchor="middle">AIDS DEPT</text>
                        {renderRoomBox(findRoomByNum('CL15'), 'CL15', 100, 320, 80, 40)}
                        {renderRoomBox(findRoomByNum('CL14'), 'CL14', 180, 300, 50, 60)}
                        {renderRoomBox(findRoomByNum('LH44'), 'LH44', 230, 300, 45, 60)}

                        {renderRoomBox(findRoomByNum('LH40'), 'LH40', 480, 300, 65, 60)}
                        <rect x="545" y="300" width="105" height="60" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="597" y="335" fill="#1e40af" fontSize="8" fontWeight="900" textAnchor="middle">CYBER SECURITY</text>
                        {renderRoomBox(findRoomByNum('CL04'), 'CL04', 650, 300, 80, 60)}
                        {renderRoomBox(findRoomByNum('LH41'), 'LH41', 730, 300, 135, 60)}
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

            {/* --- RENDER DYNAMIC CUSTOM MOVABLE & DRAGGABLE BOXES --- */}
            {customBoxes.map((box) => (
              <g key={box.id} onMouseDown={(e) => handleBoxMouseDown(e, box)} className="cursor-move">
                <rect
                  x={box.x}
                  y={box.y}
                  width={box.w}
                  height={box.h}
                  fill="#dbeafe"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  rx="6"
                />
                <text x={box.x + box.w / 2} y={box.y + box.h / 2 - 4} fill="#1e3a8a" fontSize="12" fontWeight="900" textAnchor="middle">
                  {box.roomNumber}
                </text>
                <text x={box.x + box.w / 2} y={box.y + box.h / 2 + 10} fill="#3b82f6" fontSize="8" fontWeight="700" textAnchor="middle">
                  {box.name}
                </text>

                {/* Move Icon Badge */}
                <circle cx={box.x + box.w - 8} cy={box.y + 8} r="6" fill="#2563eb" />
                <path d={`M ${box.x + box.w - 10} ${box.y + 8} L ${box.x + box.w - 6} ${box.y + 8}`} stroke="#ffffff" strokeWidth="1.5" />
              </g>
            ))}

            {/* --- RENDER CUSTOM DRAWN PATH LINES --- */}
            {pathPoints.length > 1 && (
              <polyline
                points={pathPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#dc2626"
                strokeWidth="5"
                strokeDasharray="8 6"
              />
            )}

            {/* Path Points Markers */}
            {pathPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
            ))}
          </svg>
        </div>

        <div className="p-4 bg-slate-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Type inside any box to edit numbers. Click <b>Add Classroom Box</b> to create movable boxes that can be dragged across the map.</span>
          </div>
          <span className="font-bold text-gray-700">{rooms.length + customBoxes.length} workspaces on this floor</span>
        </div>
      </div>

      {/* Room Inventory List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-xl font-bold font-display text-gray-900 mb-6 flex items-center gap-2">
          <DoorOpen className="w-5 h-5 text-blue-600" /> Current Workspaces on Level {activeFloorLevel}
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((r) => (
            <div key={r._id} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-lg">{r.roomNumber}</span>
                  <span className="text-xs font-bold text-gray-900 truncate max-w-[120px]">{r.name}</span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{r.roomType} · {r.capacity} seats</p>
              </div>

              <button
                onClick={() => navigate(`/digital-twin/navigate/${r._id}`)}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 shrink-0"
              >
                <Navigation className="w-3.5 h-3.5" /> Find Path
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageRoomNumbersPage;
