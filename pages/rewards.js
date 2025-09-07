import Layout from '../components/Layout';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

// المبدأ: تحميل الكاتالوج والإعدادات من السيرفر، مع fallback محلي إذا لزم.
const fallbackSections = [
  { title: 'فري فاير', method: 'freefire', emoji: '🔥', items: [
    { label: '100 دايموند', qty: 100 },
    { label: '310 دايموند', qty: 310 },
    { label: '520 دايموند', qty: 520 },
  ]},
  { title: 'ببجي', method: 'pubg', emoji: '🎯', items: [
    { label: '60 UC', qty: 60 },
    { label: '325 UC', qty: 325 },
    { label: '690 UC', qty: 690 },
  ]},
  { title: 'فودافون كاش', method: 'vodafone_cash', emoji: '💳', items: [
    { label: '10 جنيه', qty: 10 },
    { label: '25 جنيه', qty: 25 },
    { label: '50 جنيه', qty: 50 },
  ]},
];

export default function RewardsPage() {
  // Auth + Me
  const [jwt, setJwt] = useState('');
  const [me, setMe] = useState(null);
  const points = me?.points ?? 0;

  // Dialog state
  const [dlg, setDlg] = useState(null); // { method, item, fields: {...} }
  const [sending, setSending] = useState(false);

  // Dynamic catalog/settings
  const [catalog, setCatalog] = useState(null); // array of { _id, method, label, qty, pricePoints, enabled }
  const [settings, setSettings] = useState(null); // { freefire_per100_points, pubg_per60_points, vodafone_points_per_egp }

  // Load auth token
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('jwt') : '';
    if (t) setJwt(t);
  }, []);

  // Load me and rewards data
  useEffect(() => { if (jwt) { loadMe(); loadRewards(); } }, [jwt]);

  const loadMe = async () => {
    try { const { data } = await api.get('/me', { params: { token: jwt } }); setMe(data); } catch {}
  };

  const loadRewards = async () => {
    try {
      const { data } = await api.get('/rewards');
      setCatalog(Array.isArray(data?.catalog) ? data.catalog : []);
      setSettings(data?.settings || null);
    } catch {}
  };

  // حساب السعر بالنقاط بناءً على الإعدادات (مع قيم افتراضية)
  const calcFFPoints = (diamonds) => {
    const per100 = Number(settings?.freefire_per100_points ?? 105);
    return Math.ceil((diamonds / 100) * per100);
  };
  const calcPUBGPoints = (uc) => {
    const per60 = Number(settings?.pubg_per60_points ?? 105);
    return Math.ceil((uc / 60) * per60);
  };
  const calcVodafonePoints = (egp) => {
    const perEGP = Number(settings?.vodafone_points_per_egp ?? 2);
    return Math.ceil(egp * perEGP);
  };

  const priceFor = (method, qty, itemPricePoints) => {
    if (typeof itemPricePoints === 'number' && itemPricePoints > 0) return itemPricePoints;
    if (method === 'freefire') return calcFFPoints(qty);
    if (method === 'pubg') return calcPUBGPoints(qty);
    if (method === 'vodafone_cash') return calcVodafonePoints(qty);
    return 0;
  };

  // بناء أقسام الواجهة من الكاتالوج الديناميكي أو fallback
  const uiSections = useMemo(() => {
    if (Array.isArray(catalog) && catalog.length > 0) {
      const groups = [
        { title: 'فري فاير', method: 'freefire', emoji: '🔥', items: [] },
        { title: 'ببجي', method: 'pubg', emoji: '🎯', items: [] },
        { title: 'فودافون كاش', method: 'vodafone_cash', emoji: '💳', items: [] },
      ];
      for (const it of catalog) {
        const g = groups.find(g => g.method === it.method);
        if (g && it.enabled !== false) g.items.push({ label: it.label, qty: it.qty, pricePoints: it.pricePoints });
      }
      // الترتيب بسيط: كما هو
      return groups;
    }
    return fallbackSections;
  }, [catalog]);

  const openDialog = (method, item) => {
    const amount = priceFor(method, item.qty, item.pricePoints);
    const base = { method, amount, rewardType: method };
    if (method === 'freefire' || method === 'pubg') {
      setDlg({ method, item, fields: { ...base, accountId: '', email: '' } });
    } else if (method === 'vodafone_cash') {
      setDlg({ method, item, fields: { ...base, walletNumber: '', walletName: '' } });
    }
  };

  const canAfford = useMemo(() => (dlg ? points >= (dlg.fields?.amount || 0) : false), [points, dlg]);

  const submit = async () => {
    if (!dlg) return;
    setSending(true);
    try {
      const { fields } = dlg;
      if (fields.method === 'vodafone_cash' && !/^\d{11}$/.test(fields.walletNumber || '')) {
        alert('رقم المحفظة يجب أن يكون 11 رقم'); setSending(false); return;
      }
      await api.post('/withdrawals', fields, { params: { token: jwt } });
      setDlg(null);
      await loadMe(); // خصم النقاط بعد النجاح
      alert('تم إرسال طلب السحب وهو قيد المراجعة');
    } catch (e) {
      alert(e?.response?.data?.error || 'فشل الإرسال');
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div className="grid gap-6">
        {uiSections.map((sec) => (
          <section key={sec.title} className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 md:p-6">
            <div className="mb-3">
              <h2 className="text-xl md:text-2xl font-extrabold inline-flex items-center gap-2">
                <span aria-hidden>{sec.emoji}</span>
                <span>{sec.title}</span>
              </h2>
            </div>

            {/* قائمة عمودية لكل الخيارات داخل القسم */}
            <div className="grid gap-3">
              {sec.items.map((it, idx) => {
                const method = sec.method;
                const need = priceFor(method, it.qty, it.pricePoints);
                const can = points >= need;
                return (
                  <div key={idx} className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 flex items-center justify-between hover:bg-neutral-900/80 transition">
                    <div>
                      <div className="text-gray-100 font-semibold">{it.label}</div>
                      <div className="text-xs text-gray-400">التكلفة: {need}★ — رصيدك: {points}★</div>
                    </div>
                    <button
                      className="inline-flex items-center justify-center rounded-md border border-neutral-700 bg-neutral-800 text-gray-200 px-3 py-1.5 text-sm hover:bg-neutral-700 disabled:opacity-50"
                      disabled={!can}
                      onClick={() => openDialog(method, it)}
                    >
                      سحب
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Dialog */}
      {dlg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDlg(null)} />
          <div className="relative z-10 w-[92vw] max-w-md bg-neutral-950 border border-neutral-800 rounded-xl p-4 grid gap-3">
            <div className="text-lg font-bold text-white">طلب سحب — {dlg.item?.label}</div>
            {dlg.method !== 'vodafone_cash' ? (
              <>
                <input className="px-3 py-2 rounded-md border border-neutral-700 bg-neutral-900 text-gray-200" placeholder="معرف الحساب داخل اللعبة" value={dlg.fields.accountId} onChange={e=>setDlg(d=>({...d, fields:{...d.fields, accountId:e.target.value}}))} />
                <input className="px-3 py-2 rounded-md border border-neutral-700 bg-neutral-900 text-gray-200" placeholder="البريد الإلكتروني للحساب" value={dlg.fields.email} onChange={e=>setDlg(d=>({...d, fields:{...d.fields, email:e.target.value}}))} />
              </>
            ) : (
              <>
                <input className="px-3 py-2 rounded-md border border-neutral-700 bg-neutral-900 text-gray-200" placeholder="رقم المحفظة (11 رقم)" value={dlg.fields.walletNumber} onChange={e=>setDlg(d=>({...d, fields:{...d.fields, walletNumber:e.target.value}}))} />
                <input className="px-3 py-2 rounded-md border border-neutral-700 bg-neutral-900 text-gray-200" placeholder="اسم صاحب المحفظة" value={dlg.fields.walletName} onChange={e=>setDlg(d=>({...d, fields:{...d.fields, walletName:e.target.value}}))} />
              </>
            )}
            <div className="text-xs text-gray-400">سيتم خصم {dlg.fields.amount}★ من رصيدك. الرصيد الحالي: {points}★</div>
            <div className="flex items-center justify-end gap-2">
              <button className="px-3 py-1.5 rounded-md border border-neutral-700 text-gray-200" onClick={()=>setDlg(null)}>إلغاء</button>
              <button
                className="px-3 py-1.5 rounded-md border border-amber-700 bg-amber-800/30 text-amber-200 disabled:opacity-50"
                disabled={!canAfford || sending}
                onClick={submit}
              >
                {sending ? 'جارٍ الإرسال…' : 'تأكيد السحب'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}