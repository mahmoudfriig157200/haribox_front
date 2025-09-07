import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';

export default function Admin() {
  const router = useRouter();
  const [jwt, setJwt] = useState('');
  const [me, setMe] = useState(null);

  // Tabs
  const [tab, setTab] = useState('users'); // users | withdrawals | transactions | catalog | settings

  // Users state
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [users, setUsers] = useState(null);
  // Per-user input buffers
  const [setPointsValue, setSetPointsValue] = useState({});
  const [deltaValue, setDeltaValue] = useState({});

  // Withdrawals state
  const [withdrawals, setWithdrawals] = useState(null);

  // Transactions state
  const [tx, setTx] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('jwt');
    if (!t) { router.replace('/login'); return; }
    setJwt(t);
  }, [router]);

  useEffect(() => { if (jwt) { loadMe(); } }, [jwt]);

  const isAdmin = useMemo(() => me?.role === 'admin', [me]);

  const loadMe = async () => {
    try {
      const { data } = await api.get('/me', { params: { token: jwt } });
      setMe(data);
      if (data?.role !== 'admin') router.replace('/dashboard');
    } catch (_) {
      router.replace('/login');
    }
  };

  const loadUsers = async () => {
    const { data } = await api.get('/admin/users', { params: { token: jwt, page, limit: 20, q } });
    setUsers(data);
  };

  const updateUser = async (id, payload) => {
    await api.patch(`/admin/users/${id}`, payload, { params: { token: jwt } });
    await loadUsers();
  };

  const sendPoints = async (id, delta, reason='manual-adjust') => {
    await api.post(`/admin/users/${id}/points`, { delta: Number(delta), reason }, { params: { token: jwt } });
    await loadUsers();
  };

  const zeroPoints = async (id) => {
    await api.post(`/admin/users/${id}/zero`, {}, { params: { token: jwt } });
    await loadUsers();
  };

  const banUser = async (id) => {
    await api.post(`/admin/users/${id}/ban`, {}, { params: { token: jwt } });
    await loadUsers();
  };

  const unbanUser = async (id) => {
    await api.post(`/admin/users/${id}/unban`, {}, { params: { token: jwt } });
    await loadUsers();
  };

  const [wStatus, setWStatus] = useState('all'); // all | pending | approved | rejected

  const loadWithdrawals = async () => {
    const { data } = await api.get('/admin/withdrawals', { params: { token: jwt, status: wStatus } });
    setWithdrawals(data);
  };

  const updateWithdrawal = async (id, payload) => {
    await api.patch(`/admin/withdrawals/${id}`, payload, { params: { token: jwt } });
    await loadWithdrawals();
  };

  const loadTx = async () => {
    const { data } = await api.get('/admin/transactions', { params: { token: jwt } });
    setTx(data);
  };

  // Catalog & Settings state
  const [catalog, setCatalog] = useState([]);
  const [newItem, setNewItem] = useState({ method: 'freefire', label: '', qty: 0, pricePoints: 0, enabled: true });
  const [settings, setSettings] = useState(null);

  const loadCatalog = async () => {
    const { data } = await api.get('/admin/rewards', { params: { token: jwt } });
    setCatalog(data);
  };
  const createCatalogItem = async () => {
    await api.post('/admin/rewards', newItem, { params: { token: jwt } });
    setNewItem({ method: 'freefire', label: '', qty: 0, pricePoints: 0, enabled: true });
    await loadCatalog();
  };
  const updateCatalogItem = async (id, patch) => {
    await api.patch(`/admin/rewards/${id}`, patch, { params: { token: jwt } });
    await loadCatalog();
  };
  const removeCatalogItem = async (id) => {
    await api.delete(`/admin/rewards/${id}`, { params: { token: jwt } });
    await loadCatalog();
  };

  const loadSettings = async () => {
    const { data } = await api.get('/admin/settings', { params: { token: jwt } });
    setSettings(data);
  };
  const saveSettings = async (patch) => {
    const { data } = await api.patch('/admin/settings', patch, { params: { token: jwt } });
    setSettings(data);
  };

  useEffect(() => {
    if (!isAdmin) return;
    if (tab === 'users') loadUsers();
    if (tab === 'withdrawals') loadWithdrawals();
    if (tab === 'transactions') loadTx();
    if (tab === 'catalog') loadCatalog();
    if (tab === 'settings') loadSettings();
  }, [isAdmin, tab, page, q]);

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-400">Checking permissions…</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-3 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">Admin Dashboard</h1>
        <div className="text-sm text-gray-400">{me?.email}</div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 mb-4">
        <button className={`px-3 py-2 rounded-t-md ${tab==='users'?'bg-neutral-800 text-white':'text-gray-300 hover:text-white'}`} onClick={()=>setTab('users')}>Users</button>
        <button className={`px-3 py-2 rounded-t-md ${tab==='withdrawals'?'bg-neutral-800 text-white':'text-gray-300 hover:text-white'}`} onClick={()=>setTab('withdrawals')}>Withdrawals</button>
        <button className={`px-3 py-2 rounded-t-md ${tab==='transactions'?'bg-neutral-800 text-white':'text-gray-300 hover:text-white'}`} onClick={()=>setTab('transactions')}>Transactions</button>
        <button className={`px-3 py-2 rounded-t-md ${tab==='catalog'?'bg-neutral-800 text-white':'text-gray-300 hover:text-white'}`} onClick={()=>setTab('catalog')}>Rewards Catalog</button>
        <button className={`px-3 py-2 rounded-t-md ${tab==='settings'?'bg-neutral-800 text-white':'text-gray-300 hover:text-white'}`} onClick={()=>setTab('settings')}>Pricing Settings</button>
      </div>

      {/* Users Tab */}
      {tab==='users' && (
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <input className="px-3 py-2 rounded-md border border-neutral-700 bg-neutral-900 text-gray-200" placeholder="Search email/name" value={q} onChange={e => setQ(e.target.value)} />
            <button className="px-3 py-2 rounded-md border border-neutral-700 text-gray-200 hover:bg-neutral-800" onClick={loadUsers}>Search</button>
          </div>

          <div className="grid gap-2">
            {users?.items?.map(u => (
              <div key={u._id} className="rounded-md border border-neutral-800 bg-neutral-900 p-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="text-white font-medium">{u.email || u.name || 'User'}</div>
                    <div className="text-xs text-gray-400">role: {u.role} • points: {u.points} • status: {u.status}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Set absolute points */}
                    <input
                      className="px-2 py-1 rounded-md border border-neutral-700 bg-neutral-950 text-gray-200 w-28"
                      type="number"
                      placeholder="set points"
                      value={setPointsValue[u._id] ?? ''}
                      onChange={e => setSetPointsValue(v => ({ ...v, [u._id]: e.target.value }))}
                    />
                    <button
                      className="px-3 py-1 rounded-md border border-neutral-700 text-gray-200 hover:bg-neutral-800"
                      onClick={() => updateUser(u._id, { points: Number(setPointsValue[u._id]) })}
                    >Set</button>

                    {/* Send points (+/- delta) */}
                    <input
                      className="px-2 py-1 rounded-md border border-neutral-700 bg-neutral-950 text-gray-200 w-28"
                      type="number"
                      placeholder="± delta"
                      value={deltaValue[u._id] ?? ''}
                      onChange={e => setDeltaValue(v => ({ ...v, [u._id]: e.target.value }))}
                    />
                    <button
                      className="px-3 py-1 rounded-md border border-neutral-700 text-gray-200 hover:bg-neutral-800"
                      onClick={() => sendPoints(u._id, deltaValue[u._id])}
                    >Apply</button>

                    {/* Zero points */}
                    <button className="px-3 py-1 rounded-md border border-neutral-700 text-gray-200 hover:bg-neutral-800" onClick={() => zeroPoints(u._id)}>Zero</button>

                    {/* Ban / Unban */}
                    {u.status !== 'banned' ? (
                      <button className="px-3 py-1 rounded-md border border-red-700 text-red-300 hover:bg-red-900/30" onClick={() => banUser(u._id)}>Ban</button>
                    ) : (
                      <button className="px-3 py-1 rounded-md border border-green-700 text-green-300 hover:bg-green-900/30" onClick={() => unbanUser(u._id)}>Unban</button>
                    )}

                    {/* Status select (fallback) */}
                    <select className="px-2 py-1 rounded-md border border-neutral-700 bg-neutral-950 text-gray-200" defaultValue={u.status} onChange={e=>updateUser(u._id, { status: e.target.value })}>
                      <option value="active">active</option>
                      <option value="banned">banned</option>
                    </select>

                    <button className="px-3 py-1 rounded-md border border-neutral-700 text-gray-200 hover:bg-neutral-800" onClick={loadUsers}>Refresh</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination simple */}
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded-md border border-neutral-700 text-gray-200 disabled:opacity-50" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
            <div className="text-sm text-gray-400">Page {page}</div>
            <button className="px-3 py-1 rounded-md border border-neutral-700 text-gray-200" onClick={()=>setPage(p=>p+1)}>Next</button>
          </div>
        </div>
      )}

      {/* Withdrawals Tab */}
      {tab==='withdrawals' && (
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Filter:</label>
            <select className="px-2 py-1 rounded-md border border-neutral-700 bg-neutral-950 text-gray-200" value={wStatus} onChange={(e)=>{ setWStatus(e.target.value); }}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className="px-3 py-1 rounded-md border border-neutral-700 text-gray-200 hover:bg-neutral-800" onClick={loadWithdrawals}>Apply</button>
          </div>

          {(withdrawals||[]).map(w => (
            <div key={w._id} className="rounded-md border border-neutral-800 bg-neutral-900 p-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="text-white font-medium">{w.userId} • {w.amount} pts • {w.method || w.rewardType}</div>
                  {w.method === 'vodafone_cash' ? (
                    <div className="text-xs text-gray-300">Wallet: {w.walletNumber || '-'} • Name: {w.walletName || '-'}</div>
                  ) : (
                    <div className="text-xs text-gray-300">Account ID: {w.accountId || '-'} • Email: {w.email || '-'}</div>
                  )}
                  {w.adminNote ? (<div className="text-xs text-amber-300">Note: {w.adminNote}</div>) : null}
                  <div className="text-xs text-gray-500">{new Date(w.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select className="px-2 py-1 rounded-md border border-neutral-700 bg-neutral-950 text-gray-200" defaultValue={w.status} onChange={(e)=>updateWithdrawal(w._id,{ status: e.target.value })}>
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                  </select>
                  <input className="px-2 py-1 rounded-md border border-neutral-700 bg-neutral-950 text-gray-200" placeholder="Admin note" onKeyDown={e=>{ if(e.key==='Enter') updateWithdrawal(w._id,{ adminNote: e.currentTarget.value }); }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transactions Tab */}
      {tab==='transactions' && (
        <div className="overflow-auto rounded-md border border-neutral-800">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-900 text-gray-300">
              <tr>
                <th className="text-left px-3 py-2">User</th>
                <th className="text-left px-3 py-2">Type</th>
                <th className="text-left px-3 py-2">Amount</th>
                <th className="text-left px-3 py-2">Meta</th>
                <th className="text-left px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {(tx||[]).map(t => (
                <tr key={t._id} className="border-t border-neutral-800">
                  <td className="px-3 py-2">{t.userId}</td>
                  <td className="px-3 py-2">{t.type}</td>
                  <td className="px-3 py-2">{t.amount}</td>
                  <td className="px-3 py-2 whitespace-pre text-xs text-gray-400">{JSON.stringify(t.meta)}</td>
                  <td className="px-3 py-2">{new Date(t.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rewards Catalog Tab */}
      {tab==='catalog' && (
        <div className="grid gap-4">
          <div className="rounded-md border border-neutral-800 bg-neutral-900 p-3 grid gap-2">
            <div className="font-semibold text-white">Create new reward</div>
            <div className="flex flex-wrap items-center gap-2">
              <select className="px-2 py-1 rounded-md border border-neutral-700 bg-neutral-950 text-gray-200" value={newItem.method} onChange={e=>setNewItem(v=>({...v, method:e.target.value}))}>
                <option value="freefire">freefire</option>
                <option value="pubg">pubg</option>
                <option value="vodafone_cash">vodafone_cash</option>
              </select>
              <input className="px-2 py-1 rounded-md border border-neutral-700 bg-neutral-950 text-gray-200" placeholder="Label" value={newItem.label} onChange={e=>setNewItem(v=>({...v, label:e.target.value}))} />
              <input className="px-2 py-1 rounded-md border border-neutral-700 bg-neutral-950 text-gray-200 w-24" type="number" placeholder="Qty" value={newItem.qty} onChange={e=>setNewItem(v=>({...v, qty:Number(e.target.value||0)}))} />
              <input className="px-2 py-1 rounded-md border border-neutral-700 bg-neutral-950 text-gray-200 w-28" type="number" placeholder="Points" value={newItem.pricePoints} onChange={e=>setNewItem(v=>({...v, pricePoints:Number(e.target.value||0)}))} />
              <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={newItem.enabled} onChange={e=>setNewItem(v=>({...v, enabled:e.target.checked}))} /> Enabled
              </label>
              <button className="px-3 py-1 rounded-md border border-neutral-700 text-gray-200 hover:bg-neutral-800" onClick={createCatalogItem}>Add</button>
            </div>
          </div>

          <div className="grid gap-2">
            {catalog.map(it => (
              <div key={it._id} className="rounded-md border border-neutral-800 bg-neutral-900 p-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="text-sm text-gray-300">
                    <div className="text-white font-medium">{it.label}</div>
                    <div className="text-xs text-gray-400">method: {it.method} • qty: {it.qty} • points: {it.pricePoints} • enabled: {String(it.enabled)}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button className="px-3 py-1 rounded-md border border-neutral-700 text-gray-200 hover:bg-neutral-800" onClick={()=>updateCatalogItem(it._id, { enabled: !it.enabled })}>{it.enabled?'Disable':'Enable'}</button>
                    <button className="px-3 py-1 rounded-md border border-red-700 text-red-300 hover:bg-red-900/30" onClick={()=>removeCatalogItem(it._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Settings Tab */}
      {tab==='settings' && (
        <div className="grid gap-4">
          <div className="rounded-md border border-neutral-800 bg-neutral-900 p-3 grid gap-2">
            <div className="font-semibold text-white">Base pricing</div>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">FF: points per 100 diamonds</label>
                <input className="w-full px-2 py-1 rounded-md border border-neutral-700 bg-neutral-950 text-gray-200" type="number" value={settings?.freefire_per100_points ?? ''} onChange={e=>setSettings(s=>({...s, freefire_per100_points:Number(e.target.value||0)}))} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">PUBG: points per 60 UC</label>
                <input className="w-full px-2 py-1 rounded-md border border-neutral-700 bg-neutral-950 text-gray-200" type="number" value={settings?.pubg_per60_points ?? ''} onChange={e=>setSettings(s=>({...s, pubg_per60_points:Number(e.target.value||0)}))} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Vodafone: points per 1 EGP</label>
                <input className="w-full px-2 py-1 rounded-md border border-neutral-700 bg-neutral-950 text-gray-200" type="number" value={settings?.vodafone_points_per_egp ?? ''} onChange={e=>setSettings(s=>({...s, vodafone_points_per_egp:Number(e.target.value||0)}))} />
              </div>
            </div>
            <div className="flex items-center justify-end">
              <button className="px-3 py-1 rounded-md border border-neutral-700 text-gray-200 hover:bg-neutral-800" onClick={()=>saveSettings({ freefire_per100_points: settings?.freefire_per100_points, pubg_per60_points: settings?.pubg_per60_points, vodafone_points_per_egp: settings?.vodafone_points_per_egp })}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}