import { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Layers,
  DoorOpen,
  ChevronRight,
  Users,
  Search,
  MapPin,
  Circle,
  X
} from 'lucide-react';
import api from '../services/api';
import { getStatusTone } from '../utils/formatters';
import { Link } from 'react-router-dom';

const CampusTwinPage = () => {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campusInfo, setCampusInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [campusRes, blocksRes] = await Promise.all([
        api.get('/campus'),
        api.get('/blocks')
      ]);

      setCampusInfo(campusRes.data.data);
      const fetchedBlocks = blocksRes.data.data;
      setBlocks(fetchedBlocks);

      if (fetchedBlocks.length > 0) {
        handleBlockSelect(fetchedBlocks[0]);
      }
    } catch (error) {
      console.error('Error fetching initial data');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockSelect = async (block) => {
    setSelectedBlock(block);
    setSelectedFloor(null);
    setRooms([]);
    try {
      const { data } = await api.get(`/blocks/${block._id}`);
      setFloors(data.floors || []);
      if (data.floors?.length > 0) {
        handleFloorSelect(data.floors[0]);
      }
    } catch (error) {
      console.error('Error fetching floors');
    }
  };

  const handleFloorSelect = async (floor) => {
    setSelectedFloor(floor);
    try {
      const { data } = await api.get(`/rooms?floorId=${floor._id}`);
      setRooms(data.data || []);
    } catch (error) {
      console.error('Error fetching rooms');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display text-gray-900 tracking-tight">Campus Twin</h2>
          <p className="text-gray-500 text-sm font-medium">
            {campusInfo?.name} · interactive campus structure
          </p>
        </div>

        <div className="relative group max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 bg-white px-4 py-2 rounded-xl border border-gray-100 w-fit">
        <span className="font-semibold text-blue-600 cursor-pointer">Campus</span>
        {selectedBlock && (
          <>
            <ChevronRight className="w-4 h-4 opacity-50" />
            <span className="font-semibold text-gray-900">{selectedBlock.name}</span>
          </>
        )}
        {selectedFloor && (
          <>
            <ChevronRight className="w-4 h-4 opacity-50" />
            <span className="font-semibold text-gray-600">{selectedFloor.name}</span>
          </>
        )}
      </nav>

      {/* Interactive Grid */}
      <div className="grid gap-6 lg:grid-cols-[280px_220px_1fr]">

        {/* Column 1: BLOCKS */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
            <Building2 className="w-3.5 h-3.5" /> BLOCKS ({blocks.length})
          </h3>
          <div className="space-y-2">
            {blocks.map((block) => (
              <button
                key={block._id}
                onClick={() => handleBlockSelect(block)}
                className={`
                  w-full p-4 rounded-2xl text-left transition-all border
                  ${selectedBlock?._id === block._id
                    ? 'border-blue-500 bg-white ring-4 ring-blue-50 shadow-md'
                    : 'border-transparent bg-white shadow-sm hover:border-gray-200'}
                `}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-black text-gray-900 truncate">{block.name}</p>
                  <span className="shrink-0 bg-gray-100 text-gray-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase border border-gray-200">
                    {block.code}
                  </span>
                </div>
                <p className="mt-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                  2 floors · 5 rooms
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Column 2: FLOORS */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
            <Layers className="w-3.5 h-3.5" /> FLOORS
          </h3>
          <div className="space-y-2">
            {floors.length === 0 ? (
              <div className="p-8 bg-white/50 rounded-2xl border border-dashed text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase">No levels defined</p>
              </div>
            ) : (
              [...floors].reverse().map((floor) => (
                <button
                  key={floor._id}
                  onClick={() => handleFloorSelect(floor)}
                  className={`
                    w-full p-4 rounded-2xl text-left transition-all border
                    ${selectedFloor?._id === floor._id
                      ? 'border-blue-500 bg-white ring-4 ring-blue-50 shadow-md'
                      : 'border-transparent bg-white shadow-sm hover:border-gray-200'}
                  `}
                >
                  <p className="text-sm font-black text-gray-900">{floor.name}</p>
                  <p className="mt-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                    {rooms.length} rooms
                  </p>
                </button>
              ))
            )}
          </div>
        </section>

        {/* Column 3: FLOOR PLAN */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
            <DoorOpen className="w-3.5 h-3.5" /> FLOOR PLAN
          </h3>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden min-h-[500px]">
            {selectedFloor ? (
              <>
                <div className="p-8 border-b border-gray-50 flex items-start justify-between bg-white/50">
                  <div>
                    <h4 className="text-xl font-black font-display text-gray-900">
                      {selectedBlock?.name} — {selectedFloor.name}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      {selectedFloor.description || 'Institutional operational unit area.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1.5 rounded-xl border border-green-100">
                    <Circle className="w-2 h-2 fill-current animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                  </div>
                </div>

                <div className="p-8">
                  {rooms.length === 0 ? (
                    <div className="py-24 text-center">
                      <DoorOpen className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                      <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Floor Plan Empty</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {rooms.map((room) => (
                        <Link
                          key={room._id}
                          to={`/rooms/${room._id}`}
                          className="p-5 rounded-[2rem] border-2 border-dashed border-gray-100 bg-gray-50/20 hover:border-blue-400 hover:bg-white hover:shadow-2xl hover:shadow-blue-900/10 transition-all cursor-pointer group relative"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">{room.roomNumber}</span>
                            <div className={`px-2.5 py-1 rounded-full border text-[8px] font-black uppercase tracking-tighter ${getStatusTone(room.status)}`}>
                              {room.status}
                            </div>
                          </div>

                          <h5 className="text-xs font-bold text-gray-600 mb-1 truncate">{room.name}</h5>

                          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase">
                              <Users className="w-3 h-3" />
                              <span>{room.capacity}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase">
                              <DoorOpen className="w-3 h-3" />
                              <span>{room.roomType}</span>
                            </div>
                          </div>

                          <div className="mt-2 text-[9px] font-black text-blue-500 uppercase tracking-widest">
                            {room.department?.code || 'ADMIN'}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="mt-12 pt-6 border-t border-gray-50 flex items-center gap-3 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span>Corridor runs along the front of every room shown above.</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-48 text-center">
                <div className="bg-gray-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Building2 className="w-10 h-10 opacity-10" />
                </div>
                <h4 className="text-lg font-black text-gray-900 font-display">Structure View</h4>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Select block & floor to visualize</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CampusTwinPage;
