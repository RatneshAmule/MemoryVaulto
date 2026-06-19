import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { enforceAccess } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Only admins can seed the database
    const authResult = await enforceAccess(['admin'], request);
    if (!authResult.allowed) {
      return NextResponse.json({ error: 'Admin access required to seed database' }, { status: 403 });
    }

    const body = request.json ? await request.json().catch(() => ({})) : {};
    if (body.force) {
      // Delete all existing data to re-seed - try each, ignore errors for missing tables
      const models = ['warRoomMessage','warRoomUpdate','warRoomMember','familyWarRoom','organMatch','outbreakAlert','notification','dischargeAssessment','caregiverPass','radiationExposure','occupationalExposure','deviceIntegration','geneticFlag','painProfile','medicationAdherence','advanceDirective','voiceMessage','culturalDirective','bloodAntibody','vitalBaseline','pharmacogenomic','medicalTimelineEvent','accessLog','medicalTest','consentProxy','emergencyContact','vaccination','implant','surgery','condition','medication','allergy','drugInteractionRule','patient','user'];
      for (const m of models) {
        try { await (db as any)[m]?.deleteMany(); } catch {}
      }
    }
    // Check if already seeded (unless force=true)
    if (!body.force) {
      const existing = await db.user.findFirst();
      if (existing) {
        return NextResponse.json({ message: 'Database already seeded', seeded: false });
      }
    }

    // SECURITY: Use environment variable for seed password, fallback for dev only
    const seedPassword = process.env.SEED_PASSWORD || 'DevPass123!';
    const hash = (pw: string) => bcrypt.hashSync(pw, 12);

    // Create users
    const maria = await db.user.create({ data: { email: 'maria@test.com', password: hash(seedPassword), name: 'Maria Garcia', role: 'patient' } });
    const james = await db.user.create({ data: { email: 'james@test.com', password: hash(seedPassword), name: 'James Wilson', role: 'patient' } });
    const aidan = await db.user.create({ data: { email: 'aidan@test.com', password: hash(seedPassword), name: 'Aidan Brooks', role: 'patient' } });
    const drChen = await db.user.create({ data: { email: 'dr.chen@test.com', password: hash(seedPassword), name: 'Dr. Sarah Chen', role: 'doctor', hospital: 'City General Hospital' } });
    const paramedic1 = await db.user.create({ data: { email: 'paramedic@test.com', password: hash(seedPassword), name: 'Mike Rodriguez', role: 'paramedic', hospital: 'Metro EMS' } });
    const admin = await db.user.create({ data: { email: 'admin@test.com', password: hash(seedPassword), name: 'Admin', role: 'admin' } });

    // Maria Garcia - Spanish tourist, T1 diabetic, allergic to NSAIDs
    const mariaPatient = await db.patient.create({
      data: {
        userId: maria.id, dateOfBirth: '1990-03-15', gender: 'female', bloodType: 'A', rhFactor: '-',
        dnr: false, organDonor: true, tissueDonor: true, occupation: 'Tourist', primaryLanguage: 'Spanish',
        secondaryLanguages: 'English', pregnancyStatus: 'not-pregnant', nationality: 'Spanish',
        refugeeStatus: false, veteranStatus: false, weight: 58, height: 163, religion: 'Catholic',
        city: 'New York', state: 'NY', zipCode: '10001', emergencyNotes: 'Visiting from Barcelona. Please speak Spanish if possible.',
        allergies: {
          create: [
            { name: 'NSAIDs', severity: 'severe', reaction: 'Anaphylaxis', lastReactionDate: '2023-06-10', treatmentRequired: 'Epinephrine', crossReactivity: 'Aspirin,Ibuprofen,Naproxen' },
            { name: 'Penicillin', severity: 'moderate', reaction: 'Hives', treatmentRequired: 'Antihistamine' },
            { name: 'Sulfa drugs', severity: 'mild', reaction: 'Rash' },
          ]
        },
        medications: {
          create: [
            { name: 'Insulin Glargine', dose: '22 units', frequency: 'Once daily at bedtime', category: 'diabetes', adherenceScore: 92 },
            { name: 'Insulin Lispro', dose: '6-10 units', frequency: 'Before meals', category: 'diabetes', adherenceScore: 88 },
            { name: 'Metformin', dose: '500mg', frequency: 'Twice daily', category: 'diabetes', adherenceScore: 95 },
          ]
        },
        conditions: {
          create: [
            { name: 'Type 1 Diabetes', diagnosedDate: '2005-08-20', status: 'chronic', severity: 'moderate', icdCode: 'E10', cluster: 'metabolic' },
            { name: 'Celiac Disease', diagnosedDate: '2018-01-15', status: 'chronic', severity: 'mild', icdCode: 'K90.0' },
          ]
        },
        surgeries: { create: [{ name: 'Appendectomy', date: '2015-04-10', bodyRegion: 'abdomen' }] },
        implants: { create: [] },
        vaccinations: {
          create: [
            { name: 'COVID-19 (Pfizer)', date: '2023-09-15', status: 'completed' },
            { name: 'Tetanus', date: '2021-03-01', status: 'completed', nextDue: '2031-03-01' },
            { name: 'Hepatitis B', date: '2020-01-01', status: 'completed' },
          ]
        },
        emergencyContacts: {
          create: [
            { name: 'Carlos Garcia', relationship: 'Husband', phone: '+34-612-345-678', email: 'carlos@email.com', priority: 1, canConsent: true, language: 'Spanish' },
            { name: 'Elena Garcia', relationship: 'Mother', phone: '+34-611-234-567', priority: 2, language: 'Spanish' },
          ]
        },
        consentProxies: {
          create: [
            { proxyName: 'Carlos Garcia', relationship: 'Husband', phone: '+34-612-345-678', priority: 1, verified: true, consentScope: 'full' },
          ]
        },
        pharmacogenomics: {
          create: [
            { gene: 'CYP2D6', variant: 'poor-metabolizer', implications: 'Cannot effectively metabolize codeine, tramadol. Use alternative pain management.', medications: 'Codeine,Tramadol,Ondansetron' },
          ]
        },
        vitalBaselines: {
          create: [
            { vitalType: 'bp_systolic', value: 112, unit: 'mmHg', source: 'routine-visit', recordedDate: '2024-01-15' },
            { vitalType: 'bp_diastolic', value: 68, unit: 'mmHg', source: 'routine-visit', recordedDate: '2024-01-15' },
            { vitalType: 'heart_rate', value: 74, unit: 'bpm', source: 'wearable-average', recordedDate: '2024-02-01' },
            { vitalType: 'hba1c', value: 7.1, unit: '%', source: 'routine-visit', recordedDate: '2024-01-15' },
          ]
        },
        bloodAntibodies: { create: [] },
        culturalDirectives: {
          create: [
            { religion: 'Catholic', directive: 'last-rites', description: 'Request last rites from a Catholic priest if condition is critical.', overrideAllowed: false },
          ]
        },
        voiceMessages: {
          create: [
            { category: 'intro', title: 'Introduction', transcript: 'Hello, my name is Maria Garcia. I am 34 years old, from Barcelona, Spain. I have Type 1 Diabetes and I am severely allergic to NSAIDs and Penicillin.', duration: 45, isActive: true },
            { category: 'end-of-life', title: 'End of Life Wishes', transcript: 'If I am critically ill, I want all reasonable measures taken to save my life, but I do not want to be on permanent life support.', duration: 20, isActive: true },
          ]
        },
        advanceDirectives: {
          create: [
            { directiveType: 'living-will', description: 'No blood products under any circumstances. No permanent ventilator.', createdDate: '2023-01-10', notarized: true, witnessName: 'Carlos Garcia' },
            { directiveType: 'power-of-attorney', description: 'Carlos Garcia has full medical power of attorney', createdDate: '2023-01-10', notarized: true },
          ]
        },
        medicationAdherence: {
          create: [
            { medicationName: 'Insulin Glargine', overallScore: 92, missedDosesLast30Days: 2, source: 'smart-pillbox', updatedDate: '2024-02-15' },
            { medicationName: 'Insulin Lispro', overallScore: 88, missedDosesLast30Days: 4, source: 'self-reported', updatedDate: '2024-02-15' },
            { medicationName: 'Metformin', overallScore: 95, missedDosesLast30Days: 1, source: 'pharmacy-data', updatedDate: '2024-02-15' },
          ]
        },
        painProfile: {
          create: {
            chronicPainConditions: 'Diabetic neuropathy (mild)',
            currentPainPlan: 'Managing with gabapentin 300mg TID as needed',
            opioidTolerance: 'naive', opioidUseDisorderHistory: 'none',
            effectiveMedications: 'Gabapentin,Acetaminophen',
            ineffectiveMedications: 'Codeine (CYP2D6 poor metabolizer)',
            painMedAllergies: 'NSAIDs',
            sickleCellStatus: false, naloxonePrescribed: false,
          }
        },
        geneticFlags: { create: [] },
        deviceIntegrations: {
          create: [
            { deviceType: 'cgm', deviceName: 'Dexcom G7', manufacturer: 'Dexcom', lastSyncDate: '2024-02-20', batteryLevel: 72, dataSummary: '{"glucose": 145, "trend": "rising", "timeInRange": "78%"}' },
          ]
        },
        occupationalExposures: { create: [] },
        radiationExposures: {
          create: [
            { source: 'ct-scan', bodyRegion: 'abdomen', doseMSv: 8.0, studyDate: '2023-06-10', facility: 'Hospital Barcelona', cumulativeTotal: 8.0 },
          ]
        },
        caregiverPasses: { create: [] },
        medicalTimeline: {
          create: [
            { eventType: 'diagnosis', title: 'Type 1 Diabetes Diagnosed', description: 'Diagnosed at age 15', eventDate: '2005-08-20', severity: 'critical', icon: 'Syringe' },
            { eventType: 'surgery', title: 'Appendectomy', description: 'Emergency appendectomy', eventDate: '2015-04-10', severity: 'significant', icon: 'Scissors' },
            { eventType: 'er-visit', title: 'ER Visit - Allergic Reaction', description: 'Anaphylaxis from NSAID exposure', eventDate: '2023-06-10', severity: 'critical', icon: 'ShieldAlert' },
          ]
        },
      }
    });

    // James Wilson - Elderly veteran, on blood thinners, pacemaker
    const jamesPatient = await db.patient.create({
      data: {
        userId: james.id, dateOfBirth: '1946-07-22', gender: 'male', bloodType: 'A', rhFactor: '+',
        dnr: true, organDonor: false, tissueDonor: false, occupation: 'Retired', workplace: 'US Army (1964-1972)',
        primaryLanguage: 'English', veteranStatus: true, militaryBranch: 'Army', deployments: 'Vietnam',
        weight: 78, height: 175, religion: 'Protestant', city: 'Chicago', state: 'IL', zipCode: '60601',
        emergencyNotes: 'DNR - comfort care only. Has pacemaker - avoid MRI without cardiology consult.',
        allergies: {
          create: [
            { name: 'Penicillin', severity: 'severe', reaction: 'Anaphylaxis', treatmentRequired: 'Epinephrine', crossReactivity: 'Amoxicillin,Ampicillin' },
          ]
        },
        medications: {
          create: [
            { name: 'Eliquis (Apixaban)', dose: '5mg', frequency: 'Twice daily', category: 'cardiac', adherenceScore: 90, requiresMonitoring: true },
            { name: 'Metoprolol', dose: '50mg', frequency: 'Twice daily', category: 'cardiac', adherenceScore: 85 },
            { name: 'Lisinopril', dose: '10mg', frequency: 'Once daily', category: 'cardiac', adherenceScore: 88 },
            { name: 'Atorvastatin', dose: '40mg', frequency: 'Once daily at bedtime', category: 'cardiac', adherenceScore: 92 },
          ]
        },
        conditions: {
          create: [
            { name: 'Atrial Fibrillation', diagnosedDate: '2019-03-01', status: 'chronic', severity: 'moderate', icdCode: 'I48', cluster: 'cardiac' },
            { name: 'Hypertension', diagnosedDate: '2015-06-15', status: 'chronic', severity: 'moderate', icdCode: 'I10', cluster: 'cardiac' },
            { name: 'Hyperlipidemia', diagnosedDate: '2016-01-10', status: 'chronic', severity: 'mild', icdCode: 'E78.5', cluster: 'metabolic' },
            { name: 'PTSD', diagnosedDate: '1972-01-01', status: 'chronic', severity: 'moderate', icdCode: 'F43.10', cluster: 'mental_health' },
          ]
        },
        surgeries: {
          create: [
            { name: 'Pacemaker Implantation', date: '2020-09-15', bodyRegion: 'chest', surgeon: 'Dr. Patel', hospital: 'City General Hospital' },
          ]
        },
        implants: {
          create: [
            { name: 'Medtronic Pacemaker', implantDate: '2020-09-15', manufacturer: 'Medtronic', serialNumber: 'MP-2020-44821', bodyLocation: 'chest', mriSafe: false },
          ]
        },
        vaccinations: {
          create: [
            { name: 'Tetanus', date: '2022-01-15', status: 'completed', nextDue: '2032-01-15' },
            { name: 'COVID-19 (Moderna)', date: '2023-10-01', status: 'completed' },
          ]
        },
        emergencyContacts: {
          create: [
            { name: 'David Wilson', relationship: 'Son', phone: '312-555-0123', email: 'david@email.com', priority: 1, canConsent: true },
          ]
        },
        consentProxies: {
          create: [
            { proxyName: 'David Wilson', relationship: 'Son', phone: '312-555-0123', priority: 1, verified: true, consentScope: 'full', activeFrom: 'upon-incapacitation' },
          ]
        },
        pharmacogenomics: {
          create: [
            { gene: 'CYP2C19', variant: 'intermediate-metabolizer', implications: 'Reduced metabolism of clopidogrel.', medications: 'Clopidogrel' },
          ]
        },
        vitalBaselines: {
          create: [
            { vitalType: 'bp_systolic', value: 128, unit: 'mmHg', source: 'routine-visit', recordedDate: '2024-01-20' },
            { vitalType: 'bp_diastolic', value: 78, unit: 'mmHg', source: 'routine-visit', recordedDate: '2024-01-20' },
          ]
        },
        bloodAntibodies: { create: [] },
        culturalDirectives: { create: [] },
        voiceMessages: {
          create: [
            { category: 'intro', title: 'Introduction & Wishes', transcript: 'Hello, my name is James Wilson. I am 78 years old. I have a DNR — do not resuscitate. Comfort care only.', duration: 35, isActive: true },
          ]
        },
        advanceDirectives: {
          create: [
            { directiveType: 'dnr', description: 'Do Not Resuscitate. Comfort care only.', createdDate: '2022-06-15', notarized: true, witnessName: 'David Wilson' },
          ]
        },
        medicationAdherence: {
          create: [
            { medicationName: 'Eliquis', overallScore: 90, missedDosesLast30Days: 3, source: 'pharmacy-data', updatedDate: '2024-02-18' },
          ]
        },
        painProfile: {
          create: {
            chronicPainConditions: 'Osteoarthritis (right knee)',
            currentPainPlan: 'Acetaminophen 500mg TID',
            opioidTolerance: 'naive', opioidUseDisorderHistory: 'none',
            effectiveMedications: 'Acetaminophen',
            ineffectiveMedications: '',
            painMedAllergies: '',
            sickleCellStatus: false, naloxonePrescribed: false,
          }
        },
        geneticFlags: { create: [] },
        deviceIntegrations: {
          create: [
            { deviceType: 'pacemaker', deviceName: 'Medtronic Advisa', manufacturer: 'Medtronic', serialNumber: 'MP-2020-44821', lastSyncDate: '2024-02-15', batteryLevel: 65, dataSummary: '{"mode": "DDD"}' },
          ]
        },
        occupationalExposures: {
          create: [
            { workplace: 'US Army', hazardType: 'noise', specificAgent: 'Artillery fire', exposureLevel: 'high', lastExposure: '1972' },
          ]
        },
        radiationExposures: {
          create: [
            { source: 'ct-scan', bodyRegion: 'chest', doseMSv: 7.0, studyDate: '2024-01-20', facility: 'City General Hospital', cumulativeTotal: 22.0 },
          ]
        },
        caregiverPasses: { create: [] },
        medicalTimeline: {
          create: [
            { eventType: 'diagnosis', title: 'Atrial Fibrillation', description: 'Started on Eliquis and Metoprolol', eventDate: '2019-03-01', severity: 'critical', icon: 'HeartPulse' },
            { eventType: 'surgery', title: 'Pacemaker Implantation', description: 'Medtronic dual-chamber pacemaker', eventDate: '2020-09-15', severity: 'critical', icon: 'Battery' },
          ]
        },
      }
    });

    // Aidan Brooks - 6-year-old foster child with Dravet Syndrome
    const aidanPatient = await db.patient.create({
      data: {
        userId: aidan.id, dateOfBirth: '2018-05-12', gender: 'male', bloodType: 'O', rhFactor: '+',
        dnr: false, organDonor: false, tissueDonor: false, occupation: 'Child', primaryLanguage: 'English',
        weight: 22, height: 110, disabilityStatus: 'cognitive', city: 'Portland', state: 'OR', zipCode: '97201',
        emergencyNotes: 'Foster child - Dravet Syndrome. DO NOT give carbamazepine or lamotrigine.',
        allergies: {
          create: [
            { name: 'Carbamazepine', severity: 'life-threatening', reaction: 'Status epilepticus', crossReactivity: 'Oxcarbazepine' },
            { name: 'Latex', severity: 'moderate', reaction: 'Contact urticaria' },
          ]
        },
        medications: {
          create: [
            { name: 'Fenflurazole', dose: '0.5mg/kg', frequency: 'Twice daily', category: 'neurological', adherenceScore: 95 },
            { name: 'Valproic Acid', dose: '15mg/kg', frequency: 'Twice daily', category: 'neurological', adherenceScore: 90, requiresMonitoring: true },
            { name: 'Clobazam', dose: '0.2mg/kg', frequency: 'Once daily', category: 'neurological', isPsychMed: true },
          ]
        },
        conditions: {
          create: [
            { name: 'Dravet Syndrome', diagnosedDate: '2019-02-01', status: 'chronic', severity: 'severe', icdCode: 'G40.83', cluster: 'neurological' },
            { name: 'Immunocompromised', diagnosedDate: '2019-06-01', status: 'chronic', severity: 'moderate' },
            { name: 'Developmental Delay', diagnosedDate: '2020-01-01', status: 'chronic', severity: 'moderate' },
          ]
        },
        surgeries: { create: [] },
        implants: { create: [] },
        vaccinations: {
          create: [
            { name: 'DTaP', date: '2023-01-15', status: 'completed' },
            { name: 'MMR', date: '2022-06-01', status: 'completed' },
          ]
        },
        emergencyContacts: {
          create: [
            { name: 'Susan Miller', relationship: 'Case Worker', phone: '503-555-0123', priority: 1, canConsent: true },
            { name: 'Robert & Karen Lee', relationship: 'Foster Parents', phone: '503-555-0456', priority: 2, canConsent: true },
          ]
        },
        consentProxies: {
          create: [
            { proxyName: 'Susan Miller', relationship: 'Case Worker', phone: '503-555-0123', priority: 1, verified: true, consentScope: 'full' },
          ]
        },
        pharmacogenomics: { create: [] },
        vitalBaselines: {
          create: [
            { vitalType: 'heart_rate', value: 95, unit: 'bpm', source: 'routine-visit', recordedDate: '2024-01-10' },
            { vitalType: 'weight', value: 22, unit: 'kg', source: 'routine-visit', recordedDate: '2024-01-10' },
          ]
        },
        bloodAntibodies: { create: [] },
        culturalDirectives: { create: [] },
        voiceMessages: { create: [] },
        advanceDirectives: { create: [] },
        medicationAdherence: {
          create: [
            { medicationName: 'Fenflurazole', overallScore: 95, missedDosesLast30Days: 1, source: 'caregiver-reported', updatedDate: '2024-02-15' },
            { medicationName: 'Valproic Acid', overallScore: 90, missedDosesLast30Days: 3, source: 'caregiver-reported', updatedDate: '2024-02-15' },
          ]
        },
        painProfile: { create: {
          chronicPainConditions: 'Post-seizure headaches',
          currentPainPlan: 'Acetaminophen 15mg/kg post-seizure as needed',
          opioidTolerance: 'naive', opioidUseDisorderHistory: 'none',
          effectiveMedications: 'Acetaminophen',
          ineffectiveMedications: '',
          painMedAllergies: '',
          sickleCellStatus: false, naloxonePrescribed: false,
        }},
        geneticFlags: {
          create: [
            { condition: 'dravet-syndrome', gene: 'SCN1A', implications: 'Sodium channel mutation. Avoid sodium channel blockers.', medicationsToAvoid: 'Carbamazepine,Oxcarbazepine,Lamotrigine', safeAlternatives: 'Valproic Acid,Fenflurazole,Clobazam', familyScreening: true },
          ]
        },
        deviceIntegrations: { create: [] },
        occupationalExposures: { create: [] },
        radiationExposures: { create: [] },
        caregiverPasses: { create: [] },
        medicalTimeline: {
          create: [
            { eventType: 'diagnosis', title: 'Dravet Syndrome Diagnosed', description: 'SCN1A mutation confirmed.', eventDate: '2019-02-01', severity: 'critical', icon: 'Brain' },
            { eventType: 'er-visit', title: 'Status Epilepticus - 45 min', description: 'Prolonged seizure requiring ICU admission', eventDate: '2023-08-15', severity: 'critical', icon: 'ShieldAlert' },
          ]
        },
      }
    });

    // Drug Interaction Rules
    await db.drugInteractionRule.createMany({
      data: [
        { drugName: 'Warfarin', contraindication: 'NSAIDs', type: 'medication', severity: 'danger', description: 'Increased bleeding risk with NSAIDs', alternative: 'Acetaminophen' },
        { drugName: 'Warfarin', contraindication: 'Aspirin', type: 'medication', severity: 'danger', description: 'Severe bleeding risk', alternative: 'Acetaminophen' },
        { drugName: 'Eliquis', contraindication: 'NSAIDs', type: 'medication', severity: 'danger', description: 'Increased bleeding risk', alternative: 'Acetaminophen' },
        { drugName: 'Metoprolol', contraindication: 'Verapamil', type: 'medication', severity: 'danger', description: 'Risk of severe bradycardia and heart block' },
        { drugName: 'Lisinopril', contraindication: 'Pregnancy', type: 'condition', severity: 'danger', description: 'Teratogenic - causes fetal renal abnormalities', alternative: 'Labetalol or Nifedipine' },
        { drugName: 'Morphine', contraindication: 'MAOIs', type: 'medication', severity: 'danger', description: 'Serotonin syndrome risk', alternative: 'Fentanyl (cautiously)' },
        { drugName: 'Codeine', contraindication: 'CYP2D6 poor metabolizer', type: 'genetic', severity: 'warning', description: 'Codeine will be ineffective', alternative: 'Hydromorphone or Tramadol' },
        { drugName: 'Succinylcholine', contraindication: 'Malignant hyperthermia', type: 'genetic', severity: 'danger', description: 'Fatal reaction', alternative: 'Rocuronium' },
        { drugName: 'Carbamazepine', contraindication: 'Dravet Syndrome', type: 'condition', severity: 'danger', description: 'Worsens seizures in Dravet syndrome', alternative: 'Valproic Acid or Levetiracetam' },
        { drugName: 'Penicillin', contraindication: 'Penicillin allergy', type: 'allergy', severity: 'danger', description: 'Anaphylaxis risk', alternative: 'Azithromycin or Clindamycin' },
        { drugName: 'NSAIDs', contraindication: 'NSAID allergy', type: 'allergy', severity: 'danger', description: 'Anaphylaxis risk', alternative: 'Acetaminophen' },
        { drugName: 'Valproic Acid', contraindication: 'Pregnancy', type: 'condition', severity: 'danger', description: 'Neural tube defects in fetus', alternative: 'Levetiracetam or Lamotrigine' },
        { drugName: 'Eliquis', contraindication: 'Active bleeding', type: 'condition', severity: 'danger', description: 'Will worsen active hemorrhage', alternative: 'Reverse with Andexanet alfa' },
        { drugName: 'NSAIDs', contraindication: 'Chronic kidney disease', type: 'condition', severity: 'warning', description: 'Worsens renal function', alternative: 'Acetaminophen' },
        { drugName: 'Metformin', contraindication: 'IV contrast', type: 'medication', severity: 'warning', description: 'Risk of lactic acidosis', alternative: 'Hold metformin, monitor creatinine' },
      ]
    });

    // SECURITY: Do NOT return passwords in response
    return NextResponse.json({ 
      message: 'Database seeded successfully', 
      seeded: true,
      accounts: {
        patients: ['maria@test.com', 'james@test.com', 'aidan@test.com'],
        staff: ['dr.chen@test.com', 'paramedic@test.com'],
        admin: ['admin@test.com'],
        // SECURITY: Password is no longer returned. Check env SEED_PASSWORD or logs.
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    // SECURITY: Do not expose internal error details
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
