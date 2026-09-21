import React from 'react';
import { Boxes, User, Mail, Phone, DoorOpen } from 'lucide-react';

const DepartmentCard = ({ department }) => {
  if (!department) return null;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:border-slate-300">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Boxes className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">
                {department.name}
              </h3>
              <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {department.code}
              </span>
            </div>
          </div>
        </div>

        {department.description && (
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            {department.description}
          </p>
        )}

        <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
          {department.headName && (
            <p className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-700">{department.headName}</span>
            </p>
          )}
          {department.email && (
            <p className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <a
                href={`mailto:${department.email}`}
                className="text-teal-600 hover:underline"
              >
                {department.email}
              </a>
            </p>
          )}
          {department.phone && (
            <p className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{department.phone}</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1.5">
          <DoorOpen className="h-3.5 w-3.5 text-slate-400" />
          {department.roomCount ?? 0} Associated Rooms
        </span>
      </div>
    </div>
  );
};

export default DepartmentCard;
