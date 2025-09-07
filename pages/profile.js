import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function ProfilePage() {
  const router = useRouter();
  const [jwt, setJwt] = useState('');
  const [me, setMe] = useState(null);
  const [refStats, setRefStats] = useState(null);
  const [latestRefs, setLatestRefs] = useState([]);

  // Load auth token; if missing, go to login
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('jwt') : '';
    if (!t) { router.replace('/login'); return; }
    setJwt(t);
  }, [router]);

  useEffect(() => {
    if (jwt) { loadMe(); loadRefStats(); loadLatestRefs(); }
  }, [jwt]);

  const loadMe = async () => {
    const { data } = await api.get('/me', { params: { token: jwt } });
    setMe(data);
  };

  const loadRefStats = async () => {
    try {
      const { data } = await api.get('/referrals/stats', { params: { token: jwt } });
      setRefStats(data);
    } catch (e) {
      console.warn('ref stats error', e?.response?.data || e.message);
    }
  };

  const loadLatestRefs = async () => {
    try {
      const { data } = await api.get('/referrals/latest', { params: { token: jwt } });
      setLatestRefs(data.items || []);
    } catch (e) {
      console.warn('latest refs error', e?.response?.data || e.message);
    }
  };

  const referralLink = useMemo(() => {
    const code = refStats?.myReferralCode || me?.myReferralCode;
    if (!code) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3002';
    return `${origin}/register?ref=${code}`;
  }, [refStats, me]);

  const rank = useMemo(() => {
    const p = me?.points || 0;
    if (p >= 5000) return { label: 'Legend', emoji: '👑', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' };
    if (p >= 1000) return { label: 'Pro', emoji: '🏆', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' };
    if (p >= 200) return { label: 'Rising', emoji: '🚀', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    return { label: 'Newbie', emoji: '👶', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
  }, [me]);

  const copyReferral = async () => {
    try {
      if (!referralLink) return;
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <Layout>
      <div className="grid gap-6">
        {/* Profile Card with points and rank */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 md:p-6 grid gap-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-extrabold inline-flex items-center gap-2">
            <span>👤</span>
            <span>My Profile</span>
          </h1>
          <button className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-neutral-700 text-gray-200 hover:bg-neutral-800" onClick={() => { loadMe(); loadRefStats(); loadLatestRefs(); }} disabled={!jwt} title="Refresh">🔄</button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 items-stretch">
          {/* Points */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 text-xl">★</div>
            <div>
              <div className="text-sm text-gray-400">Points</div>
              <div className="text-2xl font-bold text-white">{me?.points ?? '-'}</div>
            </div>
          </div>

          {/* Rank (badge pill) */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="text-sm text-gray-400">Rank</div>
            <div className={`mt-1 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${rank.border} ${rank.bg} ${rank.text}`}> 
              <span>{rank.emoji}</span>
              <span>{rank.label}</span>
            </div>
          </div>

          {/* Invited */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="text-sm text-gray-400">Invited Friends</div>
            <div className="text-2xl font-bold text-white">{refStats?.referredCount ?? 0}</div>
          </div>

          {/* Referral Earnings */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="text-sm text-gray-400">Referral Points Earned</div>
            <div className="text-2xl font-bold text-white">{refStats?.referralPoints ?? 0}</div>
          </div>
        </div>

        {/* Referral Link + Share */}
        <div className="grid gap-3">
          <div className="grid gap-2">
            <label className="label">Your referral link</label>
            <div className="flex gap-2">
              <input className="input flex-1" readOnly value={referralLink} placeholder="—" />
              <button className="btn" onClick={copyReferral} disabled={!referralLink}>Copy</button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Quick share:</span>
            <a className="btn" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`سجّل واربح معنا: ${referralLink}`)}`}>WhatsApp</a>
            <a className="btn" target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('سجّل واربح معنا')}&url=${encodeURIComponent(referralLink)}`}>Twitter</a>
          </div>
        </div>
      </div>

      {/* Latest Referrals Widget */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 grid gap-3">
        <h3 className="font-semibold">Latest Referrals</h3>
        {latestRefs.length === 0 ? (
          <div className="text-sm text-gray-400">No referrals yet.</div>
        ) : (
          <div className="grid gap-2">
            {latestRefs.map((u) => (
              <div key={u.id} className="flex items-center justify-between bg-neutral-800 rounded px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300">👤</div>
                  <div>
                    <div className="font-medium text-sm text-gray-200">{u.name || u.email}</div>
                    <div className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-300">{u.points} pts</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
}