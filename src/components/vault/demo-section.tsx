'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVaultStore, type DemoTab } from './vault-store';
import { EmergencyAccess } from './emergency-access';
import { PatientVault } from './patient-vault';
import { HospitalDashboard } from './hospital-dashboard';
import { AIIntelligence } from './ai-intelligence';

const DEMO_TABS: { value: DemoTab; label: string }[] = [
  { value: 'emergency', label: 'Emergency Access' },
  { value: 'vault', label: 'Patient Vault' },
  { value: 'hospital', label: 'Hospital Command' },
  { value: 'ai', label: 'AI Intelligence' },
];

export function DemoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { demoTab, setDemoTab } = useVaultStore();

  return (
    <section id="demo" className="bg-[#0f172a] py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Experience the{' '}
            <span className="text-emerald-500">Vault</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Interactive demo showing how MemoryVault works in real emergency
            scenarios. Click, explore, and see the impact.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
        >
          <Tabs
            value={demoTab}
            onValueChange={(v) => setDemoTab(v as DemoTab)}
            className="w-full"
          >
            {/* Tab bar */}
            <div className="overflow-x-auto custom-scrollbar pb-2 -mx-4 px-4">
              <TabsList className="inline-flex h-auto gap-1 bg-slate-800 p-1.5 rounded-lg w-max min-w-full">
                {DEMO_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="px-4 py-2.5 text-sm data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 whitespace-nowrap"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Content */}
            <div className="mt-6 bg-[#1e293b] rounded-xl border border-slate-700/50 p-5 md:p-8">
              <TabsContent value="emergency" className="mt-0">
                <EmergencyAccess />
              </TabsContent>
              <TabsContent value="vault" className="mt-0">
                <PatientVault />
              </TabsContent>
              <TabsContent value="hospital" className="mt-0">
                <HospitalDashboard />
              </TabsContent>
              <TabsContent value="ai" className="mt-0">
                <AIIntelligence />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}
