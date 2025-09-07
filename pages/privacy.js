import SEO from '../components/SEO';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 prose prose-invert">
      <SEO title="سياسة الخصوصية — xo45ox" description="تعرف على كيفية تعامل xo45ox مع بياناتك وخصوصيتك." canonical="/privacy" />
      <h1>سياسة الخصوصية</h1>
      <p>نحترم خصوصيتك. نستخدم البيانات لتقديم الخدمة، تحسين الأداء، ومحاربة الاحتيال. لا نبيع بياناتك.</p>
      <h2>البيانات التي نجمعها</h2>
      <ul>
        <li>معلومات الحساب الأساسية (البريد الإلكتروني)</li>
        <li>نقاطك وسجل عمليات السحب</li>
        <li>معلومات تقنية (IP, User-Agent) للأمان</li>
      </ul>
      <h2>مشاركة البيانات</h2>
      <p>قد نشارك بياناتًا لامتثال قانوني أو منع الاحتيال فقط.</p>
      <h2>اتصل بنا</h2>
      <p>للاستفسارات: support@xo45ox.site</p>
    </div>
  );
}