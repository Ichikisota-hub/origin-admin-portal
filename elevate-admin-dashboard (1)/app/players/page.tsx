import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';
import {
  UserPlus,
  Trash2,
  Mail,
  Calendar,
  User as UserIcon,
  X,
  Loader2,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

const PlayersPage: React.FC = () => {

  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  // ===============================
  // Players取得
  // ===============================
  const fetchPlayers = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("role", "player")
      .order("created_at", { ascending: false });

    setPlayers(data || []);
    setLoading(false);
  };

  // ===============================
  // 自分のrole確認
  // ===============================
  const checkUserRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return;

    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (data) setCurrentUserRole(data.role);
  };

  useEffect(() => {
    checkUserRole();
    fetchPlayers();
  }, []);

  // ===============================
  // 招待処理
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
      
      if (!session) {
        alert("ログインセッションなし");
        setActionLoading(false);
        return;
      }

      // あなたの環境の Anon Key (公開キー)
      const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkdW1ianhoamh1cHJ3cXZxbnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NjgxMjEsImV4cCI6MjA4NjQ0NDEyMX0._O6Q0_TDg8FfNSy444gwF7HhQxTg3hFBc5GonUeqguQ";

      const res = await fetch(
        "https://hdumbjxhjhuprwqvqntm.supabase.co/functions/v1/invite-player",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",

            // 1. 門番を通るためのキー (Anon Key)
            "apikey": ANON_KEY,
            
            // 2. 🔴 ここが重要修正！ Authorization にも Anon Key を入れる
            // これで Gateway の 401 エラーを回避します
            "Authorization": `Bearer ${ANON_KEY}`,

            // 3. 🟢 新設: 本当の身分証（ユーザートークン）はここに入れる
            // Edge Function側で req.headers.get("X-User-Token") で受け取ります
            "X-User-Token": session.access_token
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
        throw new Error(json.error || "招待失敗");
      }

      alert(role === "admin"
        ? "管理者招待を送信しました"
        : "プレイヤー招待を送信しました"
      );

      setFormData({ name: "", email: "" });
      setIsAdding(false);
      fetchPlayers();

    } catch (err: any) {
      alert(err.message || "エラー");
    }

    setActionLoading(false);
  };

  // ===============================
  // 削除
  // ===============================
  const handleDeletePlayer = async (id: string) => {

    if (!confirm("削除しますか？")) return;

    await supabase.from("users").delete().match({ id });

    fetchPlayers();
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* header */}
      <div className="flex justify-between">
        <h2 className="text-3xl font-bold">プレイヤー管理</h2>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-3 bg-black text-white rounded-xl flex gap-2"
        >
          {isAdding ? <X size={18}/> : <UserPlus size={18}/>}
          {isAdding ? "キャンセル" : "新規登録"}
        </button>
      </div>

      {/* ===============================
          入力フォーム
      =============================== */}
      {isAdding && (

        <div className="p-6 bg-white rounded-3xl shadow">

          <div className="flex gap-3 mb-6">
            <ShieldCheck/>
            <h3 className="font-bold text-lg">新規登録</h3>
          </div>

          <div className="grid gap-4">

            <input
              type="text"
              placeholder="名前"
              value={formData.name}
              onChange={(e)=>setFormData({...formData,name:e.target.value})}
              className="p-3 border rounded-xl"
            />

            <input
              type="email"
              placeholder="メール"
              value={formData.email}
              onChange={(e)=>setFormData({...formData,email:e.target.value})}
              className="p-3 border rounded-xl"
            />

            <div className="flex gap-3 justify-end">

              <button
                onClick={()=>handleInvite('player')}
                disabled={actionLoading}
                className="px-6 py-3 bg-gray-100 rounded-xl flex gap-2"
              >
                {actionLoading ? <Loader2 className="animate-spin"/> : <UserPlus size={16}/>}
                プレイヤー招待
              </button>

              {currentUserRole === "creator" && (
                <button
                  onClick={()=>handleInvite('admin')}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-black text-white rounded-xl flex gap-2"
                >
                  <ShieldAlert size={16}/>
                  管理者招待
                </button>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ===============================
          players list
      =============================== */}
      {!loading && players.map((player)=>(
        <div key={player.id} className="p-6 bg-white rounded-3xl shadow flex justify-between">

          <div>
            <div className="font-bold">{player.name}</div>
            <div className="text-sm text-gray-400">{player.email}</div>
          </div>

          <button onClick={()=>handleDeletePlayer(player.id)}>
            <Trash2/>
          </button>

        </div>
      ))}

    </div>
  );
};

export default PlayersPage;
