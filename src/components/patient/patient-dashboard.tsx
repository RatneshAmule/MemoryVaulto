'use client';

import { useAppStore } from '@/stores/app-store';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Shield, LogOut, User, Heart, Pill, AlertTriangle, Scissors, Battery, Syringe,
  Phone, FileCheck, Brain, Dna, Activity, Droplets, Globe, Mic, FileText,
  Thermometer, Radio, Cpu, HardHat, Radiation, HandHelping, Clock, Settings,
  LayoutDashboard, Zap, Play, FlaskConical, KeyRound, Home, BarChart3, RadioTower
} from 'lucide-react';
import { ProfileSection } from '@/components/patient/profile-section';
import { AllergiesSection } from '@/components/patient/allergies-section';
import { MedicationsSection } from '@/components/patient/medications-section';
import { ConditionsSection } from '@/components/patient/conditions-section';
import { SurgeriesSection } from '@/components/patient/surgeries-section';
import { ImplantsSection } from '@/components/patient/implants-section';
import { VaccinationsSection } from '@/components/patient/vaccinations-section';
import { ContactsSection } from '@/components/patient/contacts-section';
import { ConsentProxiesSection } from '@/components/patient/consent-proxies-section';
import { PharmacogenomicsSection } from '@/components/patient/sections/pharmacogenomics-section';
import { VitalBaselinesSection } from '@/components/patient/sections/vital-baselines-section';
import { BloodAntibodiesSection } from '@/components/patient/sections/blood-antibodies-section';
import { CulturalDirectivesSection } from '@/components/patient/sections/cultural-directives-section';
import { VoiceMessagesSection } from '@/components/patient/sections/voice-messages-section';
import { AdvanceDirectivesSection } from '@/components/patient/sections/advance-directives-section';
import { MedicationAdherenceSection } from '@/components/patient/sections/medication-adherence-section';
import { PainProfileSection } from '@/components/patient/sections/pain-profile-section';
import { GeneticFlagsSection } from '@/components/patient/sections/genetic-flags-section';
import { DeviceIntegrationsSection } from '@/components/patient/sections/device-integrations-section';
import { OccupationalExposuresSection } from '@/components/patient/sections/occupational-exposures-section';
import { RadiationExposureSection } from '@/components/patient/sections/radiation-exposure-section';
import { MedicalTimelineSection } from '@/components/patient/sections/medical-timeline-section';
import { MedicalTestsSection } from '@/components/patient/sections/medical-tests-section';
import { CaregiverPassesSection } from '@/components/patient/sections/caregiver-passes-section';
import { DischargeSection } from '@/components/patient/sections/discharge-section';

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'allergies', label: 'Allergies', icon: AlertTriangle },
  { id: 'medications', label: 'Medications', icon: Pill },
  { id: 'conditions', label: 'Conditions', icon: Heart },
  { id: 'surgeries', label: 'Surgeries', icon: Scissors },
  { id: 'implants', label: 'Implants', icon: Battery },
  { id: 'vaccinations', label: 'Vaccinations', icon: Syringe },
  { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
  { id: 'consent-proxies', label: 'Consent Proxies', icon: FileCheck },
  { id: 'tests', label: 'Medical Tests', icon: FlaskConical },
  { id: 'caregiver', label: 'Caregiver Passes', icon: KeyRound },
  { id: 'pharmacogenomics', label: 'Pharmacogenomics', icon: Dna },
  { id: 'vital-baselines', label: 'Vital Baselines', icon: Activity },
  { id: 'blood-antibodies', label: 'Blood Antibodies', icon: Droplets },
  { id: 'cultural-directives', label: 'Cultural Directives', icon: Globe },
  { id: 'voice-messages', label: 'Voice Messages', icon: Mic },
  { id: 'advance-directives', label: 'Advance Directives', icon: FileText },
  { id: 'medication-adherence', label: 'Med Adherence', icon: Thermometer },
  { id: 'pain-profile', label: 'Pain Profile', icon: Brain },
  { id: 'genetic-flags', label: 'Genetic Flags', icon: Dna },
  { id: 'device-integrations', label: 'Devices', icon: Cpu },
  { id: 'occupational-exposures', label: 'Occupational', icon: HardHat },
  { id: 'radiation-exposure', label: 'Radiation', icon: Radiation },
  { id: 'discharge', label: 'Discharge Safety', icon: Home },
  { id: 'timeline', label: 'Timeline', icon: Clock },
];

