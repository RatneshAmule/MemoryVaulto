'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Fingerprint,
  FileHeart,
  Brain,
  Hospital,
  Users,
  ShieldCheck,
  Wifi,
  Check,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface FeatureLayer {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  features: string[];
  color: string;
  bgColor: string;
}

const LAYERS: FeatureLayer[] = [
  {
    id: 'identification',
    title: 'Multi-Modal Identification',
    icon: Fingerprint,
    description:
      'Six identification methods ensure no patient is ever anonymous. From QR wearables to facial recognition, the vault adapts to every scenario.',
    features: [
      'QR Bracelet / Necklace Scan',
      'Facial Recognition (AI-powered)',
      'Fingerprint Biometrics',
      'Voice Pattern Matching',
      'NFC Medical Badge',
      'Hospital ID Badge Link',
    ],
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    id: 'profile',
    title: 'Smart Medical Profile',
    icon: FileHeart,
    description:
      'Structured, prioritized medical data that surfaces what matters most in an emergency — red flags first, details on demand.',
    features: [
      'Red Flag Alerts (auto-surfaced)',
      'Drug Interaction Checks',
      'Condition Timeline',
      'Implant Registry',
      'Blood Group & Organ Donor Status',
      'Vaccination Records',
    ],
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: 'ai',
    title: 'AI Emergency Intelligence',
    icon: Brain,
    description:
      'Real-time AI analysis that transforms raw medical data into actionable emergency protocols, predictive risk scores, and time-critical recommendations.',
    features: [
      'Auto-Triage Classification',
      'Predictive Risk Scoring',
      'Golden Window Countdown',
      'Drug Pre-Administration Checks',
      'Comorbidity Interaction Map',
      'Post-Surgical Alert System',
    ],
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    id: 'hospital',
    title: 'Hospital Operations',
    icon: Hospital,
    description:
      'Seamless hospital integration that turns patient data into operational readiness — from ambulance to operating room.',
    features: [
      'Ambulance Pre-Notification',
      'ER Command Dashboard',
      'Resource Matching (Blood, OR, Staff)',
      'Mass Casualty Triage Mode',
      'OR Pre-Preparation Queue',
      'Bed & Equipment Allocation',
    ],
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
  },
  {
    id: 'human',
    title: 'Human Chain',
    icon: Users,
    description:
      'Connects the patient to their support network instantly — emergency contacts, physicians, family portal, across language barriers.',
    features: [
      'Emergency Contact Cascade',
      'Primary Physician Bridge',
      'Multi-Language Communication',
      'Consent Proxy System',
      'Family Information Portal',
      'Social Worker Notification',
    ],
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
  {
    id: 'privacy',
    title: 'Privacy & Legal',
    icon: ShieldCheck,
    description:
      'Tiered access controls and blockchain-audited compliance ensure data is available when needed and protected at all other times.',
    features: [
      'Tiered Access Control',
      'Blockchain Audit Trail',
      'Emergency Override Protocol',
      'Auto-Expiry Windows',
      'HIPAA / GDPR Compliance',
      'Data Sovereignty Controls',
    ],
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
  },
  {
    id: 'infrastructure',
    title: 'Resilient Infrastructure',
    icon: Wifi,
    description:
      'Built to work when everything else fails. Offline-first architecture with mesh networking and dead man switches for worst-case scenarios.',
    features: [
      'Offline-First Architecture',
      'Mesh Network Propagation',
      'Dead Man\'s Switch',
      'Wearable Vitals Streaming',
      'Satellite Backup Channel',
      'Disaster Recovery Mode',
    ],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="features" className="bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            7 Layers of Intelligent{' '}
            <span className="text-emerald-600">Protection</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Each layer builds on the last, creating an unbreakable chain from
            identification to treatment.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
        >
          <Tabs defaultValue="identification" className="w-full">
            {/* Tab triggers - horizontal scroll on mobile */}
            <div className="overflow-x-auto custom-scrollbar pb-2 -mx-4 px-4">
              <TabsList className="inline-flex h-auto gap-1 bg-slate-100 p-1.5 rounded-lg w-max min-w-full">
                {LAYERS.map((layer, i) => (
                  <TabsTrigger
                    key={layer.id}
                    value={layer.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap"
                  >
                    <span className="text-slate-400 font-mono text-xs">{i + 1}.</span>
                    <span className="hidden sm:inline">{layer.title}</span>
                    <layer.icon className="w-4 h-4 sm:hidden" />
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab content */}
            {LAYERS.map((layer) => (
              <TabsContent key={layer.id} value={layer.id} className="mt-8">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  {/* Description */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-lg ${layer.bgColor} flex items-center justify-center`}
                      >
                        <layer.icon className={`w-5 h-5 ${layer.color}`} />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {layer.title}
                      </h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {layer.description}
                    </p>
                    <Badge variant="secondary" className="mt-4">
                      Layer {LAYERS.indexOf(layer) + 1} of {LAYERS.length}
                    </Badge>
                  </div>

                  {/* Feature list */}
                  <div className="grid grid-cols-1 gap-3">
                    {layer.features.map((feature, j) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: j * 0.06, duration: 0.3 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div
                          className={`w-6 h-6 rounded-full ${layer.bgColor} flex items-center justify-center shrink-0`}
                        >
                          <Check className={`w-3.5 h-3.5 ${layer.color}`} />
                        </div>
                        <span className="text-sm text-slate-700">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}
