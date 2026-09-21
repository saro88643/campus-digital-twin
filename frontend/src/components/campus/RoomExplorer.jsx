import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import RoomCard from './RoomCard';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { ROOM_TYPES, ROOM_STATUSES, FACILITY_KEYS, FACILITY_LABELS } from '../../utils/formatters';
import { roomService, blockService, floorService, departmentService } from '../../services/api';

const selectClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';

const RoomExplorer = ({ restrictTypes, initialBlockId, emptyLabel = 'No rooms match your search.' }) => {
  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [floors, setFloors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [query, setQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState(initialBlockId || 'all');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch initial master data
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setLoading(true);
        const [roomsRes, blocksRes, deptsRes] = await Promise.all([
          roomService.getAll(),
          blockService.getAll(),
          departmentService.getAll(),
        ]);
        if (roomsRes.data?.success) setRooms(roomsRes.data.data);
        if (blocksRes.data?.success) setBlocks(blocksRes.data.data);
        if (deptsRes.data?.success) setDepartments(deptsRes.data.data);
      } catch (err) {
        console.error('Error fetching room explorer data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMasterData();
  }, []);

  // Fetch floors whenever selectedBlock changes
  useEffect(() => {
    const fetchFloors = async () => {
      if (selectedBlock && selectedBlock !== 'all') {
        try {
          const res = await floorService.getAll(selectedBlock);
          if (res.data?.success) setFloors(res.data.data);
        } catch (err) {
          console.error('Error fetching floors for block:', err);
        }
      } else {
        try {
          const res = await floorService.getAll();
          if (res.data?.success) setFloors(res.data.data);
        } catch (err) {
          console.error('Error fetching all floors:', err);
        }
      }
    };
    fetchFloors();
  }, [selectedBlock]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rooms.filter((room) => {
      if (restrictTypes && !restrictTypes.includes(room.type)) return false;
      if (selectedBlock !== 'all') {
        const bId = room.blockId?._id || room.blockId;
        if (bId !== selectedBlock) return false;
      }
      if (selectedFloor !== 'all') {
        const fId = room.floorId?._id || room.floorId;
        if (fId !== selectedFloor) return false;
      }
      if (selectedDept !== 'all') {
        const dId = room.departmentId?._id || room.departmentId;
        if (dId !== selectedDept) return false;
      }
      if (selectedType !== 'all' && room.type !== selectedType) return false;
      if (selectedStatus !== 'all' && room.status !== selectedStatus) return false;
      if (selectedFacility !== 'all') {
        let hasFac = false;
        if (room.facilities) {
          if (room.facilities instanceof Map) {
            hasFac = !!room.facilities.get(selectedFacility);
          } else {
            hasFac = !!room.facilities[selectedFacility];
          }
        }
        if (!hasFac) return false;
      }

      if (!q) return true;

      const searchableFields = [
        room.roomNumber,
        room.name,
        room.code,
        room.type,
        room.purpose,
        room.assignedStaff,
        room.blockId?.name,
        room.blockId?.code,
        room.departmentId?.name,
        room.departmentId?.code,
      ];

      return searchableFields
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(q));
    });
  }, [
    rooms,
    restrictTypes,
    selectedBlock,
    selectedFloor,
    selectedDept,
    selectedType,
    selectedStatus,
    selectedFacility,
    query,
  ]);

  const activeFiltersCount = [
    selectedBlock,
    selectedFloor,
    selectedDept,
    selectedType,
    selectedStatus,
    selectedFacility,
  ].filter((v) => v !== 'all').length;

  const handleResetFilters = () => {
    setSelectedBlock('all');
    setSelectedFloor('all');
    setSelectedDept('all');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedFacility('all');
    setQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by room number, name, type, staff, or department..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-8 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {(activeFiltersCount > 0 || query) && (
              <button
                onClick={handleResetFilters}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Block
              </label>
              <select
                value={selectedBlock}
                onChange={(e) => {
                  setSelectedBlock(e.target.value);
                  setSelectedFloor('all');
                }}
                className={selectClass}
              >
                <option value="all">All Blocks</option>
                {blocks.map((b) => (
                  <option key={b._id || b.id} value={b._id || b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Floor
              </label>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className={selectClass}
              >
                <option value="all">All Floors</option>
                {floors.map((f) => (
                  <option key={f._id || f.id} value={f._id || f.id}>
                    {f.blockId?.name ? `${f.blockId.name} · ` : ''}
                    {f.name} (Level {f.floorNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className={selectClass}
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id || d.id} value={d._id || d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Room Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={selectClass}
              >
                <option value="all">All Room Types</option>
                {(restrictTypes || ROOM_TYPES).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={selectClass}
              >
                <option value="all">All Statuses</option>
                {ROOM_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Facility Available
              </label>
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className={selectClass}
              >
                <option value="all">Any Facility</option>
                {FACILITY_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {FACILITY_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {loading ? (
        <LoadingSpinner label="Loading classrooms & facilities..." />
      ) : filteredRooms.length === 0 ? (
        <EmptyState
          title="No matching rooms"
          description={emptyLabel}
          action={
            activeFiltersCount > 0 || query ? (
              <button
                onClick={handleResetFilters}
                className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-medium text-white hover:bg-teal-700 transition-colors"
              >
                Clear all filters
              </button>
            ) : null
          }
        />
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Showing <span className="font-bold text-slate-800">{filteredRooms.length}</span> rooms
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRooms.map((room) => (
              <RoomCard key={room._id || room.id} room={room} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomExplorer;
