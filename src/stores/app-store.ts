import { create } from 'zustand';

export type PageId = 'landing' | 'auth' | 'patient-dashboard' | 'emergency' | 'hospital' | 'access-logs' | 'war-room' | 'demo' | 'ai-lab' | 'analytics';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  hospital?: string | null;
  patient?: PatientData | null;
}

export interface PatientData {
  id: string;
  userId: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  rhFactor?: string | null;
  dnr: boolean;
  organDonor: boolean;
  tissueDonor: boolean;
  occupation?: string | null;
  workplace?: string | null;
  primaryLanguage: string;
  secondaryLanguages?: string | null;
  pregnancyStatus?: string | null;
  lastMenstrualPeriod?: string | null;
  insuranceProvider?: string | null;
  insuranceId?: string | null;
  weight?: number | null;
  height?: number | null;
  ethnicity?: string | null;
  religion?: string | null;
  nationality?: string | null;
  refugeeStatus: boolean;
  veteranStatus: boolean;
  militaryBranch?: string | null;
  deployments?: string | null;
  disabilityStatus?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  emergencyNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string; role: string; hospital?: string | null };
  allergies: AllergyItem[];
  medications: MedicationItem[];
  conditions: ConditionItem[];
  surgeries: SurgeryItem[];
  implants: ImplantItem[];
  vaccinations: VaccinationItem[];
  emergencyContacts: EmergencyContactItem[];
  consentProxies: ConsentProxyItem[];
  accessLogs?: AccessLogItem[];
  medicalTests?: MedicalTestItem[];
  pharmacogenomics?: PharmacogenomicItem[];
  vitalBaselines?: VitalBaselineItem[];
  bloodAntibodies?: BloodAntibodyItem[];
  culturalDirectives?: CulturalDirectiveItem[];
  voiceMessages?: VoiceMessageItem[];
  advanceDirectives?: AdvanceDirectiveItem[];
  medicationAdherence?: MedicationAdherenceItem[];
  painProfile?: PainProfileItem | null;
  geneticFlags?: GeneticFlagItem[];
  deviceIntegrations?: DeviceIntegrationItem[];
  occupationalExposures?: OccupationalExposureItem[];
  radiationExposures?: RadiationExposureItem[];
  caregiverPasses?: CaregiverPassItem[];
  medicalTimeline?: MedicalTimelineEventItem[];
  dischargeAssessments?: DischargeAssessmentItem[];
}

export interface AllergyItem { id: string; patientId: string; name: string; severity: string; reaction?: string | null; lastReactionDate?: string | null; treatmentRequired?: string | null; crossReactivity?: string | null; }
export interface MedicationItem { id: string; patientId: string; name: string; dose: string; frequency: string; startDate?: string | null; endDate?: string | null; prescriber?: string | null; category?: string | null; isOpioid: boolean; isPsychMed: boolean; requiresMonitoring: boolean; adherenceScore?: number | null; }
export interface ConditionItem { id: string; patientId: string; name: string; diagnosedDate?: string | null; status: string; severity?: string | null; icdCode?: string | null; cluster?: string | null; }
export interface SurgeryItem { id: string; patientId: string; name: string; date: string; hospital?: string | null; surgeon?: string | null; bodyRegion?: string | null; notes?: string | null; }
export interface ImplantItem { id: string; patientId: string; name: string; implantDate: string; manufacturer?: string | null; serialNumber?: string | null; bodyLocation?: string | null; mriSafe: boolean; }
export interface VaccinationItem { id: string; patientId: string; name: string; date: string; status: string; nextDue?: string | null; }
export interface EmergencyContactItem { id: string; patientId: string; name: string; relationship: string; phone: string; email?: string | null; priority: number; canConsent: boolean; language?: string | null; }
export interface ConsentProxyItem { id: string; patientId: string; proxyName: string; relationship: string; phone: string; email?: string | null; priority: number; verified: boolean; governmentId?: string | null; consentScope?: string | null; activeFrom?: string | null; }
export interface AccessLogItem { id: string; accessorId: string; patientId: string; accessType: string; accessMethod: string; accessTier?: string | null; reason?: string | null; dataViewed: string; overrideReason?: string | null; timestamp: string; expiresAt?: string | null; accessor: { id: string; name: string; role: string; hospital?: string | null }; }
export interface MedicalTestItem { id: string; patientId: string; testName: string; testDate: string; facility?: string | null; results?: string | null; orderingDoc?: string | null; status: string; radiationDose?: number | null; }
export interface PharmacogenomicItem { id: string; patientId: string; gene: string; variant: string; implications: string; medications?: string | null; }
export interface VitalBaselineItem { id: string; patientId: string; vitalType: string; value: number; unit: string; source: string; recordedDate: string; }
export interface BloodAntibodyItem { id: string; patientId: string; antibody: string; antibodyType: string; detectedDate: string; significance: string; }
export interface CulturalDirectiveItem { id: string; patientId: string; religion: string; directive: string; description: string; overrideAllowed: boolean; }
export interface VoiceMessageItem { id: string; patientId: string; category: string; title: string; audioUrl?: string | null; duration?: number | null; transcript?: string | null; isActive: boolean; }
export interface AdvanceDirectiveItem { id: string; patientId: string; directiveType: string; description: string; documentUrl?: string | null; createdDate: string; expiryDate?: string | null; witnessName?: string | null; notarized: boolean; isActive: boolean; }
export interface MedicationAdherenceItem { id: string; patientId: string; medicationName: string; overallScore: number; lastRefillDate?: string | null; missedDosesLast30Days?: number | null; source: string; updatedDate: string; }
export interface PainProfileItem { id: string; patientId: string; chronicPainConditions: string; currentPainPlan: string; opioidTolerance: string; opioidUseDisorderHistory: string; effectiveMedications: string; ineffectiveMedications: string; painMedAllergies: string; sickleCellStatus: boolean; mmeDailyDose?: number | null; naloxonePrescribed: boolean; painManagementDoctor?: string | null; }
export interface GeneticFlagItem { id: string; patientId: string; condition: string; gene?: string | null; implications: string; medicationsToAvoid?: string | null; safeAlternatives?: string | null; familyScreening: boolean; }
export interface DeviceIntegrationItem { id: string; patientId: string; deviceType: string; deviceName: string; manufacturer?: string | null; model?: string | null; serialNumber?: string | null; lastSyncDate?: string | null; batteryLevel?: number | null; dataSummary?: string | null; isActive: boolean; }
export interface OccupationalExposureItem { id: string; patientId: string; workplace: string; hazardType: string; specificAgent?: string | null; exposureLevel?: string | null; msdsReference?: string | null; lastExposure?: string | null; ppeRequired?: string | null; }
export interface RadiationExposureItem { id: string; patientId: string; source: string; bodyRegion: string; doseMSv: number; studyDate: string; facility?: string | null; cumulativeTotal?: number | null; }
export interface CaregiverPassItem { id: string; patientId: string; caregiverName: string; relationship: string; accessLevel: number; qrCode: string; issuedAt: string; expiresAt: string; isActive: boolean; }
export interface MedicalTimelineEventItem { id: string; patientId: string; eventType: string; title: string; description: string; eventDate: string; facility?: string | null; severity?: string | null; icon?: string | null; }
export interface DischargeAssessmentItem { id: string; patientId: string; visitDate: string; dischargeSafetyScore: number; readmissionRisk?: number | null; aiRecommendation?: string | null; }

