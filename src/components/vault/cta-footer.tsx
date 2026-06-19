'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Shield, Activity, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTAFooter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <footer className="bg-[#0f172a]">
      {/* CTA Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/3 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center max-w-2xl mx-auto"
          >
            {/* Small icon cluster */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Heart className="w-4 h-4 text-red-500" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-amber-500" />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.15]">
              Because Silence Should Never Be{' '}
              <span className="text-red-500">Fatal</span>
            </h2>
            <p className="mt-5 text-lg text-slate-400 leading-relaxed">
              Join the movement to give every patient a voice in their most
              vulnerable moment. No one should die because a doctor didn&apos;t know.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-8 h-12 text-base"
              >
                Get Early Access
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 hover:bg-white/5 px-8 h-12 text-base"
              >
                Partner With Us
              </Button>
            </div>

            <p className="mt-6 text-xs text-slate-600">
              Free for individual patients. Institutional plans available.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-slate-500">
                MemoryVault &copy; 2026
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="hover:text-slate-400 cursor-pointer transition-colors">
                Privacy Policy
              </span>
              <span className="hover:text-slate-400 cursor-pointer transition-colors">
                Terms
              </span>
              <span className="hover:text-slate-400 cursor-pointer transition-colors">
                Contact
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Built for Hackathon 2026 — Saving lives, one vault at a time.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
