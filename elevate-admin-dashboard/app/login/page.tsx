
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { KeyRound, Mail, LogIn, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-black shadow-xl shadow-slate-200 mb-6">
            <LogIn className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ORIGIN ADMIN PORTAL</h1>
          <p className="text-slate-500 mt-2">管理者アカウントでサインインしてください</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-bold text-slate-700 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-black focus:ring-4 focus:ring-slate-100 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="admin@origin.jp"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-bold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-black focus:ring-4 focus:ring-slate-100 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 rounded-2xl border border-red-100">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? '認証中...' : 'ログイン'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
