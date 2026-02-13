
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { RankingRecord } from '../../types';
import { Trophy, TrendingUp, RefreshCw, Star, Crown } from 'lucide-react';

const RankingPage: React.FC = () => {
  const [rankings, setRankings] = useState<RankingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ranking_contracts")
        .select("*")
        .order("total_contracts", { ascending: false });
      
      if (error) throw error;
      setRankings(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  const getRankBadge = (index: number) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg shadow-orange-100";
    if (index === 1) return "bg-gradient-to-r from-slate-300 to-slate-500 text-white shadow-lg shadow-slate-100";
    if (index === 2) return "bg-gradient-to-r from-orange-300 to-red-400 text-white shadow-lg shadow-red-100";
    return "bg-slate-100 text-slate-500 border border-slate-200";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">ORIGIN ADMIN PORTAL</h1>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">成約ランキング</h2>
        </div>
        <button 
          onClick={fetchRankings}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-black hover:border-slate-400 transition-all shadow-sm active:scale-95"
        >
          <RefreshCw size={22} className={`${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-white/40 animate-pulse rounded-3xl border border-white"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {rankings.map((item, index) => (
            <div
              key={item.id || index}
              className="flex items-center justify-between p-6 rounded-3xl bg-white/80 backdrop-blur-xl shadow-sm border border-white hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 flex items-center justify-center rounded-2xl font-black text-xl ${getRankBadge(index)}`}>
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{item.player_name}</h3>
                    {index === 0 && <Crown size={16} className="text-yellow-500 fill-yellow-500" />}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                    <TrendingUp size={12} className="text-emerald-500" />
                    <span>Rising Performance</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex items-center gap-8">
                <div className="hidden sm:block text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter block mb-0.5">Category</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full">Top Agent</span>
                </div>
                <div className="min-w-[80px]">
                  <span className="block text-3xl font-black text-slate-900 tracking-tighter leading-none">
                    {item.total_contracts}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 block">
                    Contracts
                  </span>
                </div>
              </div>
            </div>
          ))}

          {rankings.length === 0 && (
            <div className="text-center py-24 bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200">
              <Trophy className="mx-auto text-slate-200 mb-4" size={64} />
              <p className="text-slate-400 font-bold">まだ成約データが反映されていません</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RankingPage;
