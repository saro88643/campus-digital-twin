import React from 'react';
import { Wrench, MapPin, Calendar, Clock } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';

const FacilityCard = ({ facility }) => {
  if (!facility) return null;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:border-slate-300">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <Wrench className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">
                {facility.name}
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {facility.blockId?.name || 'Campus Wide'}
              </span>
            </div>
          </div>
          <StatusBadge status={facility.status} />
        </div>

        {facility.description && (
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            {facility.description}
          </p>
        )}

        <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
          {facility.location && (
            <p className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{facility.location}</span>
            </p>
          )}
          {facility.availability && (
            <p className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{facility.availability}</span>
            </p>
          )}
          {facility.maintenanceDate && (
            <p className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>Maintenance: {formatDate(facility.maintenanceDate)}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacilityCard;
