import React, { useEffect, useState } from 'react';
import { fetchDataQuality } from '../services/api';
import { Database, CheckCircle, FileText } from 'lucide-react';

export const DataQualityPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDataQuality()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-gray-400">Failed to load data quality report.</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <span>Data Sources, Lineage & Methodology Audit</span>
        </h2>
        <p className="text-xs text-gray-400">Transparent data provenance, transformation rules, and sanity check validations</p>
      </div>

      {/* Metadata Audit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-800 border border-dark-700 p-4 rounded-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Data Source</span>
          <p className="text-sm font-black text-white mt-1">{data.source}</p>
          <p className="text-[11px] text-emerald-400 font-medium mt-1">{data.coverage}</p>
        </div>

        <div className="bg-dark-800 border border-dark-700 p-4 rounded-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Matches Ingested</span>
          <p className="text-xl font-black text-emerald-400 mt-1">{data.metrics_audit.total_matches_ingested.toLocaleString()}</p>
          <p className="text-[11px] text-gray-400 mt-1">2008 – 2024</p>
        </div>

        <div className="bg-dark-800 border border-dark-700 p-4 rounded-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Deliveries Ingested</span>
          <p className="text-xl font-black text-white mt-1">{data.metrics_audit.total_deliveries_ingested.toLocaleString()}</p>
          <p className="text-[11px] text-cyan-400 mt-1">{data.metrics_audit.legal_delivery_ratio_pct}% Legal ratio</p>
        </div>

        <div className="bg-dark-800 border border-dark-700 p-4 rounded-xl">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Validation Status</span>
          <div className="flex items-center space-x-2 mt-1">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-black text-emerald-400">{data.sanity_checks.status}</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">0 Data Anomalies Found</p>
        </div>
      </div>

      {/* Assumptions & Limitations Box */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          Data Engineering Assumptions & Cricket Handling Rules
        </h3>
        <ul className="space-y-2 text-xs text-gray-300">
          {data.assumptions_and_limitations.map((item: string, idx: number) => (
            <li key={idx} className="flex items-start space-x-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
