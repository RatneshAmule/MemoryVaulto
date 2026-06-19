'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine,
  Shield,
  AlertTriangle,
  Heart,
  Phone,
  Droplets,
  Pill,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Fingerprint,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useVaultStore } from './vault-store';

const DRUGS = ['Ibuprofen', 'Amoxicillin', 'Morphine', 'Aspirin', 'Metformin'];

const ACCESS_METHODS = [
  { icon: ScanLine, label: 'QR Scan', active: true },
  { icon: Fingerprint, label: 'Biometric', active: false },
  { icon: Eye, label: 'Face ID', active: false },
];

const infoVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.12, duration: 0.4, ease: 'easeOut' },
  }),
};

export function EmergencyAccess() {
  const {
    vaultUnlocked,
    setVaultUnlocked,
    scanning,
    setScanning,
    primaryPatient,
    selectedDrug,
    setSelectedDrug,
    checkDrug,
  } = useVaultStore();

  const [showDrugChecker, setShowDrugChecker] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [accessMethod, setAccessMethod] = useState(0);

  const patient = primaryPatient;
  const drugResult = selectedDrug ? checkDrug(selectedDrug) : null;

  const handleScan = useCallback(() => {
    if (scanning || vaultUnlocked) return;
    setScanning(true);
    setScanProgress(0);

    // Animate progress
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    setTimeout(() => {
      clearInterval(progressInterval);
      setScanProgress(100);
      setTimeout(() => {
        setScanning(false);
        setVaultUnlocked(true);
      }, 300);
    }, 2500);
  }, [scanning, vaultUnlocked, setScanning, setVaultUnlocked]);

  const handleReset = () => {
    setVaultUnlocked(false);
    setSelectedDrug('');
    setShowDrugChecker(false);
    setScanProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Access method selector */}
      {!vaultUnlocked && (
        <div className="flex items-center justify-center gap-3">
          {ACCESS_METHODS.map((method, i) => (
            <button
              key={method.label}
              onClick={() => setAccessMethod(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                accessMethod === i
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800/50 border border-slate-700 text-slate-500 hover:text-slate-400'
              }`}
            >
              <method.icon className="w-3.5 h-3.5" />
              {method.label}
            </button>
          ))}
        </div>
      )}

      {/* Scan area */}
      <div className="flex flex-col items-center">
        {!vaultUnlocked ? (
          <div className="relative">
            {/* QR Bracelet visual */}
            <div
              className={`w-52 h-60 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-500 relative overflow-hidden ${
                scanning
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-slate-600 bg-slate-800/50'
              }`}
            >
              {/* Scan line animation */}
              {scanning && (
                <motion.div
                  className="absolute left-2 right-2 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                  initial={{ top: '8%' }}
                  animate={{ top: ['8%', '88%', '8%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-slate-500 rounded-tl" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-slate-500 rounded-tr" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-slate-500 rounded-bl" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-slate-500 rounded-br" />

              <ScanLine
                className={`w-12 h-12 transition-colors ${
                  scanning ? 'text-emerald-400' : 'text-slate-500'
                }`}
              />
              <div className="text-center">
                <span className="text-xs text-slate-500 font-medium block">
                  MemoryVault QR Bracelet
                </span>
                <span className="text-[10px] text-slate-600 mt-1 block">
                  Patient: M. Rodriguez
                </span>
              </div>

              {/* Progress bar during scan */}
              {scanning && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                  <motion.div
                    className="h-full bg-emerald-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              )}
            </div>

            {/* Scan button */}
            <Button
              onClick={handleScan}
              disabled={scanning}
              className="mt-6 bg-red-600 hover:bg-red-700 text-white font-medium px-8 h-11"
            >
              {scanning ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    Scanning...
                  </motion.span>
                  <span className="font-mono text-sm">{Math.round(scanProgress)}%</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ScanLine className="w-4 h-4" />
                  Scan QR Bracelet
                </span>
              )}
            </Button>

            <p className="text-center text-xs text-slate-600 mt-3">
              Or use facial recognition / fingerprint
            </p>
          </div>
        ) : (
          /* Unlocked state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-lg"
          >
            {/* Vault unlocked header */}
            <div className="flex items-center gap-2 mb-6 justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Shield className="w-5 h-5 text-emerald-500" />
              </motion.div>
              <span className="text-emerald-500 font-semibold text-sm tracking-wide">
                VAULT UNLOCKED — 5s Access
              </span>
            </div>

            {/* Patient info cards - staggered reveal */}
            <div className="space-y-3">
              {/* Name & basics */}
              <motion.div custom={0} variants={infoVariants} initial="hidden" animate="visible">
                <Card className="bg-slate-800/60 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          {patient.name}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {patient.age} yrs, {patient.gender}
                        </p>
                      </div>
                      <Badge className="bg-red-600 text-white hover:bg-red-700 text-xs px-3 py-1">
                        <Droplets className="w-3 h-3 mr-1" />
                        {patient.bloodType}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Allergies - CRITICAL */}
              <motion.div custom={1} variants={infoVariants} initial="hidden" animate="visible">
                <Card className="bg-red-950/40 border-red-800/50 pulse-glow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 font-semibold text-sm uppercase tracking-wide">
                        Allergies — Critical
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((allergy) => (
                        <Badge
                          key={allergy.name}
                          variant="destructive"
                          className="text-xs px-2 py-0.5"
                        >
                          {allergy.name} ({allergy.severity})
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Medications */}
              <motion.div custom={2} variants={infoVariants} initial="hidden" animate="visible">
                <Card className="bg-slate-800/60 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-400 font-semibold text-sm uppercase tracking-wide">
                        Current Medications
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {patient.medications.map((med) => (
                        <div key={med.name} className="flex items-center justify-between text-sm">
                          <span className="text-slate-300 font-medium">{med.name}</span>
                          <span className="text-slate-500 text-xs">
                            {med.dose} — {med.frequency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Critical Flags */}
              <motion.div custom={3} variants={infoVariants} initial="hidden" animate="visible">
                <Card className="bg-amber-950/40 border-amber-800/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-400 font-semibold text-sm uppercase tracking-wide">
                        Critical Flags
                      </span>
                    </div>
                    {patient.criticalFlags.map((flag) => (
                      <p key={flag} className="text-sm text-amber-300 font-medium">
                        {flag}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* DNR + Contact */}
              <motion.div custom={4} variants={infoVariants} initial="hidden" animate="visible">
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-slate-800/60 border-slate-700">
                    <CardContent className="p-4">
                      <span className="text-xs text-slate-500 uppercase tracking-wide">
                        DNR Status
                      </span>
                      <p className="text-white font-semibold mt-1">
                        {patient.dnr ? 'YES — DNR' : 'No'}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/60 border-slate-700">
                    <CardContent className="p-4">
                      <span className="text-xs text-slate-500 uppercase tracking-wide">
                        Emergency Contact
                      </span>
                      <div className="mt-1">
                        <p className="text-white text-sm font-medium">
                          {patient.emergencyContacts[0].name}
                        </p>
                        <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {patient.emergencyContacts[0].phone}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </div>

            {/* Drug Checker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.4 }}
              className="mt-6"
            >
              <Button
                variant="outline"
                onClick={() => setShowDrugChecker(!showDrugChecker)}
                className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Pill className="w-4 h-4 mr-2" />
                Drug Safety Checker
                <ChevronDown
                  className={`w-4 h-4 ml-2 transition-transform ${
                    showDrugChecker ? 'rotate-180' : ''
                  }`}
                />
              </Button>

              <AnimatePresence>
                {showDrugChecker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    <Card className="bg-slate-800/60 border-slate-700">
                      <CardContent className="p-4 space-y-3">
                        <label className="text-xs text-slate-500 uppercase tracking-wide block">
                          Select medication to administer
                        </label>
                        <Select
                          value={selectedDrug}
                          onValueChange={setSelectedDrug}
                        >
                          <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                            <SelectValue placeholder="Choose a drug..." />
                          </SelectTrigger>
                          <SelectContent>
                            {DRUGS.map((drug) => (
                              <SelectItem key={drug} value={drug}>
                                {drug}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <AnimatePresence mode="wait">
                          {drugResult && (
                            <motion.div
                              key={drugResult.drug + (drugResult.safe ? '-safe' : '-danger')}
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              transition={{ duration: 0.25 }}
                              className={`p-3 rounded-lg flex items-start gap-3 ${
                                drugResult.safe
                                  ? 'bg-emerald-950/40 border border-emerald-800/50'
                                  : 'bg-red-950/40 border border-red-800/50 pulse-glow'
                              }`}
                            >
                              {drugResult.safe ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <p
                                  className={`text-sm font-semibold ${
                                    drugResult.safe
                                      ? 'text-emerald-400'
                                      : 'text-red-400'
                                  }`}
                                >
                                  {drugResult.drug} —{' '}
                                  {drugResult.safe ? 'SAFE TO ADMINISTER' : 'CONTRAINDICATED'}
                                </p>
                                {drugResult.reason && (
                                  <p className="text-xs text-red-300 mt-1 leading-relaxed">
                                    {drugResult.reason}
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Reset button */}
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-slate-500 hover:text-slate-300 gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Demo
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
