'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { UserX, AlertTriangle, Pill, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const PROBLEMS = [
  {
    icon: UserX,
    title: 'Unknown Identity',
    description: 'Unconscious patient arrives with no ID. Doctors operate blind, unable to access medical history or verify identity.',
    stat: '2.5M',
    statLabel: 'ER visits/year',
  },
  {
    icon: AlertTriangle,
    title: 'Hidden Allergies',
    description: 'Wrong medication administered to patients with unknown allergies. A preventable tragedy that happens every day.',
    stat: '1 in 10',
    statLabel: 'patients harmed (WHO)',
  },
  {
    icon: Pill,
    title: 'Missing Medications',
    description: 'Drug interactions from unknown current prescriptions. Critical information gaps lead to adverse events.',
    stat: '2.2M',
    statLabel: 'adverse events/year',
  },
  {
    icon: Clock,
    title: 'No Time',
    description: 'The golden hour wasted on chart retrieval and identity verification instead of treatment.',
    stat: '22 min',
    statLabel: 'avg. chart retrieval',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' },
  }),
};

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="problem" className="bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Every 60 Seconds, Someone Arrives{' '}
            <span className="text-red-600">Unconscious</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            In emergencies, the information blackout is deadly. Patients who
            cannot speak for themselves face preventable harm — simply because
            doctors don&apos;t know their medical history.
          </p>
        </motion.div>

        <div className="mt-14 grid sm:grid-cols-2 gap-5 md:gap-6">
          {PROBLEMS.map((problem, i) => (
            <motion.div
              key={problem.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <Card className="group h-full border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                      <problem.icon className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 text-lg">
                        {problem.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                        {problem.description}
                      </p>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-xl font-bold text-red-600">
                          {problem.stat}
                        </span>
                        <span className="text-xs text-slate-500">
                          {problem.statLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
