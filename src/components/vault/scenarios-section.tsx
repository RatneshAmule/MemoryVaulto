'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import {
  Globe,
  UserRound,
  Baby,
  Building,
  Heart,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useVaultStore } from './vault-store';

interface Scenario {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  story: string;
  tags: string[];
  iconColor: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'tourist',
    icon: Globe,
    title: 'The Unconscious Tourist',
    subtitle: 'Maria, 34, Spanish tourist collapses in NYC',
    story:
      'Maria Rodriguez, visiting from Madrid, collapses on a subway platform. No ID, no phone, unable to speak. ER doctors have zero medical history. A QR bracelet scan reveals her Type 1 diabetes, Penicillin allergy, and insulin regimen — preventing a fatal medication error within seconds of arrival.',
    tags: ['Unknown Identity', 'Hidden Allergies', 'Language Barrier'],
    iconColor: 'text-amber-500',
  },
  {
    id: 'elderly',
    icon: UserRound,
    title: 'The Elderly Man Alone',
    subtitle: 'James, 78, falls in bathroom, can\'t reach phone',
    story:
      'James Wilson lives alone after his wife passed. He falls in the bathroom, fracturing his hip and losing consciousness. Paramedics arrive to find him unresponsive. Facial recognition identifies him, revealing his warfarin therapy, A-fib, and prior stent — critical information for emergency surgery.',
    tags: ['No Emergency Contact', 'Critical Medications', 'Surgical History'],
    iconColor: 'text-red-500',
  },
  {
    id: 'foster',
    icon: Baby,
    title: 'The Foster Child',
    subtitle: 'Aiden, 6, seizure at school, no one knows history',
    story:
      'Aiden, in his third foster placement, has a prolonged seizure at school. Neither the school nurse nor the foster parents know his full medical history. MemoryVault reveals his epilepsy diagnosis, current medication Keppra, and that he missed his last two doses — enabling immediate, informed treatment.',
    tags: ['Fragile Records', 'Medication Gaps', 'Guardian Access'],
    iconColor: 'text-violet-500',
  },
  {
    id: 'mass-casualty',
    icon: Building,
    title: 'The Mass Casualty Event',
    subtitle: 'Building collapse, 87 victims, 3 hospitals',
    story:
      'A structural collapse sends 87 victims to 3 area hospitals. MemoryVault\'s mass casualty mode triages patients by severity, auto-matches blood types to supply, and distributes critical patient data across all facilities — preventing duplicate testing and allergic reactions at scale.',
    tags: ['Mass Triage', 'Resource Matching', 'Multi-Hospital Coordination'],
    iconColor: 'text-orange-500',
  },
  {
    id: 'refugee',
    icon: Heart,
    title: 'The Refugee Mother',
    subtitle: 'Amira, 29, 7 months pregnant, collapses at camp',
    story:
      'Amira fled conflict with no medical records. Seven months pregnant, she collapses at a refugee camp. No prenatal records, no blood type, no allergy information. MemoryVault\'s offline mesh network retrieves her self-registered profile, revealing Rh-negative blood type and a preeclampsia history — saving both lives.',
    tags: ['No Records', 'Language Barrier', 'Offline Access'],
    iconColor: 'text-emerald-500',
  },
];

export function ScenariosSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const { expandedScenario, setExpandedScenario } = useVaultStore();

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            5 Lives. 5 Stories.{' '}
            <span className="text-red-600">One Vault.</span>
          </h2>
          <p className="mt-4 text-slate-600 max-w-xl mx-auto">
            Real scenarios where access to medical history makes the difference
            between life and death.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {SCENARIOS.map((scenario, i) => {
            const isExpanded = expandedScenario === scenario.id;

            return (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
                className={i >= 3 ? 'lg:col-span-1 sm:col-span-1' : ''}
              >
                <Card
                  className={`h-full border-slate-200 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                    isExpanded ? 'ring-2 ring-emerald-500/30 border-emerald-200' : ''
                  }`}
                  onClick={() => setExpandedScenario(isExpanded ? null : scenario.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                        <scenario.icon className={`w-5 h-5 ${scenario.iconColor}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm">
                          {scenario.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {scenario.subtitle}
                        </p>
                      </div>
                      {isExpanded && (
                        <X className="w-4 h-4 text-slate-400 shrink-0 ml-auto" />
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {scenario.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] bg-slate-100 text-slate-600"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Expanded story */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="mt-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                            {scenario.story}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              document.querySelector('#demo')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            Try in Demo
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
