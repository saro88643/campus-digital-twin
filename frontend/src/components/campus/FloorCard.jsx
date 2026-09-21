import React from 'react';
import { Layers, DoorOpen } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const FloorCard = ({ floor, onClick, isSelected }) => {
  if (!floor) return null;

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 ${
        isSelected
          ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/20 shadow-xs'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
            <Layers className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{floor.name}</h4>
            <p className="text-xs text-slate-400 font-medium">
              Level {floor.floorNumber}
            </p>
          </div>
        </div>
        <StatusBadge status={floor.status} />
      </div>
      {floor.description && (
        <p className="mt-2 text-xs text-slate-500 line-clamp-1">{floor.description}</p>
      )}
      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <DoorOpen className="h-3.5 w-3.5" />
        <span>{floor.roomCount ?? 0} Rooms</span>
      </div>
    </div>
  );
};

export default FloorCard;
