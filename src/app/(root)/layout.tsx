import '@/styles/globals.css';
import { BottomBar } from '@/components/shared/BottomBar';
import { LeftSideBar } from '@/components/shared/LeftSideBar';
import { RightSideBar } from '@/components/shared/RightSideBar';
import { TopBar } from '@/components/shared/TopBar';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { type Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  description: 'Next.js 13 Meta Threads Clone',
  title: 'Threads Clone',
};

const Layout = ({ children }: { readonly children: React.ReactNode }) => {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          <TopBar />
          <main className="flex flex-row">
            <LeftSideBar />
            <section className="main-container">
              <div className="w-full max-w-4xl">{children}</div>
            </section>
            <RightSideBar />
          </main>

          <BottomBar />
        </body>
      </html>
    </ClerkProvider>
  );
};

export default Layout;
