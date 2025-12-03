import React from 'react';
import { MBTIType } from '../types';
import { Check } from 'lucide-react';

interface MBTICardProps {
  type: MBTIType;
  isSelected: boolean;
  onClick: (type: MBTIType) => void;
}

export const MBTICard: React.FC<MBTICardProps> = ({ type, isSelected, onClick }) => {
  return (
    <button
      onClick={() => onClick(type)}
      className={`
        relative p-4 rounded-xl border-2 text-left transition-all duration-200 w-full group
        ${isSelected 
          ? `border-indigo-500 bg-indigo-50 shadow-md` 
          : `border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm`
        }
      `}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-2xl font-bold ${type.color} tracking-tight`}>{type.code}</h3>
          <p className="text-sm font-semibold text-slate-700">{type.name}</p>
        </div>
        {isSelected && (
          <div className="bg-indigo-500 rounded-full p-1 text-white">
            <Check size={14} strokeWidth={3} />
          </div>
        )}
      </div>
      
      <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
        {type.description}
      </p>
      
      <div className="mt-3 flex flex-wrap gap-1">
        {type.keywords.slice(0, 2).map((k) => (
          <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider font-medium">
            {k}
          </span>
        ))}
      </div>
    </button>
  );
};
