'use client';

import { motion } from 'framer-motion';
import {
  Droplets,
  AlertTriangle,
  Pill,
  Heart,
  Phone,
  User,
  Syringe,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useVaultStore } from './vault-store';

const severityColor: Record<string, string> = {
  mild: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  moderate: 'bg-orange-100 text-orange-800 border-orange-200',
  severe: 'bg-red-100 text-red-800 border-red-200',
};

export function PatientVault() {
  const { primaryPatient: patient } = useVaultStore();

  return (
    <div className="space-y-5">
      {/* Patient header */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-emerald-500/30">
              <AvatarFallback className="bg-emerald-900/50 text-emerald-400 text-lg font-semibold">
                MR
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-white font-semibold text-lg">{patient.name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-slate-400 text-sm">
                  {patient.age} yrs, {patient.gender}
                </span>
                <Badge className="bg-red-600 text-white hover:bg-red-700 text-xs">
                  <Droplets className="w-3 h-3 mr-1" />
                  {patient.bloodType}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-4">
          {/* Medical conditions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800/60 border-slate-700 h-full">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-slate-300 font-semibold text-sm uppercase tracking-wide">
                    Medical Conditions
                  </span>
                </div>
                <div className="space-y-2">
                  {patient.conditions.map((condition) => (
                    <div
                      key={condition}
                      className="flex items-center gap-2 text-sm text-slate-300"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      {condition}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Surgical history */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800/60 border-slate-700 h-full">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Syringe className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 font-semibold text-sm uppercase tracking-wide">
                    Surgical History
                  </span>
                </div>
                <div className="space-y-3">
                  {patient.surgeries?.map((surgery) => (
                    <div key={surgery} className="relative pl-4">
                      <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-slate-600" />
                      <div className="absolute left-[3px] top-3.5 w-0.5 h-5 bg-slate-700 last:hidden" />
                      <p className="text-sm text-slate-300">{surgery}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Current medications */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="bg-slate-800/60 border-slate-700 h-full">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Pill className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300 font-semibold text-sm uppercase tracking-wide">
                    Current Medications
                  </span>
                </div>
                <div className="space-y-2.5">
                  {patient.medications.map((med) => (
                    <div
                      key={med.name}
                      className="flex items-start justify-between p-2 rounded bg-slate-900/40"
                    >
                      <div>
                        <p className="text-sm text-white font-medium">{med.name}</p>
                        <p className="text-xs text-slate-500">
                          {med.frequency}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-slate-700 text-slate-300"
                      >
                        {med.dose}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Allergies */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-slate-800/60 border-slate-700 h-full">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-slate-300 font-semibold text-sm uppercase tracking-wide">
                    Allergies
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy) => (
                    <Badge
                      key={allergy.name}
                      className={`text-xs ${severityColor[allergy.severity]}`}
                    >
                      {allergy.name} — {allergy.severity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Bottom row: Implants, Vaccinations */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Implant registry */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300 font-semibold text-sm uppercase tracking-wide">
                  Implant Registry
                </span>
              </div>
              {patient.implants && patient.implants.length > 0 ? (
                <div className="space-y-1.5">
                  {patient.implants.map((implant) => (
                    <div key={implant} className="text-sm text-slate-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      {implant}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No implants on record</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Vaccinations */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300 font-semibold text-sm uppercase tracking-wide">
                  Vaccination Status
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {patient.vaccinations?.map((vax) => (
                  <Badge
                    key={vax}
                    variant="secondary"
                    className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-800/30"
                  >
                    {vax}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Separator className="bg-slate-700" />

      {/* Emergency contacts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Phone className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300 font-semibold text-sm uppercase tracking-wide">
            Emergency Contacts
          </span>
        </div>
        <div className="space-y-2">
          {patient.emergencyContacts.map((contact) => (
            <div
              key={contact.name}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700"
            >
              <div>
                <p className="text-sm text-white font-medium">{contact.name}</p>
                <p className="text-xs text-slate-500">{contact.relationship}</p>
              </div>
              <Badge variant="outline" className="text-xs text-slate-300 border-slate-600">
                <Phone className="w-3 h-3 mr-1" />
                {contact.phone}
              </Badge>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
