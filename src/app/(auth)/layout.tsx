import '@/styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { type Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  description: 'Next.js 13 Meta Threads Clone',
  title: 'Threads Clone',
};

const Layout = ({ children }: { readonly children: React.ReactNode }) => {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
};

export default Layout;
