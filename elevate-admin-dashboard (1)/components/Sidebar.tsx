
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Users, LogOut, Compass, ShieldAlert } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (data) setRole(data.role);
      }
    };
    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/ranking', label: 'Ranking', icon: <LayoutDashboard size={20} /> },
    { path: '/players', label: 'Players', icon: <Users size={20} /> },
  ];

  // creator の場合のみ管理者一覧を追加
  if (role === 'creator') {
    navItems.push({ path: '/admins', label: 'Admins', icon: <ShieldAlert size={20} /> });
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white/70 backdrop-blur-xl border-r border-slate-200 z-50 flex flex-col">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
            <Compass size={22} />
          </div>
          <span className="text-xl font-semibold tracking-tight text-slate-900 leading-none">
            ORIGIN<br/>ADMIN PORTAL
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {item.icon}
                </span>
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-semibold"
        >
          <LogOut size={20} />
          <span>ログアウト</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
