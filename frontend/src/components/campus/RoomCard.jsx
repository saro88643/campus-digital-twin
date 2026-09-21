import React from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { FACILITY_KEYS, FACILITY_LABELS } from '../../utils/formatters';

const RoomCard = ({ room }) => {
  if (!room) return null;

  const blockName = room.blockId?.name || room.blockName || '';
  const floorName = room.floorId?.name || room.floorName || '';
  const deptCode = room.departmentId?.code || room.departmentCode || '';

  // Extract active facilities
  let activeFacilities = [];
  if (room.facilities) {
    if (typeof room.facilities === 'object') {
      activeFacilities = FACILITY_KEYS.filter((key) => {
        if (room.facilities instanceof Map) {
          return room.facilities.get(key);
        }
        return room.facilities[key];
      });
    }
  }

  return (
    <Link
      to={`/rooms/${room._id || room.id}`}
      className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-500/50 hover:shadow-md"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-display text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
              {room.roomNumber}
            </span>
            <p className="mt-0.5 text-xs text-slate-500 font-medium line-clamp-1">
              {room.name}
            </p>
          </div>
          <StatusBadge status={room.status} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
            {room.type}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            {room.capacity} seats
          </span>
          {blockName && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {blockName} {floorName ? `· ${floorName}` : ''}
            </span>
          )}
        </div>

        {deptCode && (
          <p className="mt-2 text-xs text-slate-400 font-medium">
            Dept: <span className="text-slate-600">{deptCode}</span>
          </p>
        )}
      </div>

      {activeFacilities.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
          {activeFacilities.slice(0, 3).map((k) => (
            <span
              key={k}
              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
            >
              {FACILITY_LABELS[k] || k}
            </span>
          ))}
          {activeFacilities.length > 3 && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
              +{activeFacilities.length - 3} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
};

export default RoomCard;
