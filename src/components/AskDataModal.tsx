import React, { useState } from 'react';
import { Sparkles, X, Send, Database, Table } from 'lucide-react';
import { askDataQuestion } from '../services/api';

interface AskDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AskDataModal: React.FC<AskDataModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await askDataQuestion(query);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "Who are the highest scoring batters in death overs?",
    "Which bowlers have the best economy rate in death overs?",
    "Who are the top six hitters in IPL history?",
    "Which team has the highest win percentage?"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-dark-800 border border-dark-700 rounded-xl sm:rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-dark-700 flex items-center justify-between bg-dark-900/50">
          <div className="flex items-center space-x-2 pr-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            <h2 className="font-bold text-white text-xs sm:text-sm truncate">Ask the Data — Natural Language Query Assistant</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-md shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-4">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Who are the highest scoring batters in death overs with at least 100 balls?"
              className="flex-1 bg-dark-900 border border-dark-700 rounded-lg px-3.5 sm:px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 w-full"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto shrink-0"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Query</span>
                </>
              )}
            </button>
          </form>

          {/* Sample Prompts */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium w-full sm:w-auto">Try asking:</span>
            {sampleQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => setQuery(sq)}
                className="bg-dark-700/60 hover:bg-dark-700 text-gray-300 text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full border border-dark-600 transition-all text-left truncate max-w-full"
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Result Output */}
          {result && (
            <div className="mt-4 bg-dark-900 border border-dark-700 rounded-xl p-3 sm:p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{result.summary}</span>
                </span>
              </div>

              {/* SQL Code snippet */}
              <div className="bg-black/50 rounded-lg p-2.5 text-[10px] sm:text-[11px] font-mono text-gray-400 border border-dark-700 overflow-x-auto">
                <p className="text-gray-400 font-bold mb-1">// Generated SQL Execution:</p>
                <code className="whitespace-pre-wrap break-all">{result.executed_sql}</code>
              </div>

              {/* Data Table */}
              {result.data && result.data.length > 0 && (
                <div className="overflow-x-auto border border-dark-700 rounded-lg max-w-full">
                  <table className="w-full text-left text-[11px] text-gray-300 min-w-max">
                    <thead className="bg-dark-800 text-gray-400 uppercase font-semibold text-[10px]">
                      <tr>
                        {result.columns.map((col: string) => (
                          <th key={col} className="px-3 py-2 border-b border-dark-700 whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700/50">
                      {result.data.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-dark-800/50">
                          {result.columns.map((col: string) => (
                            <td key={col} className="px-3 py-2 font-mono whitespace-nowrap">{row[col]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

