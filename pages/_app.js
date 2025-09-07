import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { setAuthToken } from '../lib/api';
import { useRouter } from 'next/router';

const client = new QueryClient();

export default function MyApp({ Component, pageProps }) {
  const [jwt, setJwt] = useState('');
  const router = useRouter();

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('jwt') : '';
    if (t) { setJwt(t); setAuthToken(t); }
  }, []);

  return (
    <QueryClientProvider client={client}>
      <Toaster position="top-center" />
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}