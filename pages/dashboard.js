import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

// Small UI helpers
function SectionHeader({ icon, title, onRefresh, refreshing, className = '' }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <h2 className="text-xl md:text-2xl font-extrabold inline-flex items-center gap-2">
        <span className="select-none" aria-hidden>{icon}</span>
        <span>{title}</span>
      </h2>
      {onRefresh && (
        <button
          aria-label="Refresh"
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-neutral-700 text-gray-200 hover:bg-neutral-800"
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh"
        >
          <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
        </button>
      )}
    </div>
  );
}

function StatCard({ label, value, hint, icon }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-lg">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm text-gray-400 truncate">{label}</div>
        <div className="text-white text-lg font-bold leading-tight truncate">{value}</div>
        {hint && <div className="text-[11px] text-gray-500 truncate">{hint}</div>}
      </div>
    </div>
  );
}

function ProgressBar({ percent }) {
  const pct = Math.max(0, Math.min(100, Math.round(percent || 0)));
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm md:text-base text-gray-300">Level Progress</div>
        <div className="text-sm md:text-base text-amber-300 font-semibold">{pct}%</div>
      </div>
      <div className="h-3 md:h-4 w-full bg-neutral-800 rounded">
        <div
          className="h-full rounded bg-gradient-to-r from-amber-500 via-yellow-400 to-green-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function FeaturedStrip({ items }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 overflow-x-auto">
      <div className="flex gap-3 snap-x snap-mandatory">
        {items.map((o, i) => {
          const img = o.image || o.banner || o.thumbnail || o.logo || o.icon || '';
          const title = o.name || o.title || 'Offer';
          const stars = o.stars || o.value || 1;
          return (
            <a
              key={o.id || o.offer_id || i}
              href={o.url || o.link || '#'}
              target="_blank"
              rel="noreferrer"
              className="snap-start relative min-w-[220px] max-w-[260px] h-[120px] rounded-xl overflow-hidden border border-amber-500/30 bg-neutral-800/60 hover:-translate-y-0.5 transition transform"
            >
              {img ? (
                <img src={img} alt="featured" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-neutral-800" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute top-2 left-2 text-[11px] text-amber-300 bg-black/40 border border-amber-500/40 rounded-full px-2 py-0.5">⭐ Featured</div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
                <div className="text-white font-semibold truncate">{title}</div>
                <div className="text-amber-300 text-sm whitespace-nowrap">+{stars}★</div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function OfferCard({ offer, expanded, onToggle }) {
  const key = offer.id || offer.offer_id;
  const title = offer.name || offer.title || 'Offer';
  const stars = offer.stars || offer.value || 1;
  const link = offer.url || offer.link || '#';
  const imgUrl = offer.image || offer.icon || offer.logo || offer.thumbnail || offer.img || '';
  const descCandidate = offer.description || offer.desc || offer.summary || offer.details || offer.body || offer.text || offer.offer_desc || offer.offerDescription || offer.long_description;
  const fullDesc = String(descCandidate || '').trim() || 'Complete this offer to earn stars.';
  const shortDesc = fullDesc.length > 160 ? fullDesc.slice(0, 160) + '…' : fullDesc;

  return (
    <div className="relative rounded-2xl p-4 md:p-5 border bg-neutral-800/80 border-neutral-700 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40">
      <div className="flex items-center gap-3">
        {imgUrl ? (
          <img alt="offer" src={imgUrl} className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-lg" />
        ) : (
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg bg-neutral-700/60 border border-neutral-700/50 animate-pulse" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-base md:text-lg truncate">{title}</div>
          {!expanded ? (
            <div className="text-sm md:text-base text-gray-400 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{shortDesc}</div>
          ) : (
            <div className="text-sm md:text-base text-gray-300 whitespace-pre-wrap">{fullDesc}</div>
          )}
          <button className="text-amber-300 text-xs md:text-sm mt-1" onClick={onToggle}>
            {expanded ? 'إخفاء' : 'اقرأ المزيد'}
          </button>
        </div>
        <div className="flex flex-col items-end gap-2 ml-2">
          <div className="text-amber-300 text-sm md:text-base font-semibold whitespace-nowrap">+{stars}★</div>
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-amber-600 hover:bg-amber-500 text-black font-semibold px-3 py-2 text-sm md:text-base"
          >
            {offer.cta || 'Start'}
          </a>
        </div>
      </div>
    </div>
  );
}

import SEO from '../components/SEO';

export default function Dashboard() {
  const [jwt, setJwt] = useState('');
  const [me, setMe] = useState(null);
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [expanded, setExpanded] = useState(new Set());
  const [filter, setFilter] = useState('all'); // all | featured | high | new

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('jwt') : '';
    if (t) setJwt(t);
  }, []);

  useEffect(() => {
    if (jwt) { loadMe(); loadOffers(); }
  }, [jwt]);

  const loadMe = async () => {
    try {
      const { data } = await api.get('/me', { params: { token: jwt } });
      setMe(data);
    } catch (_) {}
  };

  const loadOffers = async () => {
    try {
      setOffersLoading(true);
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const { data } = await api.get('/offers', { params: { token: jwt, max: 50, user_agent: ua } });
      const list = Array.isArray(data) ? data : (data.offers || data.items || []);
      setOffers(list);
    } catch (e) {
      console.warn('offers error', e?.response?.data || e.message);
    } finally {
      setOffersLoading(false);
    }
  };

  const toggleExpand = (key) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Derived data
  const points = me?.points ?? 0;
  const progressPercent = Math.min(100, (points % 100));
  const featured = useMemo(() => {
    return [...offers]
      .filter(o => (o.featured || (o.stars || o.value || 0) >= 10))
      .sort((a, b) => (b.stars || b.value || 0) - (a.stars || a.value || 0))
      .slice(0, 10);
  }, [offers]);

  const filteredOffers = useMemo(() => offers, [offers]);

  return (
    <Layout>
      <SEO title="لوحة التحكم — xo45ox" description="تابع نقاطك وآخر العروض على لوحة تحكم xo45ox." canonical="/dashboard" />
      <div className="w-full grid gap-6 mx-0">
        {/* Progress only */}
        <div className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-5 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-base md:text-lg text-gray-300">Level 1 Progress</div>
            <div className="text-base md:text-lg text-amber-300 font-semibold">{Math.round(progressPercent)}%</div>
          </div>
          <div className="h-3 md:h-4 w-full bg-neutral-800 rounded">
            <div className="h-full rounded bg-gradient-to-r from-amber-500 via-yellow-400 to-green-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Offers header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-extrabold inline-flex items-center gap-2">
            <span>🎁</span>
            <span>Offers for you</span>
          </h2>
          <button
            aria-label="Refresh offers"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-neutral-700 text-gray-200 hover:bg-neutral-800"
            onClick={loadOffers}
            disabled={offersLoading}
            title="Refresh"
          >
            <span className={offersLoading ? 'animate-spin' : ''}>🔄</span>
          </button>
        </div>

        {/* Offers list */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-2 md:p-3">
          <div className="max-w-[420px] sm:max-w-[520px] md:max-w-none mx-0 w-full grid gap-3 overflow-hidden relative">
            {!filteredOffers.length && !offersLoading && (
              <div className="text-sm text-gray-400">No offers available right now.</div>
            )}

            {/* Loading skeleton */}
            {offersLoading && (
              <div className="grid gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl p-4 border border-neutral-800 bg-neutral-900/60 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg bg-neutral-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-neutral-800 rounded w-2/3" />
                        <div className="h-3 bg-neutral-800 rounded w-11/12" />
                      </div>
                      <div className="w-16 h-7 bg-neutral-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!offersLoading && filteredOffers.map((o, idx) => {
              const key = o.id || o.offer_id || idx;
              // Compute user points: $1 = 100 pts, user gets half
              let userPts = 0;
              if (o.payout != null || o.value != null) {
                const usd = Number(o.payout ?? o.value ?? 0);
                userPts = Math.max(0, Math.round((usd * 100) / 2));
              } else {
                const pts = Number(o.stars || 0);
                userPts = Math.max(0, Math.floor(pts / 2));
              }
              const title = o.name || o.title || 'Offer';
              const imgUrl = (
                o.image || o.image_url || o.imageUrl ||
                o.icon || o.icon_url || o.iconUrl ||
                o.logo || o.logo_url || o.logoUrl ||
                o.banner || o.banner_url || o.bannerUrl ||
                o.thumbnail || o.thumbnail_url || o.thumbnailUrl ||
                o.picture || o.picture_url || o.pictureUrl ||
                o.img || o.img_url || o.imgUrl ||
                o.creative || o.creative_url || o.creativeUrl ||
                ''
              );
              const link = o.url || o.link || '#';
              return (
                <div key={key} className="relative rounded-lg p-2 md:p-2.5 border bg-neutral-800/80 border-neutral-700 w-full max-w-full md:max-w-none">
                  <a href={link} target="_blank" rel="noreferrer" className="w-full grid grid-cols-2 items-center gap-2">
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                      {imgUrl ? (
                        <img
                          alt="offer"
                          src={imgUrl}
                          className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-md flex-shrink-0"
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'56\' height=\'56\'><rect width=\'100%\' height=\'100%\' fill=\'%23888\'/></svg>'; }}
                        />
                      ) : (
                        <img
                          alt="offer"
                          src={imgUrl || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'56\' height=\'56\'><rect width=\'100%\' height=\'100%\' fill=\'%23888\'/></svg>'}
                          className="w-12 h-12 md:w-14 md:h-14 rounded-md bg-neutral-700/60 border border-neutral-700/50 object-cover"
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'56\' height=\'56\'><rect width=\'100%\' height=\'100%\' fill=\'%23888\'/></svg>'; }}
                        />
                      )}
                      <div className="min-w-0 overflow-hidden">
                        <div className="text-white font-medium text-xs md:text-sm truncate">{title}</div>
                      </div>
                    </div>
                    <div className="text-amber-300 text-xs md:text-sm font-semibold whitespace-nowrap justify-self-end text-right pl-2">+{userPts} نقطة</div>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}