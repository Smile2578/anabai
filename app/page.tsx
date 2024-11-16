// app/page.tsx
import { Suspense } from 'react';
import NavBar from '@/components/navigation/NavBar';
import AnabaLogo from '@/components/brand/AnabaLogo';
import Hero from '@/components/sections/Hero';
import Services from '@/components/sections/Services';
import Footer from '@/components/navigation/Footer';
import Features from '@/components/sections/Features';
import Destinations from '@/components/sections/Destinations';
import CallToAction from '@/components/sections/CallToAction';
import Testimonials from '@/components/sections/Testimonials';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  return (
    <>
      <header
        className={cn(
          'fixed top-0 z-50 flex w-full items-center justify-between',
          'px-4 py-4 md:px-8 md:py-6',
          'pointer-events-none'
        )}
      >
        <Suspense fallback={<div className="h-16" />}>
          <div className="pointer-events-auto">
            <NavBar />
          </div>
        </Suspense>

        <Suspense fallback={<div className="h-16" />}>
          <div
            className={cn('pointer-events-auto ml-auto', 'mt-2 mr-4 md:mt-0 md:mr-8')}
          >
            <AnabaLogo />
          </div>
        </Suspense>
      </header>

      <main>
        <Hero />
        <Services />
        <Features />
        <Destinations />
        <CallToAction />
        <Testimonials />
      </main>

      <Footer />
    </>
  );
}
