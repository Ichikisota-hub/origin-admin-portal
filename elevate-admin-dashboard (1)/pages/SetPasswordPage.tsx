import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Mail } from 'lucide-react';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // 新規登録処理
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (password.length < 6) {
      setStatus('error');
      setErrorMessage('パスワードは6文字以上で設定してください');
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      // SupabaseのAuth機能を使って新規登録
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) throw error;

      // 登録成功（メール確認設定がONの場合はメールが飛びます）
      setStatus('success');
      
      // 3秒後にログイン画面へ遷移
      setTimeout(() => {
        navigate('/login'); // ログイン画面のパスに合わせて変更してください
      }, 3000);

    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || '登録中にエラーが発生しました');
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
            <UserPlus size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">アカウント新規登録</h1>
          <p className="text-gray-500 text-sm mt-3">
            「獲得wifi」管理システムへようこそ。<br/>
            情報を入力してアカウントを作成してください。
          </p>
        </div>

        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex gap-3 text-sm font-medium">
            <AlertCircle size={20} className="shrink-0" />
            {errorMessage}
          </div>
        )}

        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold">アカウント作成完了！</h3>
            <p className="text-gray-500 mt-2">
              確認メールを送信した場合は、<br/>
              メールを確認してログインしてください。
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-5">
            {/* メールアドレス入力 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">メールアドレス</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-11 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all"
                  placeholder="name@example.com"
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            {/* パスワード入力 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">パスワード</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all"
                  placeholder="6文字以上"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-black text-white h-14 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg shadow-gray-200"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "登録してはじめる"}
            </button>
            
            <div className="text-center mt-6">
              <Link to="/login" className="text-sm text-gray-500 hover:text-black transition-colors">
                既にアカウントをお持ちの方はこちら
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
