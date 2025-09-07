import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';

import SEO from '../components/SEO';

export default function OffersPage() {
  const [jwt, setJwt] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('jwt');
    if (t) setJwt(t);
  }, []);

  const load = async () => {
    try {
      if (!jwt) return toast.error('Please login');
      setLoading(true);
      // Use real browser UA and client IP via server; remove hard-coded and fragile params
      const { data } = await api.get('/offers', { params: { token: jwt, max: 25 } });
      const list = Array.isArray(data?.offers) ? data.offers : [];
      setItems(list);
    } catch (e) {
      toast.error(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  // NOTE: Do not auto-load. User must click Refresh to fetch offers.

  return (
    <Layout>
      <SEO title="عروض اليوم — xo45ox" description="اكتشف عروض xo45ox وابدأ بجمع النقاط الآن." canonical="/offers" />
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">العروض</h1>
          <button className="btn" onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
        </div>

        {!items.length && (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 text-gray-400">لا توجد عروض متاحة حاليًا. جرّب التحديث لاحقًا.</div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {items.map((o, idx) => (
            <div key={o.id || o.offer_id || idx} className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-100">{o.name || o.title || 'Offer'}</div>
                  <div className="text-sm text-gray-400">Payout: {o.payout || o.rate || o.value || '-'} | Country: {o.country || (o.countries?.join(', ') || '-')}</div>
                </div>
                {o.image && <img alt="offer" src={o.image} className="w-16 h-16 object-cover rounded" />}
              </div>
              {o.description && <p className="text-sm text-gray-300">{o.description}</p>}
              <div>
                <a className="btn" href={o.url || o.link || '#'} target="_blank" rel="noreferrer">اذهب</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}