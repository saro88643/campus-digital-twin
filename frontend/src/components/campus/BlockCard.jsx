import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Layers, DoorOpen, MapPin } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const BlockCard = ({ block }) => {
  if (!block) return null;

  return (
    <Link
      to={`/blocks/${block._id || block.id}`}
      className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-500/50 hover:shadow-md"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                {block.name}
              </h3>
              <span className="inline-block text-xs font-semibold text-slate-400">
                Code: {block.code}
              </span>
            </div>
          </div>
          <StatusBadge status={block.status} />
        </div>

        {block.description && (
          <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {block.description}
          </p>
        )}

        {block.location && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{block.location}</span>
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4 pt-3 border-t border-slate-100 text-xs font-medium text-slate-600">
        <span className="flex items-center gap-1">
          <Layers className="h-3.5 w-3.5 text-slate-400" />
          {block.floorCount ?? 0} Floors
        </span>
        <span className="flex items-center gap-1">
          <DoorOpen className="h-3.5 w-3.5 text-slate-400" />
          {block.roomCount ?? 0} Rooms
        </span>
      </div>
    </Link>
  );
};

export default BlockCard;
