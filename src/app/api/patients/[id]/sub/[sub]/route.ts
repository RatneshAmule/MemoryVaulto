import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPatientAccess } from '@/lib/auth-middleware';

function getModel(modelName: string) {
  return (db as Record<string, any>)[modelName];
}

const modelMap: Record<string, string> = {
  'pharmacogenomics': 'pharmacogenomic',
  'vital-baselines': 'vitalBaseline',
  'blood-antibodies': 'bloodAntibody',
  'cultural-directives': 'culturalDirective',
  'voice-messages': 'voiceMessage',
  'advance-directives': 'advanceDirective',
  'medication-adherence': 'medicationAdherence',
  'pain-profile': 'painProfile',
  'genetic-flags': 'geneticFlag',
  'device-integrations': 'deviceIntegration',
  'occupational-exposures': 'occupationalExposure',
  'radiation-exposures': 'radiationExposure',
  'caregiver-passes': 'caregiverPass',
  'timeline-events': 'medicalTimelineEvent',
};

// SECURITY: Whitelist allowed fields per model to prevent mass assignment
const ALLOWED_FIELDS: Record<string, string[]> = {
  pharmacogenomic: ['gene', 'variant', 'implications', 'medications'],
  vitalBaseline: ['vitalType', 'value', 'unit', 'source', 'recordedDate'],
  bloodAntibody: ['antibodyName', 'type', 'significance', 'transfusionReaction'],
  culturalDirective: ['religion', 'directive', 'description', 'overrideAllowed'],
  voiceMessage: ['category', 'title', 'transcript', 'duration', 'isActive'],
  advanceDirective: ['directiveType', 'description', 'createdDate', 'notarized', 'witnessName'],
  medicationAdherence: ['medicationName', 'overallScore', 'missedDosesLast30Days', 'source', 'updatedDate'],
  painProfile: ['chronicPainConditions', 'currentPainPlan', 'opioidTolerance', 'opioidUseDisorderHistory', 'effectiveMedications', 'ineffectiveMedications', 'painMedAllergies', 'sickleCellStatus', 'naloxonePrescribed', 'painManagementDoctor'],
  geneticFlag: ['condition', 'gene', 'implications', 'medicationsToAvoid', 'safeAlternatives', 'familyScreening'],
  deviceIntegration: ['deviceType', 'deviceName', 'manufacturer', 'serialNumber', 'lastSyncDate', 'batteryLevel', 'dataSummary'],
  occupationalExposure: ['workplace', 'hazardType', 'specificAgent', 'exposureLevel', 'lastExposure'],
  radiationExposure: ['source', 'bodyRegion', 'doseMSv', 'studyDate', 'facility', 'cumulativeTotal'],
  caregiverPass: ['visitorName', 'relationship', 'accessLevel', 'issuedBy', 'expiresAt', 'qrCode', 'purpose'],
  medicalTimelineEvent: ['eventType', 'title', 'description', 'eventDate', 'severity', 'icon'],
};

function sanitizeBody(modelName: string, body: Record<string, unknown>): Record<string, unknown> {
  const allowed = ALLOWED_FIELDS[modelName];
  if (!allowed) return {}; // If no whitelist exists, reject all fields
  const sanitized: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      sanitized[key] = body[key];
    }
  }
  return sanitized;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sub: string }> }
) {
  try {
    // SECURITY: Require authentication
    const auth = await verifyPatientAccess(request, (await params).id);
    if (!auth.allowed) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { id, sub } = await params;
    const modelName = modelMap[sub];
    if (!modelName) return NextResponse.json({ error: 'Unknown: ' + sub }, { status: 400 });
    const model = getModel(modelName);
    const records = await model.findMany({ where: { patientId: id } });
    return NextResponse.json({ data: records });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sub: string }> }
) {
  try {
    // SECURITY: Require authentication (staff only for creating records)
    const auth = await verifyPatientAccess(request, (await params).id);
    if (!auth.allowed) return NextResponse.json({ error: auth.error }, { status: 401 });

    // SECURITY: Only staff can create medical records
    if (auth.user?.role === 'patient') {
      return NextResponse.json({ error: 'Patients cannot create medical records' }, { status: 403 });
    }

    const { id, sub } = await params;
    const body = await request.json();
    const modelName = modelMap[sub];
    if (!modelName) return NextResponse.json({ error: 'Unknown: ' + sub }, { status: 400 });
    
    // SECURITY: Sanitize body to only include whitelisted fields
    const sanitizedBody = sanitizeBody(modelName, body);
    
    const model = getModel(modelName);
    const record = await model.create({ data: { patientId: id, ...sanitizedBody } });
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sub: string }> }
) {
  try {
    // SECURITY: Require authentication (staff only for updating records)
    const auth = await verifyPatientAccess(request, (await params).id);
    if (!auth.allowed) return NextResponse.json({ error: auth.error }, { status: 401 });

    if (auth.user?.role === 'patient') {
      return NextResponse.json({ error: 'Patients cannot update medical records' }, { status: 403 });
    }

    const { id, sub } = await params;
    const body = await request.json();
    const modelName = modelMap[sub];
    if (!modelName) return NextResponse.json({ error: 'PUT not supported for ' + sub }, { status: 400 });
    
    // SECURITY: Sanitize body to only include whitelisted fields
    const sanitizedBody = sanitizeBody(modelName, body);
    
    const model = getModel(modelName);
    const record = await model.update({ where: { patientId: id }, data: sanitizedBody });
    return NextResponse.json({ data: record });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
