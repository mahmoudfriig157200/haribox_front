import Link from 'next/link';
import SEO from '../components/SEO';

export default function Home() {
  const title = 'xo45ox — اربح النقاط من العروض واستبدلها بجوائز';
  const description = 'انضم إلى xo45ox، منصّة مكافآت CPA: نفّذ العروض، اجمع النقاط، واستبدلها بجوائز نقدية ورصيد ألعاب بسهولة وأمان.';

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonical="/"
        openGraph={{ images: ['/og-cover.svg'] }}
      />
      <div className="grid gap-6">
        <div className="card p-8 text-center grid gap-4">
          <h1 className="text-3xl font-semibold">xo45ox — منصّة مكافآت العروض</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            نفّذ العروض، اجمع النقاط، واستبدلها بجوائزك المفضّلة. ابدأ الآن وسنقترح لك عروضًا مناسبة.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link className="btn" href="/register">ابدأ الآن</Link>
            <Link className="btn-outline" href="/login">لدي حساب بالفعل</Link>
          </div>
        </div>
      </div>
    </>
  );
}