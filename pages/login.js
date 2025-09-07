import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, setAuthToken } from '../lib/api';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

import SEO from '../components/SEO';

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post('/auth/login', values);
      localStorage.setItem('jwt', data.token);
      setAuthToken(data.token);
      toast.success('Welcome back!');
      router.push('/dashboard');
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
      <SEO title="تسجيل الدخول — xo45ox" description="سجّل دخولك إلى xo45ox لمتابعة جمع النقاط واستبدالها." canonical="/login" />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
          <h1 className="text-2xl font-extrabold text-white mb-4">تسجيل الدخول</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div>
              <label className="label">البريد الإلكتروني</label>
              <input className="input" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">كلمة المرور</label>
              <input className="input" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>
            <button className="btn" type="submit" disabled={isSubmitting}>تسجيل الدخول</button>
          </form>
          <p className="text-sm text-gray-400 mt-3">ليس لديك حساب؟ <a className="text-amber-400 hover:underline" href="/register">إنشاء حساب</a></p>
        </div>
      </div>
    </>
  );
}