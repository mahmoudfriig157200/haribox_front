import Head from 'next/head';

const SITE_NAME = 'xo45ox';
const DEFAULT_TITLE = 'xo45ox — اربح نقاط واستبدلها بجوائز';
const DEFAULT_DESC = 'xo45ox: منصة مكافآت CPA — اكسب النقاط من العروض واستبدلها بجوائز بطريقة سهلة وآمنة.';
const DEFAULT_LOCALE = 'ar';
const DEFAULT_TYPE = 'website';

function absoluteUrl(path = '', baseUrl) {
  const origin = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://xo45ox.site';
  if (!path) return origin;
  try { return new URL(path, origin).toString(); } catch { return origin; }
}

export default function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  canonical,
  noindex = false,
  openGraph = {},
  twitter = {},
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xo45ox.site';
  const canonicalUrl = absoluteUrl(canonical || '', siteUrl);

  // Open Graph defaults
  const og = {
    type: openGraph.type || DEFAULT_TYPE,
    locale: openGraph.locale || DEFAULT_LOCALE,
    site_name: openGraph.site_name || SITE_NAME,
    title: openGraph.title || title,
    description: openGraph.description || description,
    url: absoluteUrl(openGraph.url || canonical || '', siteUrl),
    images: openGraph.images || [],
  };

  const twitterMeta = {
    card: twitter.card || 'summary_large_image',
    site: twitter.site || '@xo45ox',
    creator: twitter.creator || '@xo45ox',
  };

  const robots = noindex ? 'noindex, nofollow' : 'index, follow';

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={og.type} />
      <meta property="og:locale" content={og.locale} />
      <meta property="og:site_name" content={og.site_name} />
      <meta property="og:title" content={og.title} />
      <meta property="og:description" content={og.description} />
      {og.url && <meta property="og:url" content={og.url} />}
      {og.images && og.images.slice(0,4).map((img, i) => (
        <meta key={i} property="og:image" content={absoluteUrl(img, siteUrl)} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterMeta.card} />
      <meta name="twitter:site" content={twitterMeta.site} />
      <meta name="twitter:creator" content={twitterMeta.creator} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {/* PWA/Icons baseline */}
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}