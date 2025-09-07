import SEO from '../components/SEO';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 prose prose-invert">
      <SEO title="الشروط والأحكام — xo45ox" description="الشروط العامة لاستخدام منصة xo45ox." canonical="/terms" />
      <h1>الشروط والأحكام</h1>
      <p>باستخدامك xo45ox، فإنك توافق على الالتزام بالقواعد التالية.</p>
      <ul>
        <li>ممنوع الاحتيال أو إنشاء حسابات متعددة للأرباح غير المشروعة.</li>
        <li>قد يتم إغلاق الحسابات المخالفة مع مصادرة النقاط.</li>
        <li>نحتفظ بحق تحديث هذه الشروط في أي وقت.</li>
      </ul>
    </div>
  );
}