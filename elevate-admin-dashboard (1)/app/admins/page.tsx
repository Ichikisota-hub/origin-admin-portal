
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';
import { Trash2, Mail, Calendar, ShieldAlert, Loader2, AlertCircle } from 'lucide-react';

const AdminsPage: React.FC = () => {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // 管理者(admin)一覧を取得
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "admin")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setAdmins(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 現在のユーザーが creator かどうかチェック
  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (!error && data) {
        setCurrentUserRole(data.role);
      }
    } catch (err) {
      console.error('Access check error:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await checkAccess();
      await fetchAdmins();
    };
    init();
  }, []);

  // Admin削除機能
  const deleteAdmin = async (id: string) => {
    if (!confirm("このAdminアカウントを削除してもよろしいですか？")) return;

    setIsDeletingId(id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("セッションが見つかりません");

      const res = await fetch(
        "https://hdumbjxhjhuprwqvqntm.supabase.co/functions/v1/delete-player",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + session.access_token
          },
          body: JSON.stringify({ playerId: id })
        }
      );

      const json = await res.json();
      if (res.ok) {
        alert("Adminを削除しました");
        await fetchAdmins();
      } else {
        throw new Error(json.error || "削除に失敗しました");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  // 権限制御
  if (!loading && currentUserRole !== 'creator') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">アクセス権限がありません</h2>
        <p className="text-slate-500">このページは Creator のみ閲覧可能です。</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">ORIGIN ADMIN PORTAL</h1>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">管理者(Admin)管理</h2>
          <p className="text-slate-500 mt-2">システム管理者の権限を持つユーザーの一覧です。</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-56 bg-white/40 animate-pulse rounded-[3rem] border border-white"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="group relative p-8 rounded-[3rem] bg-white/80 backdrop-blur-xl border border-white shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 hover:-translate-y-1 flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:scale-110">
                  <span className="text-2xl font-black">{admin.name[0]?.toUpperCase()}</span>
                </div>
                <button
                  onClick={() => deleteAdmin(admin.id)}
                  disabled={isDeletingId === admin.id}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all disabled:opacity-50"
                  title="Admin削除"
                >
                  {isDeletingId === admin.id ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 truncate tracking-tight">{admin.name}</h3>
              <div className="mt-4 space-y-2 flex-grow">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                  <Mail size={14} className="text-slate-300" />
                  <span className="truncate">{admin.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                  <Calendar size={14} className="text-slate-300" />
                  <span>登録日: {new Date(admin.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={14} className="text-indigo-500" />
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                    SYSTEM ADMIN
                  </span>
                </div>
                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
              </div>
            </div>
          ))}

          {admins.length === 0 && (
            <div className="col-span-full text-center py-32 bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="text-slate-200" size={40} />
              </div>
              <p className="text-slate-400 font-bold tracking-tight">管理者は登録されていません</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminsPage;
