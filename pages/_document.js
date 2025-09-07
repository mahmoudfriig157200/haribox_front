import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  const siteName = 'xo45ox';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xo45ox.site';
  const siteDesc = 'xo45ox: منصة مكافآت CPA — اكسب النقاط من العروض واستبدلها بجوائز بطريقة سهلة وآمنة.';

  return (
    <Html lang="en" dir="ltr">
      <Head>
        {/* Base SEO */}
        <meta name="application-name" content={siteName} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        <meta name="format-detection" content="telephone=no" />

        {/* Preconnects for performance */}
        <link rel="preconnect" href={siteUrl} />
        <link rel="dns-prefetch" href={siteUrl} />

        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Open Graph defaults (override per page via SEO component) */}
        <meta property="og:site_name" content={siteName} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content="xo45ox — Earn points and redeem rewards" />
        <meta property="og:description" content={siteDesc} />

        {/* Structured data (Organization) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: siteName,
              url: siteUrl,
              logo: `${siteUrl}/icon-512x512.png`,
            }),
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}