export function PatientDashboard() {
  const { currentPatient, currentUser, sidebarSection, setSidebarSection, logout, setCurrentPage } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

  if (!currentPatient || !currentUser) return null;

  const criticalCount = [
    currentPatient.allergies.filter(a => a.severity === 'severe' || a.severity === 'life-threatening').length,
    currentPatient.geneticFlags?.length || 0,
    currentPatient.dnr ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const renderSection = () => {
    switch (sidebarSection) {
      case 'profile': return <ProfileSection />;
      case 'allergies': return <AllergiesSection />;
      case 'medications': return <MedicationsSection />;
      case 'conditions': return <ConditionsSection />;
      case 'surgeries': return <SurgeriesSection />;
      case 'implants': return <ImplantsSection />;
      case 'vaccinations': return <VaccinationsSection />;
      case 'contacts': return <ContactsSection />;
      case 'consent-proxies': return <ConsentProxiesSection />;
      case 'tests': return <MedicalTestsSection />;
      case 'caregiver': return <CaregiverPassesSection />;
      case 'pharmacogenomics': return <PharmacogenomicsSection />;
      case 'vital-baselines': return <VitalBaselinesSection />;
      case 'blood-antibodies': return <BloodAntibodiesSection />;
      case 'cultural-directives': return <CulturalDirectivesSection />;
      case 'voice-messages': return <VoiceMessagesSection />;
      case 'advance-directives': return <AdvanceDirectivesSection />;
      case 'medication-adherence': return <MedicationAdherenceSection />;
      case 'pain-profile': return <PainProfileSection />;
      case 'genetic-flags': return <GeneticFlagsSection />;
      case 'device-integrations': return <DeviceIntegrationsSection />;
      case 'occupational-exposures': return <OccupationalExposuresSection />;
      case 'radiation-exposure': return <RadiationExposureSection />;
      case 'discharge': return <DischargeSection />;
      case 'timeline': return <MedicalTimelineSection />;
      default: return <ProfileSection />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <div className={`${collapsed ? 'w-16' : 'w-64'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all`}>
        <div className="p-3 border-b border-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && <span className="font-bold text-sm bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">MemoryVault</span>}
          <Button variant="ghost" size="sm" className="ml-auto p-1 h-6 w-6" onClick={() => setCollapsed(!collapsed)}>
            <LayoutDashboard className="w-3 h-3" />
          </Button>
        </div>

        {/* Patient info */}
        <div className="p-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-red-400" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{currentUser.name}</div>
                <div className="text-xs text-slate-400">{currentPatient.bloodType}{currentPatient.rhFactor || ''} • {currentPatient.gender}</div>
              </div>
            )}
          </div>
          {!collapsed && criticalCount > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {currentPatient.dnr && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">DNR</Badge>}
              {currentPatient.organDonor && <Badge className="text-[10px] px-1.5 py-0 bg-green-600">Organ Donor</Badge>}
              {criticalCount > 0 && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{criticalCount} Critical</Badge>}
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <div className="p-1">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setSidebarSection(s.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors mb-0.5 ${
                  sidebarSection === s.id ? 'bg-red-500/10 text-red-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <s.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="truncate">{s.label}</span>}
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 border-t border-slate-800 space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-400" onClick={() => setCurrentPage('analytics')}>
            <BarChart3 className="w-4 h-4" />{!collapsed && 'Analytics'}
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-400" onClick={() => setCurrentPage('war-room')}>
            <RadioTower className="w-4 h-4" />{!collapsed && 'War Room'}
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-400" onClick={() => setCurrentPage('demo')}>
            <Play className="w-4 h-4" />{!collapsed && 'Demo Mode'}
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-400" onClick={() => setCurrentPage('ai-lab')}>
            <Zap className="w-4 h-4" />{!collapsed && 'AI Lab'}
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-400" onClick={logout}>
            <LogOut className="w-4 h-4" />{!collapsed && 'Logout'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <motion.div key={sidebarSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6">
          {renderSection()}
        </motion.div>
      </div>
    </div>
  );
}