interface AppState {
  currentPage: PageId;
  currentUser: User | null;
  currentPatient: PatientData | null;
  sidebarSection: string;
  authMode: 'login' | 'register';
  selectedPatientId: string | null;
  warRoomId: string | null;
  authToken: string | null;

  setCurrentPage: (page: PageId) => void;
  setCurrentUser: (user: User | null) => void;
  setCurrentPatient: (patient: PatientData | null) => void;
  setSidebarSection: (section: string) => void;
  setAuthMode: (mode: 'login' | 'register') => void;
  setSelectedPatientId: (id: string | null) => void;
  setWarRoomId: (id: string | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { email: string; password: string; name: string; role: string; hospital?: string }) => Promise<boolean>;
  logout: () => void;
  fetchPatient: (patientId: string) => Promise<boolean>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentPage: 'landing',
  currentUser: null,
  currentPatient: null,
  sidebarSection: 'profile',
  authMode: 'login',
  selectedPatientId: null,
  warRoomId: null,
  authToken: null,

  setCurrentPage: (page) => set({ currentPage: page }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentPatient: (patient) => set({ currentPatient: patient }),
  setSidebarSection: (section) => set({ sidebarSection: section }),
  setAuthMode: (mode) => set({ authMode: mode }),
  setSelectedPatientId: (id) => set({ selectedPatientId: id }),
  setWarRoomId: (id) => set({ warRoomId: id }),

  // Authenticated fetch helper - automatically includes JWT token as Bearer
  // Note: Cookie-based auth is the primary mechanism (set below in login/register).
  // This helper is for components that explicitly need Bearer auth.
  authFetch: (url, options = {}) => {
    const token = get().authToken;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
  },

  login: async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return false;
      // Store JWT token in state and as cookie for automatic auth on all API calls
      set({ currentUser: data.user, authToken: data.token || null });
      if (data.token) {
        // Set as HttpOnly-compatible cookie (8h expiry matching JWT expiry)
        document.cookie = `token=${data.token}; path=/; max-age=${8 * 60 * 60}; SameSite=Strict`;
      }
      if (data.user.role === 'patient' && data.user.patient) {
        const patientRes = await fetch(`/api/patients/${data.user.patient.id}`);
        const patientData = await patientRes.json();
        if (patientRes.ok) set({ currentPatient: patientData.patient });
        else set({ currentPatient: data.user.patient });
        set({ currentPage: 'patient-dashboard' });
      } else {
        set({ currentPage: 'hospital' });
      }
      return true;
    } catch { return false; }
  },

  register: async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) return false;
      // Store JWT token in state and as cookie for automatic auth on all API calls
      set({ currentUser: data.user, authToken: data.token || null });
      if (data.token) {
        document.cookie = `token=${data.token}; path=/; max-age=${8 * 60 * 60}; SameSite=Strict`;
      }
      if (data.patient) {
        set({ currentPatient: data.patient as PatientData });
        set({ currentPage: 'patient-dashboard' });
      } else {
        set({ currentPage: 'hospital' });
      }
      return true;
    } catch { return false; }
  },

  logout: () => {
    // Clear auth cookie
    document.cookie = 'token=; path=/; max-age=0';
    set({ currentUser: null, currentPatient: null, currentPage: 'landing', sidebarSection: 'profile', selectedPatientId: null, warRoomId: null, authToken: null });
  },

  fetchPatient: async (patientId) => {
    try {
      const res = await fetch(`/api/patients/${patientId}`);
      const data = await res.json();
      if (!res.ok) return false;
      set({ currentPatient: data.patient });
      return true;
    } catch { return false; }
  },
}));
