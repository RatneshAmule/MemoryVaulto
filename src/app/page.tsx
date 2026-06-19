'use client';

import { useAppStore } from '@/stores/app-store';
import { LandingPage } from '@/components/landing/landing-page';
import { AuthPage } from '@/components/auth/auth-page';
import { PatientDashboard } from '@/components/patient/patient-dashboard';
import { EmergencyPortal } from '@/components/emergency/emergency-portal';
import { HospitalDashboard } from '@/components/hospital/hospital-dashboard';
import { AccessLogsPage } from '@/components/hospital/access-logs-page';
import { WarRoomPage } from '@/components/war-room/war-room-page';
import { DemoModePage } from '@/components/demo/demo-mode-page';
import { AiLabPage } from '@/components/ai-lab/ai-lab-page';
import { AnalyticsPage } from '@/components/analytics/analytics-page';

export default function Home() {
  const { currentPage } = useAppStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'landing': return <LandingPage />;
      case 'auth': return <AuthPage />;
      case 'patient-dashboard': return <PatientDashboard />;
      case 'emergency': return <EmergencyPortal />;
      case 'hospital': return <HospitalDashboard />;
      case 'access-logs': return <AccessLogsPage />;
      case 'war-room': return <WarRoomPage />;
      case 'demo': return <DemoModePage />;
      case 'ai-lab': return <AiLabPage />;
      case 'analytics': return <AnalyticsPage />;
      default: return <LandingPage />;
    }
  };

  return <main className="min-h-screen bg-slate-950 text-slate-100">{renderPage()}</main>;
}
