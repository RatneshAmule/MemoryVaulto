'use client';

import { motion } from 'framer-motion';
import { ScanLine, Shield, Heart, Activity, Fingerprint, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ICONS = [ScanLine, Shield, Heart, Activity];
const LABELS = ['Scan', 'Verify', 'Unlock', 'Act'];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
  }),
};

export function Hero() {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center bg-[#0f172a] dot-pattern overflow-hidden"
    >
      {/* Subtle radial glow */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-400 tracking-wide">
                Emergency-Grade Medical Intelligence
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight"
            >
              When Seconds Count,{' '}
              <span className="text-red-500">Silence is Fatal</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
              className="mt-6 text-lg text-slate-400 leading-relaxed max-w-xl"
            >
              AI-powered emergency medical vault that speaks for you when you
              can&apos;t. Critical patient history unlocked in 5 seconds — through
              biometrics, QR, or facial recognition.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Button
                onClick={() => scrollTo('#demo')}
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-8 h-12 text-base"
              >
                See It In Action
              </Button>
              <Button
                onClick={() => scrollTo('#problem')}
                variant="outline"
                size="lg"
                className="border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 hover:bg-white/5 px-8 h-12 text-base"
              >
                Learn the Problem
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-8 flex items-center gap-6 text-xs text-slate-500"
            >
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                <span>Biometric Secured</span>
              </div>
              <div className="flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>Offline Ready</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Animated illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              {/* Central glowing circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-56 h-56 rounded-full border border-emerald-500/10" />
                <div className="absolute w-40 h-40 rounded-full border border-emerald-500/15" />
                <div className="absolute w-24 h-24 rounded-full bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-emerald-500" />
                </div>
              </div>

              {/* Connection line */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-slate-700 via-emerald-500/30 to-slate-700 -translate-y-1/2" />

              <div className="flex items-center gap-8 relative">
                {ICONS.map((Icon, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center gap-3"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`w-16 h-16 rounded-xl flex items-center justify-center cursor-default ${
                        i === 0
                          ? 'bg-amber-500/10 border border-amber-500/20'
                          : i === 1
                          ? 'bg-emerald-500/10 border border-emerald-500/20'
                          : i === 2
                          ? 'bg-red-500/10 border border-red-500/20'
                          : 'bg-slate-500/10 border border-slate-500/20'
                      }`}
                    >
                      <Icon
                        className={`w-7 h-7 ${
                          i === 0
                            ? 'text-amber-500'
                            : i === 1
                            ? 'text-emerald-500'
                            : i === 2
                            ? 'text-red-500'
                            : 'text-slate-400'
                        }`}
                      />
                    </motion.div>
                    <span className="text-xs text-slate-500 font-medium tracking-wide">
                      {LABELS[i]}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stat bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: 'easeOut' }}
          className="mt-16 md:mt-24 pt-8 border-t border-slate-800"
        >
          <div className="flex flex-wrap justify-center md:justify-start gap-8 md:gap-16">
            {[
              { value: '5s', label: 'Access Time' },
              { value: '23', label: 'Problems Solved' },
              { value: '15K+', label: 'Lives Projected' },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center md:text-left">
                <div className="text-2xl font-bold text-emerald-500">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
