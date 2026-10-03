import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeColor?: string;
  image?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  image
}) => {
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-3 sm:p-4 shadow-sm hover:border-dark-600 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">
          {title}
        </span>
        {image ? (
          <img src={image} alt={title} className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0" />
        ) : (
          Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-1 flex-wrap">
        <span className="text-lg sm:text-2xl font-black text-white tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {badge && (
          <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[10px] sm:text-[11px] text-gray-500 font-medium truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};

