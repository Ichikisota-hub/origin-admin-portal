
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { RankingRecord } from '../types';
import { Trophy, Award, TrendingUp, RefreshCw, Star } from 'lucide-react';

const Ranking: React.FC = () => {
  const [rankings, setRankings] = useState<RankingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      // Fetching from the ranking_contracts view as per requirement
      const { data, error } = await supabase
        .from('ranking_contracts')
        .select('*');
      
      if (error) throw error;
      
      // Data is expected to be ranking information
      // Fixed: changed contract_count to total_contracts to match RankingRecord interface
      const sortedData = (data as RankingRecord[]).sort((a, b) => b.total_contracts - a.total_contracts);
      setRankings(sortedData);
    } catch (err) {
      console.error('Error fetching rankings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  const getBadgeStyle = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md shadow-orange-100/50";
    if (index === 1) return "bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-md shadow-slate-100/50";
    if (index === 2) return "bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-md shadow-red-100/50";
    return "bg-slate-100 text-slate-500 border border-slate-200";
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
              Live Overview
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Contract Rankings</h1>
          <p className="text-slate-500 mt-2 text-lg">Real-time performance metrics for all active agents.</p>
        </div>
        <button 
          onClick={fetchRankings}
          className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-95"
        >
          <RefreshCw size={18} className="group-active:rotate-180 transition-transform duration-500" />
          <span className="font-semibold text-sm">Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-white/40 animate-pulse rounded-3xl border border-slate-100"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {rankings.map((item, index) => (
            <div
              key={item.id || index}
              className="flex items-center justify-between p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-0.5 group"
            >
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 flex items-center justify-center rounded-2xl font-black text-xl ${getBadgeStyle(index)}`}>
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">{item.player_name}</h3>
                    {index < 3 && <Star className="text-yellow-400 fill-yellow-400" size={16} />}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-1">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span className="font-medium tracking-tight">Consistent Performer</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right border-r border-slate-100 pr-8 hidden sm:block">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-tighter block mb-1">Status</span>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-full">ACTIVE</span>
                </div>
                <div className="text-right min-w-[100px]">
                  <span className="block text-3xl font-black text-slate-900 tracking-tighter leading-none mb-1">
                    {/* Fixed: changed contract_count to total_contracts */}
                    {item.total_contracts}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Contracts
                  </span>
                </div>
              </div>
            </div>
          ))}

          {rankings.length === 0 && (
            <div className="text-center py-24 bg-white/40 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="text-slate-300" size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No Data Available</h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">Rankings will appear here once contracts are recorded in the system.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Ranking;
