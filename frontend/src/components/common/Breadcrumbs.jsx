import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Breadcrumbs = ({ items = [] }) => {
  return (
    <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-500">
      <Link to="/campus" className="font-medium hover:text-slate-900 transition-colors">
        Campus
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            {isLast || !item.to ? (
              <span className="font-semibold text-slate-900">{item.label}</span>
            ) : (
              <Link to={item.to} className="font-medium hover:text-slate-900 transition-colors">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
