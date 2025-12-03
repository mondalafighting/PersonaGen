import React from 'react';
import { ArtStyle } from '../types';
import { ART_STYLES } from '../constants';

interface StyleSelectorProps {
  selectedStyle: ArtStyle;
  onSelect: (style: ArtStyle) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
      {ART_STYLES.map((style) => (
        <button
          key={style.id}
          onClick={() => onSelect(style)}
          className={`
            flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
            ${selectedStyle.id === style.id
              ? 'bg-slate-800 text-white border-slate-800 shadow-md'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
            }
          `}
        >
          {style.name}
        </button>
      ))}
    </div>
  );
};
