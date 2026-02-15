import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // ← パスはこれでOKです
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const SetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // セッションチェック
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn("招待リンクが無効か、期限切れです。");
      }
    };
    checkSession();
  }, [navigate]);

  // パスワード更新処理
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setStatus('error');
      setErrorMessage('パスワードは6文字以上で設定してください');
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setStatus('success');
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8 font-bold text-2xl tracking-tighter">ORIGIN ADMIN</div>
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">アカウント登録</h1>
          <p className="text-gray-500 text-sm mt-3">招待ありがとうございます。<br/>パスワードを設定してください。</p>
        </div>

        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex gap-3 text-sm font-medium">
            <AlertCircle size={20} />{errorMessage}
          </div>
        )}

        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold">設定完了！</h3>
            <p className="text-gray-500 mt-2">ダッシュボードへ移動します...</p>
          </div>
        ) : (
          <form onSubmit={handleSetPassword} className="space-y-6">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-black"
                placeholder="新しいパスワード"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-black text-white h-14 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "登録してはじめる"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SetPasswordPage;
