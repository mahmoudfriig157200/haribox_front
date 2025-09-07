import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../lib/api';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

import SEO from '../components/SEO';

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      await api.post('/auth/register', values);
      toast.success('Account created. Please sign in.');
      router.push('/login');
    } catch (e) {
      toast.error(e.response?.data?.error || e.message);
    }
  };

  // If already logged in, redirect to dashboard
  if (typeof window !== 'undefined' && localStorage.getItem('jwt')) {
    router.replace('/dashboard');
    return null;
  }

  return (
    <>
      <SEO title="إنشاء حساب — xo45ox" description="أنشئ حسابك في xo45ox وابدأ بجمع النقاط واستبدالها بجوائز." canonical="/register" />
      <div className="max-w-md mx-auto card p-6">
        <h1 className="text-2xl font-semibold mb-4">إنشاء حساب</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div>
            <label className="label">البريد الإلكتروني</label>
            <input className="input" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">كلمة المرور</label>
            <input className="input" type="password" placeholder="6 أحرف على الأقل" {...register('password')} />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <button className="btn" type="submit" disabled={isSubmitting}>إنشاء الحساب</button>
        </form>
        <p className="text-sm text-gray-600 mt-3">لديك حساب؟ <a className="text-primary-600 hover:underline" href="/login">سجّل الدخول</a></p>
      </div>
    </>
  );
}