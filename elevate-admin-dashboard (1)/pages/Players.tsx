
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
// Fixed: changed Player to User as Player is not exported from types
import { User as UserType } from '../types';
import { UserPlus, Trash2, Search, X, Loader2, User } from 'lucide-react';

const Players: React.FC = () => {
  // Fixed: changed Player[] to UserType[]
  const [players, setPlayers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPlayers(data || []);
    } catch (err) {
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim() || actionLoading) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('players')
        .insert([{ name: newPlayerName }]);
      
      if (error) throw error;
      
      setNewPlayerName('');
      setIsAdding(false);
      await fetchPlayers();
    } catch (err) {
      alert('Error adding player');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePlayer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this player?')) return;

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .match({ id });
      
      if (error) throw error;
      await fetchPlayers();
    } catch (err) {
      alert('Error deleting player');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
              Management
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Active Agents</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage and monitor your player database.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all transform active:scale-95 group"
        >
          {isAdding ? <X size={20} /> : <UserPlus size={20} className="group-hover:rotate-12 transition-transform" />}
          {isAdding ? 'Cancel' : 'Register New Agent'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-indigo-100/50 animate-in slide-in-from-top-4 duration-500">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Create Agent Profile</h2>
          <form onSubmit={handleAddPlayer} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                autoFocus
                type="text"
                required
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Agent Full Name"
                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 min-w-[140px]"
            >
              {actionLoading ? <Loader2 className="animate-spin" size={20} /> : 'Complete'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-white/40 animate-pulse rounded-[2.5rem] border border-slate-100"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {players.map((player) => (
            <div
              key={player.id}
              className="group relative p-8 rounded-[2.5rem] bg-white/80 backdrop-blur-xl border border-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-indigo-200">
                  <span className="text-2xl font-black">{player.name[0]?.toUpperCase()}</span>
                </div>
                <button
                  onClick={() => handleDeletePlayer(player.id)}
                  className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Remove Agent"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 truncate tracking-tight">{player.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Agent ID: {player.id.split('-')[0]}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  ONLINE
                </span>
                <span>Joined {new Date(player.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}

          {players.length === 0 && (
            <div className="col-span-full text-center py-24 bg-white/40 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-slate-300" size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No Agents Found</h3>
              <p className="text-slate-500 mt-2">Start by registering a new agent to your database.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Players;
