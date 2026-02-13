import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, ChevronDown, Loader2 } from 'lucide-react';

const CreatorOrgSwitcher: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch user profile to check role
        const { data: userProfile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        setRole(userProfile?.role || null);

        if (userProfile?.role === 'creator') {
          // Fetch all organizations
          const { data: orgData } = await supabase
            .from('organizations')
            .select('*')
            .order('name');
          setOrganizations(orgData || []);

          // Fetch currently active organization for this creator
          const { data: activeData } = await supabase
            .from('creator_active_org')
            .select('organization_id')
            .eq('user_id', session.user.id)
            .single();

          if (activeData) {
            setActiveOrgId(activeData.organization_id);
          }
        }
      } catch (err) {
        console.error('Error initializing org switcher:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgData();
  }, []);

  const switchOrganization = async (orgId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("creator_active_org")
      .upsert({
        user_id: session.user.id,
        organization_id: orgId
      });

    if (!error) {
      // Reload to ensure all components/data fetching hooks pick up the new organization context
      window.location.reload();
    } else {
      console.error('Failed to switch organization:', error);
      alert('組織の切り替えに失敗しました');
    }
  };

  if (loading || role !== 'creator') return null;

  return (
    <div className="relative flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm hover:border-slate-300 transition-all">
      <div className="flex items-center gap-2 text-slate-400">
        <Building2 size={16} />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Organization</span>
      </div>
      <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
      <div className="relative group">
        <select
          value={activeOrgId}
          onChange={(e) => switchOrganization(e.target.value)}
          className="appearance-none bg-transparent pr-8 py-0.5 outline-none text-sm font-bold text-slate-900 cursor-pointer focus:ring-0"
        >
          <option value="" disabled>組織を選択...</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" />
      </div>
    </div>
  );
};

export default CreatorOrgSwitcher;
