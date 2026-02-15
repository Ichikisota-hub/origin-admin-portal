import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';
import { UserPlus, Trash2, Mail, Calendar, User as UserIcon, X, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';

const PlayersPage: React.FC = () => {
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [actionLoading, setActionLoading] = useState(false);
  
  // 【追加】ログインユーザーのロールを管理するステート
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "player")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setPlayers(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 【追加】現在のユーザーの権限（role）を確認する関数
  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("SESSION", session)
      if (session) {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (!error && data) {
          setCurrentUserRole(data.role);
        }
      }
    } catch (err) {
      console.error('Error checking role:', err);
    }
  };

  useEffect(() => {
    checkUserRole();
    fetchPlayers();
  }, []);

  // 【修正】roleを引数に取るように汎用化
const handleInvite = async (role: 'player' | 'admin') => {
  if (actionLoading) return;

  if (!formData.name || !formData.email) {
    alert("名前とメールアドレスを入力してください");
    return;
  }

  setActionLoading(true);

  try {
    // ⭐ ログイン中のJWT取得
    const { data: { session } } = await supabase.auth.getSession();
    console.log("SESSION DEBUG", session);

    if (!session) {
      alert("ログインセッションがありません");
      return;
    }

    const res = await fetch(
      "https://hdumbjxhjhuprwqvqntm.supabase.co/functions/v1/invite-player",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          // ✅ 修正：JWTじゃなく publishable(anon) key を入れる
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

          // ✅ JWT
          "Authorization": "Bearer " + session.access_token
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: role
        }),
      }
    );

    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error || "招待に失敗しました");
    }

    alert(role === "admin"
      ? "管理者招待を送信しました"
      : "プレイヤー招待を送信しました"
    );

    setFormData({ name: "", email: "" });
    setIsAdding(false);
    fetchPlayers();

  } catch (err: any) {
    alert(err.message || "エラーが発生しました");
  } finally {
    setActionLoading(false);
  }
};
  const handleDeletePlayer = async (id: string) => {
    if (!confirm('このプレイヤーアカウントを無効化（削除）してもよろしいですか？')) return;

    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .match({ id });
      
      if (error) throw error;
      await fetchPlayers();
    } catch (err) {
      alert('削除に失敗しました');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">ORIGIN ADMIN PORTAL</h1>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">プレイヤー管理</h2>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-black text-white font-bold rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all transform active:scale-95 group"
        >
          {isAdding ? <X size={20} /> : <UserPlus size={20} className="group-hover:scale-110 transition-transform" />}
          {isAdding ? 'キャンセル' : '新規登録・招待'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border border-slate-100 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-900">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">新規エージェント・管理者登録フォーム</h3>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-black outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="田中 太郎"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-black outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="agent@origin.jp"
                />
              </div>
            </div>
            
            <div className="md:col-span-2 flex flex-wrap justify-end gap-3 mt-4">
              {/* 【修正】ボタンを分割してロールを指定 */}
              <button
                type="button"
                onClick={() => handleInvite('player')}
                disabled={actionLoading}
                className="px-8 py-4 bg-slate-100 text-slate-900 font-bold rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={18} />}
                プレイヤーとして招待
              </button>

              {/* 【追加】creator ロールのみ表示される Admin招待ボタン */}
              {currentUserRole === 'creator' && (
                <button
                  type="button"
                  onClick={() => handleInvite('admin')}
                  disabled={actionLoading}
                  className="px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg"
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldAlert size={18} />}
                  管理者(Admin)として招待
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-white/40 animate-pulse rounded-[3rem] border border-white"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {players.map((player) => (
            <div
              key={player.id}
              className="group relative p-8 rounded-[3rem] bg-white/80 backdrop-blur-xl border border-white shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 hover:-translate-y-1 flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-400 group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-lg group-hover:shadow-slate-200">
                  <span className="text-2xl font-black">{player.name[0]?.toUpperCase()}</span>
                </div>
                <button
                  onClick={() => handleDeletePlayer(player.id)}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 truncate tracking-tight">{player.name}</h3>
              <div className="mt-4 space-y-2 flex-grow">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                  <Mail size={14} className="text-slate-300" />
                  <span className="truncate">{player.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                  <Calendar size={14} className="text-slate-300" />
                  <span>登録日: {new Date(player.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-widest">
                  FIELD AGENT
                </span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              </div>
            </div>
          ))}

          {players.length === 0 && (
            <div className="col-span-full text-center py-32 bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserIcon className="text-slate-200" size={40} />
              </div>
              <p className="text-slate-400 font-bold tracking-tight">管理対象のプレイヤーが見つかりません</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayersPage;
