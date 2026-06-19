import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.medicalTest.deleteMany();
  await prisma.accessLog.deleteMany();
  await prisma.consentProxy.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.vaccination.deleteMany();
  await prisma.implant.deleteMany();
  await prisma.surgery.deleteMany();
  await prisma.condition.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.allergy.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.drugInteractionRule.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // Create users
  const mariaUser = await prisma.user.create({
    data: {
      email: 'maria@test.com',
      password: hashedPassword,
      name: 'Maria Rodriguez',
      role: 'patient',
    },
  });

  const jamesUser = await prisma.user.create({
    data: {
      email: 'james@test.com',
      password: hashedPassword,
      name: 'James Wilson',
      role: 'patient',
    },
  });

  const doctorUser = await prisma.user.create({
    data: {
      email: 'dr.chen@test.com',
      password: hashedPassword,
      name: 'Dr. Sarah Chen',
      role: 'doctor',
      hospital: 'Metro General Hospital',
    },
  });

  const paramedicUser = await prisma.user.create({
    data: {
      email: 'paramedic@test.com',
      password: hashedPassword,
      name: 'Mike Torres',
      role: 'paramedic',
      hospital: 'City EMS',
    },
  });

  // Aiden — pediatric foster child (Scenario 3)
  const aidenUser = await prisma.user.create({
    data: {
      email: 'aiden@test.com',
      password: hashedPassword,
      name: 'Aiden Brooks',
      role: 'patient',
    },
  });

  // Amira — refugee mother (Scenario 5)
  const amiraUser = await prisma.user.create({
    data: {
      email: 'amira@test.com',
      password: hashedPassword,
      name: 'Amira Hassan',
      role: 'patient',
    },
  });

  // Create Maria's patient record
  const mariaPatient = await prisma.patient.create({
    data: {
      userId: mariaUser.id,
      dateOfBirth: '1985-03-15',
      gender: 'Female',
      bloodType: 'A-',
      dnr: false,
      organDonor: true,
      occupation: 'Teacher',
      primaryLanguage: 'English',
      pregnancyStatus: 'not-pregnant',
      insuranceProvider: 'BlueCross BlueShield',
      insuranceId: 'BCBS-2847391',
      weight: 65,
    },
  });

  // Maria's allergies
  await prisma.allergy.createMany({
    data: [
      { patientId: mariaPatient.id, name: 'Penicillin', severity: 'severe', reaction: 'Anaphylaxis — throat swelling, difficulty breathing' },
      { patientId: mariaPatient.id, name: 'NSAIDs', severity: 'moderate', reaction: 'Hives, facial swelling' },
    ],
  });

  // Maria's medications
  await prisma.medication.createMany({
    data: [
      { patientId: mariaPatient.id, name: 'Insulin Glargine', dose: '22 units', frequency: 'Once daily at bedtime', startDate: '2018-06-01', prescriber: 'Dr. Patel' },
      { patientId: mariaPatient.id, name: 'Metformin', dose: '500mg', frequency: 'Twice daily', startDate: '2018-06-01', prescriber: 'Dr. Patel' },
    ],
  });

  // Maria's conditions
  await prisma.condition.createMany({
    data: [
      { patientId: mariaPatient.id, name: 'Type 1 Diabetes', diagnosedDate: '2005-08-20', status: 'active' },
      { patientId: mariaPatient.id, name: 'Hypothyroidism', diagnosedDate: '2012-01-10', status: 'active' },
    ],
  });

  // Maria's surgeries
  await prisma.surgery.create({
    data: {
      patientId: mariaPatient.id,
      name: 'Appendectomy',
      date: '2018-04-12',
      hospital: 'St. Mary\'s Medical Center',
      notes: 'Laparoscopic, no complications',
    },
  });

  // Maria's vaccinations
  await prisma.vaccination.createMany({
    data: [
      { patientId: mariaPatient.id, name: 'COVID-19 (Pfizer)', date: '2023-10-15', status: 'completed' },
      { patientId: mariaPatient.id, name: 'Influenza', date: '2024-09-01', status: 'completed' },
      { patientId: mariaPatient.id, name: 'Tdap', date: '2022-03-20', status: 'completed' },
    ],
  });

  // Maria's emergency contacts
  await prisma.emergencyContact.createMany({
    data: [
      { patientId: mariaPatient.id, name: 'Carlos Rodriguez', relationship: 'Husband', phone: '(555) 234-5678', email: 'carlos.r@email.com', priority: 1 },
      { patientId: mariaPatient.id, name: 'Elena Rodriguez', relationship: 'Mother', phone: '(555) 345-6789', email: 'elena.r@email.com', priority: 2 },
    ],
  });

  // Maria's consent proxy
  await prisma.consentProxy.create({
    data: {
      patientId: mariaPatient.id,
      proxyName: 'Carlos Rodriguez',
      relationship: 'Husband',
      phone: '(555) 234-5678',
      priority: 1,
      verified: true,
    },
  });

  // Create James's patient record — complex cardiac patient
  const jamesPatient = await prisma.patient.create({
    data: {
      userId: jamesUser.id,
      dateOfBirth: '1958-11-22',
      gender: 'Male',
      bloodType: 'O+',
      dnr: true,
      organDonor: false,
      occupation: 'Retired Engineer',
      primaryLanguage: 'English',
      insuranceProvider: 'Medicare',
      insuranceId: 'MCR-5829374',
      weight: 95,
    },
  });

  // James's allergies
  await prisma.allergy.create({
    data: {
      patientId: jamesPatient.id,
      name: 'Sulfonamides',
      severity: 'severe',
      reaction: 'Stevens-Johnson syndrome risk',
    },
  });

  // James's medications
  await prisma.medication.createMany({
    data: [
      { patientId: jamesPatient.id, name: 'Warfarin', dose: '5mg', frequency: 'Once daily', startDate: '2023-02-01', prescriber: 'Dr. Chen' },
      { patientId: jamesPatient.id, name: 'Metoprolol', dose: '50mg', frequency: 'Twice daily', startDate: '2019-06-01', prescriber: 'Dr. Chen' },
      { patientId: jamesPatient.id, name: 'Lisinopril', dose: '10mg', frequency: 'Once daily', startDate: '2020-01-15', prescriber: 'Dr. Chen' },
      { patientId: jamesPatient.id, name: 'Metformin', dose: '1000mg', frequency: 'Twice daily', startDate: '2021-03-01', prescriber: 'Dr. Adams' },
    ],
  });

  // James's conditions
  await prisma.condition.createMany({
    data: [
      { patientId: jamesPatient.id, name: 'Atrial Fibrillation', diagnosedDate: '2019-05-01', status: 'active' },
      { patientId: jamesPatient.id, name: 'Hypertension', diagnosedDate: '2015-08-10', status: 'active' },
      { patientId: jamesPatient.id, name: 'Type 2 Diabetes', diagnosedDate: '2021-02-20', status: 'active' },
      { patientId: jamesPatient.id, name: 'Obesity', diagnosedDate: '2018-01-01', status: 'active' },
      { patientId: jamesPatient.id, name: 'Prior Myocardial Infarction', diagnosedDate: '2019-05-15', status: 'active' },
    ],
  });

  // James's surgeries
  await prisma.surgery.createMany({
    data: [
      { patientId: jamesPatient.id, name: 'PCI with Stent Placement', date: '2023-05-20', hospital: 'Metro General Hospital', notes: 'Drug-eluting stent to LAD' },
      { patientId: jamesPatient.id, name: 'CABG (Coronary Artery Bypass)', date: '2019-06-15', hospital: 'Metro General Hospital', notes: 'Triple bypass, uneventful recovery' },
    ],
  });

  // James's implants
  await prisma.implant.createMany({
    data: [
      { patientId: jamesPatient.id, name: 'Coronary Stent (LAD)', implantDate: '2023-05-20', manufacturer: 'Abbott', serialNumber: 'XIENCE-28473' },
      { patientId: jamesPatient.id, name: 'Cardiac Loop Recorder', implantDate: '2022-08-10', manufacturer: 'Medtronic', serialNumber: 'LINQ-92841' },
    ],
  });

  // James's vaccinations
  await prisma.vaccination.createMany({
    data: [
      { patientId: jamesPatient.id, name: 'COVID-19 (Moderna)', date: '2023-11-01', status: 'completed' },
      { patientId: jamesPatient.id, name: 'Influenza', date: '2024-10-05', status: 'completed' },
      { patientId: jamesPatient.id, name: 'Pneumococcal (PCV15)', date: '2023-03-15', status: 'completed' },
    ],
  });

  // James's emergency contacts
  await prisma.emergencyContact.create({
    data: {
      patientId: jamesPatient.id,
      name: 'Sarah Wilson',
      relationship: 'Daughter',
      phone: '(555) 456-7890',
      email: 'sarah.w@email.com',
      priority: 1,
    },
  });

  // James's consent proxy
  await prisma.consentProxy.create({
    data: {
      patientId: jamesPatient.id,
      proxyName: 'Sarah Wilson',
      relationship: 'Daughter',
      phone: '(555) 456-7890',
      priority: 1,
      verified: true,
    },
  });

  // Aiden's patient record — pediatric foster child
  const aidenPatient = await prisma.patient.create({
    data: {
      userId: aidenUser.id,
      dateOfBirth: '2019-07-08',
      gender: 'Male',
      bloodType: 'O-',
      dnr: false,
      organDonor: false,
      occupation: null,
      primaryLanguage: 'English',
      pregnancyStatus: null,
      weight: 22,
    },
  });

  // Aiden's conditions — Dravet Syndrome, Immunocompromised
  await prisma.condition.createMany({
    data: [
      { patientId: aidenPatient.id, name: 'Dravet Syndrome', diagnosedDate: '2020-03-15', status: 'active' },
      { patientId: aidenPatient.id, name: 'Immunocompromised', diagnosedDate: '2021-06-01', status: 'active' },
      { patientId: aidenPatient.id, name: 'Epilepsy', diagnosedDate: '2020-03-15', status: 'active' },
    ],
  });

  // Aiden's medications
  await prisma.medication.createMany({
    data: [
      { patientId: aidenPatient.id, name: 'Valproic Acid', dose: '250mg', frequency: 'Twice daily', startDate: '2020-04-01', prescriber: 'Dr. Lee' },
      { patientId: aidenPatient.id, name: 'Stiripentol', dose: '500mg', frequency: 'Twice daily', startDate: '2020-06-01', prescriber: 'Dr. Lee' },
    ],
  });

  // Aiden's allergies — CRITICAL: DO NOT give Carbamazepine
  await prisma.allergy.createMany({
    data: [
      { patientId: aidenPatient.id, name: 'Carbamazepine', severity: 'severe', reaction: 'Can cause fatal status epilepticus in Dravet Syndrome patients' },
    ],
  });

  // Aiden's emergency contacts — foster case worker
  await prisma.emergencyContact.createMany({
    data: [
      { patientId: aidenPatient.id, name: 'Diana Martinez', relationship: 'Case Worker', phone: '(555) 789-0123', priority: 1 },
      { patientId: aidenPatient.id, name: 'Foster Home #4 - Johnson Family', relationship: 'Foster Family', phone: '(555) 890-1234', priority: 2 },
    ],
  });

  // Aiden's consent proxy
  await prisma.consentProxy.create({
    data: {
      patientId: aidenPatient.id,
      proxyName: 'Diana Martinez',
      relationship: 'Case Worker',
      phone: '(555) 789-0123',
      priority: 1,
      verified: true,
    },
  });

  // Amira's patient record — refugee mother, pregnant
  const amiraPatient = await prisma.patient.create({
    data: {
      userId: amiraUser.id,
      dateOfBirth: '1996-04-12',
      gender: 'Female',
      bloodType: 'A-',
      dnr: false,
      organDonor: false,
      occupation: null,
      primaryLanguage: 'Arabic',
      pregnancyStatus: 'confirmed',
      weight: 62,
    },
  });

  // Amira's conditions
  await prisma.condition.createMany({
    data: [
      { patientId: amiraPatient.id, name: 'Pregnancy', diagnosedDate: '2025-09-01', status: 'active' },
      { patientId: amiraPatient.id, name: 'Prior C-Section', diagnosedDate: '2023-02-15', status: 'resolved' },
    ],
  });

  // Amira's surgeries
  await prisma.surgery.create({
    data: {
      patientId: amiraPatient.id,
      name: 'Cesarean Section',
      date: '2023-02-15',
      hospital: 'UN Field Hospital - Jordan',
      notes: 'Emergency C-section, healthy infant',
    },
  });

  // Amira's emergency contacts
  await prisma.emergencyContact.createMany({
    data: [
      { patientId: amiraPatient.id, name: 'Youssef Hassan', relationship: 'Husband', phone: '(555) 567-8901', priority: 1 },
    ],
  });

  // Amira's consent proxy
  await prisma.consentProxy.create({
    data: {
      patientId: amiraPatient.id,
      proxyName: 'Youssef Hassan',
      relationship: 'Husband',
      phone: '(555) 567-8901',
      priority: 1,
      verified: true,
    },
  });

  // Drug Interaction Rules — Original + Pregnancy + Psychiatric
  await prisma.drugInteractionRule.createMany({
    data: [
      // Original rules
      { drugName: 'Ibuprofen', contraindication: 'NSAIDs', type: 'allergy', severity: 'danger', description: 'Ibuprofen is an NSAID. Patient has documented NSAID allergy — administration could trigger anaphylaxis.' },
      { drugName: 'Amoxicillin', contraindication: 'Penicillin', type: 'allergy', severity: 'danger', description: 'Amoxicillin is a penicillin-class antibiotic. Cross-reactivity risk with penicillin allergy is significant.' },
      { drugName: 'Aspirin', contraindication: 'NSAIDs', type: 'allergy', severity: 'warning', description: 'Aspirin has NSAID properties. May cross-react in patients with NSAID sensitivity. Monitor closely.' },
      { drugName: 'Aspirin', contraindication: 'Warfarin', type: 'medication', severity: 'danger', description: 'CONTRAINDICATED: Aspirin + Warfarin significantly increases bleeding risk. Combined anticoagulant effect can be life-threatening.' },
      { drugName: 'Ibuprofen', contraindication: 'Warfarin', type: 'medication', severity: 'danger', description: 'CONTRAINDICATED: Ibuprofen + Warfarin increases bleeding risk. NSAIDs potentiate anticoagulant effect and can cause GI bleeding.' },
      { drugName: 'NSAIDs', contraindication: 'Warfarin', type: 'medication', severity: 'danger', description: 'CONTRAINDICATED: All NSAIDs increase bleeding risk when combined with Warfarin. Avoid co-administration.' },
      { drugName: 'Metformin', contraindication: 'Metformin', type: 'medication', severity: 'warning', description: 'Patient is already on Metformin. Duplicate therapy increases risk of lactic acidosis and side effects.' },
      { drugName: 'Sulfamethoxazole', contraindication: 'Sulfonamides', type: 'allergy', severity: 'danger', description: 'Sulfamethoxazole is a sulfonamide antibiotic. Patient has documented sulfonamide allergy — risk of Stevens-Johnson syndrome.' },
      { drugName: 'Morphine', contraindication: 'respiratory', type: 'condition', severity: 'caution', description: 'Use with caution in patients with respiratory conditions. Opioids can cause respiratory depression.' },
      { drugName: 'Naproxen', contraindication: 'NSAIDs', type: 'allergy', severity: 'danger', description: 'Naproxen is an NSAID. Patient has documented NSAID allergy — administration could trigger severe allergic reaction.' },
      { drugName: 'Diclofenac', contraindication: 'NSAIDs', type: 'allergy', severity: 'danger', description: 'Diclofenac is an NSAID. Contraindicated in patients with NSAID allergy.' },
      { drugName: 'Celecoxib', contraindication: 'Sulfonamides', type: 'allergy', severity: 'warning', description: 'Celecoxib contains a sulfonamide moiety. Use with caution in patients with sulfonamide allergy.' },
      { drugName: 'Lisinopril', contraindication: 'Lisinopril', type: 'medication', severity: 'warning', description: 'Patient is already on Lisinopril. Duplicate ACE inhibitor therapy is not recommended.' },

      // Pregnancy drug rules
      { drugName: 'Ibuprofen', contraindication: 'Pregnancy', type: 'condition', severity: 'danger', description: 'NSAIDs contraindicated in pregnancy, especially 3rd trimester. Risk of premature closure of ductus arteriosus and oligohydramnios.' },
      { drugName: 'Warfarin', contraindication: 'Pregnancy', type: 'condition', severity: 'danger', description: 'Teratogenic — contraindicated in pregnancy. Can cause warfarin embryopathy, CNS abnormalities, and fetal hemorrhage.' },
      { drugName: 'ACE Inhibitors', contraindication: 'Pregnancy', type: 'condition', severity: 'danger', description: 'Fetotoxic — contraindicated in pregnancy. Can cause renal agenesis, pulmonary hypoplasia, and fetal death.' },
      { drugName: 'Lisinopril', contraindication: 'Pregnancy', type: 'condition', severity: 'danger', description: 'ACE inhibitor — fetotoxic. Contraindicated in pregnancy. Can cause oligohydramnios, renal failure, and death in fetus.' },
      { drugName: 'Enalapril', contraindication: 'Pregnancy', type: 'condition', severity: 'danger', description: 'ACE inhibitor — fetotoxic. Contraindicated in all trimesters of pregnancy.' },
      { drugName: 'Aspirin', contraindication: 'Pregnancy', type: 'condition', severity: 'warning', description: 'Avoid in 3rd trimester. High-dose aspirin can cause premature ductus arteriosus closure and bleeding complications in mother and neonate.' },
      { drugName: 'Nitrofurantoin', contraindication: 'Pregnancy', type: 'condition', severity: 'warning', description: 'Avoid near term (G6PD risk). Can cause hemolytic anemia in G6PD-deficient neonates.' },

      // Psychiatric medication interaction rules
      { drugName: 'Lithium', contraindication: 'Dehydration', type: 'condition', severity: 'danger', description: 'Lithium toxicity risk elevated with dehydration. Dehydration reduces lithium clearance, potentially leading to toxic serum levels.' },
      { drugName: 'Benzodiazepines', contraindication: 'Opioids', type: 'medication', severity: 'danger', description: 'Respiratory depression risk — combined CNS depression. FDA Black Box Warning: concomitant use increases risk of profound sedation, respiratory depression, coma, and death.' },
      { drugName: 'Alprazolam', contraindication: 'Opioids', type: 'medication', severity: 'danger', description: 'Benzodiazepine + Opioid combination: Respiratory depression risk — combined CNS depression can be fatal.' },
      { drugName: 'Lorazepam', contraindication: 'Opioids', type: 'medication', severity: 'danger', description: 'Benzodiazepine + Opioid combination: Risk of profound sedation, respiratory depression, coma, and death.' },
      { drugName: 'SSRIs', contraindication: 'MAOIs', type: 'medication', severity: 'danger', description: 'Serotonin syndrome risk. Combining SSRIs with MAOIs can cause life-threatening serotonin syndrome. Minimum 14-day washout required.' },
      { drugName: 'Fluoxetine', contraindication: 'MAOIs', type: 'medication', severity: 'danger', description: 'SSRI + MAOI combination can cause serotonin syndrome. Minimum 5-week washout required for fluoxetine due to long half-life.' },
      { drugName: 'Sertraline', contraindication: 'MAOIs', type: 'medication', severity: 'danger', description: 'SSRI + MAOI combination — serotonin syndrome risk. Minimum 14-day washout required between medications.' },
      { drugName: 'Antipsychotics', contraindication: 'Cardiac', type: 'condition', severity: 'warning', description: 'QT prolongation risk — cardiac monitoring recommended. Many antipsychotics can prolong QT interval, increasing risk of torsades de pointes.' },
      { drugName: 'Haloperidol', contraindication: 'Cardiac', type: 'condition', severity: 'warning', description: 'QT prolongation risk with haloperidol. ECG monitoring recommended, especially in patients with cardiac conditions.' },
      { drugName: 'Lithium', contraindication: 'NSAIDs', type: 'medication', severity: 'warning', description: 'Lithium levels may increase when combined with NSAIDs. NSAIDs reduce renal lithium clearance, increasing toxicity risk.' },
      { drugName: 'Lithium', contraindication: 'Ibuprofen', type: 'medication', severity: 'warning', description: 'NSAIDs reduce renal lithium clearance. Monitor lithium levels closely; dose adjustment may be needed.' },

      // Carbamazepine + Dravet syndrome rule
      { drugName: 'Carbamazepine', contraindication: 'Dravet Syndrome', type: 'condition', severity: 'danger', description: 'CONTRAINDICATED in Dravet Syndrome: Carbamazepine can cause fatal status epilepticus. Sodium channel blockers are contraindicated in SCN1A mutation carriers.' },
      { drugName: 'Carbamazepine', contraindication: 'Carbamazepine', type: 'allergy', severity: 'danger', description: 'Patient has documented Carbamazepine allergy — can cause fatal status epilepticus in Dravet Syndrome patients.' },
      { drugName: 'Phenytoin', contraindication: 'Dravet Syndrome', type: 'condition', severity: 'danger', description: 'Sodium channel blocker — contraindicated in Dravet Syndrome. Can exacerbate seizures and cause status epilepticus.' },
    ],
  });

  // Sample access logs
  await prisma.accessLog.createMany({
    data: [
      {
        accessorId: doctorUser.id,
        patientId: mariaPatient.id,
        accessType: 'routine',
        accessMethod: 'badge',
        reason: 'Pre-operative assessment',
        dataViewed: JSON.stringify(['profile', 'allergies', 'medications', 'conditions']),
        timestamp: new Date('2024-12-01T09:30:00Z'),
      },
      {
        accessorId: paramedicUser.id,
        patientId: jamesPatient.id,
        accessType: 'emergency',
        accessMethod: 'qr',
        reason: 'Patient unconscious after fall, unresponsive',
        dataViewed: JSON.stringify(['profile', 'allergies', 'medications', 'conditions', 'implants']),
        timestamp: new Date('2024-12-15T18:45:00Z'),
        expiresAt: new Date('2024-12-16T18:45:00Z'),
      },
      {
        accessorId: doctorUser.id,
        patientId: jamesPatient.id,
        accessType: 'routine',
        accessMethod: 'search',
        reason: 'Cardiology follow-up',
        dataViewed: JSON.stringify(['profile', 'medications', 'conditions', 'surgeries', 'implants']),
        timestamp: new Date('2025-01-10T14:00:00Z'),
      },
    ],
  });

  // Sample medical tests
  await prisma.medicalTest.createMany({
    data: [
      { patientId: jamesPatient.id, testName: 'Troponin I', testDate: new Date('2025-01-10T14:30:00Z'), facility: 'Metro General Hospital', results: '0.04 ng/mL (normal)', orderingDoc: 'Dr. Chen', status: 'completed' },
      { patientId: jamesPatient.id, testName: 'INR', testDate: new Date('2025-01-15T09:00:00Z'), facility: 'Metro General Hospital', results: '2.5 (therapeutic)', orderingDoc: 'Dr. Chen', status: 'completed' },
      { patientId: mariaPatient.id, testName: 'HbA1c', testDate: new Date('2025-01-05T10:00:00Z'), facility: 'St. Mary\'s Medical Center', results: '7.2%', orderingDoc: 'Dr. Patel', status: 'completed' },
    ],
  });

  console.log('Seed data inserted successfully!');
  console.log('Users created:');
  console.log('  - Maria Rodriguez (patient): maria@test.com / password123');
  console.log('  - James Wilson (patient): james@test.com / password123');
  console.log('  - Dr. Sarah Chen (doctor): dr.chen@test.com / password123');
  console.log('  - Mike Torres (paramedic): paramedic@test.com / password123');
  console.log('  - Aiden Brooks (patient): aiden@test.com / password123');
  console.log('  - Amira Hassan (patient): amira@test.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
