'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface StatItem {
  value: string;
  numericPart: number;
  suffix: string;
  description: string;
  source: string;
}

const STATS: StatItem[] = [
  {
    value: '7M+',
    numericPart: 7,
    suffix: 'M+',
    description: 'Patients harmed annually by medical errors',
    source: 'WHO',
  },
  {
    value: '$12B',
    numericPart: 12,
    suffix: 'B',
    description: 'Wasted on duplicate testing each year',
    source: '',
  },
  {
    value: '108M',
    numericPart: 108,
    suffix: 'M',
    description: 'Displaced people with no medical records',
    source: '',
  },
  {
    value: '15K+',
    numericPart: 15,
    suffix: 'K+',
    description: 'Lives projected to be saved annually',
    source: '',
  },
];

function AnimatedCounter({
  target,
  suffix,
  inView,
}: {
  target: number;
  suffix: string;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [inView, target]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="impact" className="bg-[#1e293b] py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            The Numbers That Demand{' '}
            <span className="text-emerald-500">Action</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.value}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-bold text-emerald-500">
                <AnimatedCounter
                  target={stat.numericPart}
                  suffix={stat.suffix}
                  inView={isInView}
                />
              </div>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-[200px] mx-auto">
                {stat.description}
              </p>
              {stat.source && (
                <span className="text-xs text-slate-500 mt-1 inline-block">
                  ({stat.source})
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
