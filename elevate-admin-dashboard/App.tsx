
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import RootLayout from './app/layout';
import LoginPage from './app/login/page';
import RankingPage from './app/ranking/page';
import PlayersPage from './app/players/page';
import AdminsPage from './app/admins/page'; // Added AdminsPage import

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
        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/ranking" />} />
        
        <Route element={session ? <RootLayout /> : <Navigate to="/login" />}>
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/admins" element={<AdminsPage />} /> {/* Added /admins route */}
          <Route path="/" element={<Navigate to="/ranking" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
