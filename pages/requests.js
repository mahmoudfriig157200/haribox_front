import Layout from '../components/Layout';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function RequestsPage() {
  const [jwt, setJwt] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('jwt') : '';
    if (t) { setJwt(t); load(t); }
  }, []);

  const load = async (token) => {
    const { data } = await api.get('/withdrawals', { params: { token } });
    setItems(data);
  };

  return (
    <Layout>
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-extrabold inline-flex items-center gap-2">
            <span>📜</span>
            <span>My Requests</span>
          </h1>
        </div>
        {items.length === 0 ? (
          <div className="text-sm text-gray-400">You have no requests.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-300">
                <tr className="border-b border-neutral-800">
                  <th className="text-left py-2 pr-3">Reward</th>
                  <th className="text-left py-2 pr-3">Request Date</th>
                  <th className="text-left py-2 pr-3">Status</th>
                  <th className="text-left py-2 pr-3">Redeem Code</th>
                </tr>
              </thead>
              <tbody>
                {items.map((w) => (
                  <tr key={w._id} className="border-b border-neutral-800">
                    <td className="py-2 pr-3">{w.rewardType} — {w.amount}</td>
                    <td className="py-2 pr-3">{new Date(w.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-3">
                      <span
                        className={
                          `inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ` +
                          (w.status === 'pending'
                            ? 'text-yellow-300 bg-yellow-900/30 border-yellow-800/50'
                            : w.status === 'approved'
                              ? 'text-green-300 bg-green-900/30 border-green-800/50'
                              : 'text-red-300 bg-red-900/30 border-red-800/50')
                        }
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-gray-500">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}