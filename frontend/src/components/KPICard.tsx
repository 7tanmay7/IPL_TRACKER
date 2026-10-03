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
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 shadow-sm hover:border-dark-600 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </span>
        {image ? (
          <img src={image} alt={title} className="w-7 h-7 object-contain" />
        ) : (
          Icon && <Icon className="w-4 h-4 text-emerald-400" />
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-2xl font-black text-white tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[11px] text-gray-500 font-medium truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
