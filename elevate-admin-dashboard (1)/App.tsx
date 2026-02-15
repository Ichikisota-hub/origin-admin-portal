import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import RootLayout from './app/layout';
import LoginPage from './app/login/page';
import RankingPage from './app/ranking/page';
import PlayersPage from './app/players/page';
import AdminsPage from './app/admins/page';
import Home from './app/page';

// ⭐ 1. ここに追加：新しく作ったページを読み込む
import SetPasswordPage from './pages/SetPasswordPage';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* ⭐ 2. ここに追加：パスワード設定画面へのルート */}
        {/* レイアウト(サイドバー)の外に置きたいので、ここに入れます */}
        <Route path="/set-password" element={<SetPasswordPage />} />

        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/" />} />
        
        {/* セッションが必要なルート（ログイン後に見れるページ群） */}
        <Route element={session ? <RootLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Home />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/admins" element={<AdminsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
