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

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("SESSION", session);

      if (session) {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (data) {
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

  // ===============================
  // 🔥 修正版 handleInvite
  // ===============================
  const handleInvite = async (role: 'player' | 'admin') => {
    if (actionLoading) return;

    if (!formData.name || !formData.email) {
      alert("名前とメールアドレスを入力してください");
      return;
    }

    setActionLoading(true);

    try {
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

            // ✅ anon public key
            "apikey":
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkdW1ianhoamh1cHJ3cXZxbnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NjgxMjEsImV4cCI6MjA4NjQ0NDEyMX0._O6Q0_TDg8FfNSy444gwF7HhQxTg3hFBc5GonUeqguQ",

            // ✅ JWT
            "Authorization": "Bearer " + session.access_token,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            role: role,
          }),
        }
      );

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "招待に失敗しました");
      }

      alert(
        role === "admin"
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
    } catch {
      alert('削除に失敗しました');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
            ORIGIN ADMIN PORTAL
          </h1>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            プレイヤー管理
          </h2>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-black text-white font-bold rounded-2xl"
        >
          {isAdding ? <X size={20} /> : <UserPlus size={20} />}
          {isAdding ? 'キャンセル' : '新規登録・招待'}
        </button>
      </div>
    </div>
  );
};

export default PlayersPage;
