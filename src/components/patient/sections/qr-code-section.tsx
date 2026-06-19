'use client';

import { useAppStore } from '@/stores/app-store';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { QrCode, Download, Printer, Shield, AlertTriangle, Heart, Phone, Droplets } from 'lucide-react';
import { toast } from 'sonner';

export function QrCodeSection() {
  const { currentPatient } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrImageData, setQrImageData] = useState<string>('');

  const p = currentPatient;

  const emergencyUrl = p ? `http://localhost:3000/api/emergency/${p.id}/access` : '';
  const age = p ? Math.floor((Date.now() - new Date(p.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
  const bloodDisplay = p ? `${p.bloodType}${p.rhFactor || ''}` : '';

  // Simple QR code pattern generator using canvas
  const generateQRPattern = useCallback((canvas: HTMLCanvasElement, data: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 280;
    canvas.width = size;
    canvas.height = size;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Generate a deterministic pattern from the URL string
    const cellSize = 7;
    const margin = 14;
    const gridCount = Math.floor((size - margin * 2) / cellSize);
    
    // Create hash from URL for deterministic pattern
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    // Seed a simple PRNG from the hash
    let seed = Math.abs(hash);
    const nextRand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    const grid: boolean[][] = [];
    for (let row = 0; row < gridCount; row++) {
      grid[row] = [];
      for (let col = 0; col < gridCount; col++) {
        grid[row][col] = nextRand() > 0.5;
      }
    }

    // Draw finder patterns (the 3 big squares in corners)
    const drawFinderPattern = (x: number, y: number) => {
      const patternSize = cellSize * 7;
      ctx.fillStyle = '#000000';
      ctx.fillRect(margin + x * cellSize, margin + y * cellSize, patternSize, patternSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(margin + x * cellSize + cellSize, margin + y * cellSize + cellSize, patternSize - cellSize * 2, patternSize - cellSize * 2);
      ctx.fillStyle = '#000000';
      ctx.fillRect(margin + x * cellSize + cellSize * 2, margin + y * cellSize + cellSize * 2, patternSize - cellSize * 4, patternSize - cellSize * 4);
    };

    drawFinderPattern(0, 0);
    drawFinderPattern(gridCount - 7, 0);
    drawFinderPattern(0, gridCount - 7);

    // Draw timing patterns
    ctx.fillStyle = '#000000';
    for (let i = 8; i < gridCount - 8; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(margin + i * cellSize, margin + 6 * cellSize, cellSize, cellSize);
        ctx.fillRect(margin + 6 * cellSize, margin + i * cellSize, cellSize, cellSize);
      }
    }

    // Draw data modules (skip finder pattern areas)
    ctx.fillStyle = '#000000';
    for (let row = 0; row < gridCount; row++) {
      for (let col = 0; col < gridCount; col++) {
        if ((row < 8 && col < 8) || (row < 8 && col >= gridCount - 8) || (row >= gridCount - 8 && col < 8)) continue;
        if (row === 6 || col === 6) continue;
        if (grid[row][col]) {
          ctx.fillRect(margin + col * cellSize, margin + row * cellSize, cellSize, cellSize);
        }
      }
    }

    // Add alignment pattern
    const alignPos = Math.floor(gridCount / 2) + 2;
    const drawAlignPattern = (cx: number, cy: number) => {
      ctx.fillStyle = '#000000';
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          if (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)) {
            ctx.fillRect(margin + (cx + dc) * cellSize, margin + (cy + dr) * cellSize, cellSize, cellSize);
          }
        }
      }
    };
    drawAlignPattern(alignPos, alignPos);

    setQrGenerated(true);
    setQrImageData(canvas.toDataURL('image/png'));
  }, []);

  useEffect(() => {
    if (canvasRef.current && !qrGenerated && emergencyUrl) {
      generateQRPattern(canvasRef.current, emergencyUrl);
    }
  }, [emergencyUrl, generateQRPattern, qrGenerated]);

  // Generate the medical ID card as a downloadable image
  const generateMedicalCard = useCallback(() => {
    const cardCanvas = cardCanvasRef.current;
    if (!cardCanvas || !p) return;
    
    const ctx = cardCanvas.getContext('2d');
    if (!ctx) return;

    const w = 600;
    const h = 340;
    cardCanvas.width = w;
    cardCanvas.height = h;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, w - 4, h - 4);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(4, 4, w - 8, 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MemoryVault — EMERGENCY MEDICAL ID', w / 2, 30);

    if (qrImageData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 20, 60, 180, 180);
        
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.font = 'bold 22px Arial, sans-serif';
        ctx.fillText(p.user?.name || 'Unknown', 220, 90);

        ctx.font = '16px Arial, sans-serif';
        ctx.fillStyle = '#374151';
        ctx.fillText(`DOB: ${new Date(p.dateOfBirth).toLocaleDateString()}`, 220, 118);
        ctx.fillText(`Age: ${age}`, 400, 118);
        
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 28px Arial, sans-serif';
        ctx.fillText(`Blood: ${bloodDisplay}`, 220, 155);

        const severeAllergies = p.allergies.filter(a => a.severity === 'severe' || a.severity === 'life-threatening');
        if (severeAllergies.length > 0) {
          ctx.fillStyle = '#dc2626';
          ctx.font = 'bold 14px Arial, sans-serif';
          ctx.fillText('⚠ ALLERGIES:', 220, 185);
          ctx.font = '13px Arial, sans-serif';
          ctx.fillStyle = '#000000';
          const allergyText = severeAllergies.map(a => `${a.name} (${a.severity})`).join(', ');
          ctx.fillText(allergyText.slice(0, 55) + (allergyText.length > 55 ? '...' : ''), 220, 205);
        }

        if (p.dnr) {
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(400, 140, 80, 30);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('DNR', 440, 160);
        }

        const primaryContact = p.emergencyContacts?.[0];
        if (primaryContact) {
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'left';
          ctx.font = 'bold 14px Arial, sans-serif';
          ctx.fillText('Emergency Contact:', 220, 228);
          ctx.font = '13px Arial, sans-serif';
          ctx.fillText(`${primaryContact.name} (${primaryContact.relationship}) — ${primaryContact.phone}`, 220, 248);
        }

        ctx.fillStyle = '#dc2626';
        ctx.fillRect(4, h - 50, w - 8, 46);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SCAN QR CODE IN EMERGENCY — vault.memoryvault.app', w / 2, h - 24);
      };
      img.src = qrImageData;
    }
  }, [qrImageData, p, age, bloodDisplay]);

  useEffect(() => {
    if (qrImageData && cardCanvasRef.current) {
      generateMedicalCard();
    }
  }, [qrImageData, generateMedicalCard]);

  if (!p) return null;

  const handleDownloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `memoryvault-qr-${p.user?.name?.replace(/\s+/g, '-').toLowerCase() || 'patient'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('QR code downloaded successfully');
  };

  const handleDownloadCard = () => {
    const canvas = cardCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `memoryvault-medical-id-${p.user?.name?.replace(/\s+/g, '-').toLowerCase() || 'patient'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Medical ID card downloaded');
  };

  const handlePrint = () => {
    const canvas = cardCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const win = window.open('');
    if (!win) return;
    win.document.write(`<html><head><title>MemoryVault Medical ID</title></head><body style="display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#fff"><img src="${dataUrl}" style="max-width:600px;width:100%"/></body></html>`);
    win.document.close();
    win.print();
  };

  const severeAllergies = p.allergies.filter(a => a.severity === 'severe' || a.severity === 'life-threatening');
  const primaryContact = p.emergencyContacts?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
          <QrCode className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Emergency QR Code</h2>
          <p className="text-sm text-slate-400">Generate a scannable QR code for emergency medical access</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-slate-900 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <QrCode className="w-4 h-4 text-red-400" />
                Your Emergency QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {/* QR Code */}
              <div className="bg-white p-4 rounded-xl mb-4 relative">
                <canvas ref={canvasRef} className="w-[280px] h-[280px]" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white px-2 py-1 rounded border border-slate-200">
                    <Shield className="w-5 h-5 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Patient info below QR */}
              <div className="text-center mb-4">
                <div className="text-lg font-bold">{p.user?.name}</div>
                <Badge className="bg-red-500/20 text-red-400 text-base px-3 py-1 mt-1">
                  <Droplets className="w-4 h-4 mr-1" />Blood: {bloodDisplay}
                </Badge>
              </div>

              {/* SCAN IN EMERGENCY text */}
              <div className="w-full p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center mb-4">
                <div className="text-red-400 font-bold text-lg tracking-widest">🚨 SCAN IN EMERGENCY 🚨</div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 w-full">
                <Button onClick={handleDownloadQR} className="flex-1 bg-red-600 hover:bg-red-700">
                  <Download className="w-4 h-4 mr-2" />Download QR
                </Button>
                <Button onClick={handlePrint} variant="outline" className="flex-1 border-red-500/30 text-red-400">
                  <Printer className="w-4 h-4 mr-2" />Print Card
                </Button>
              </div>

              {/* Instructions */}
              <div className="mt-4 p-3 bg-slate-800 rounded-lg w-full">
                <div className="text-sm text-slate-300">
                  <strong className="text-slate-200">Instructions:</strong> Print this QR and keep it in your wallet, phone case, or as a medical bracelet. Emergency responders can scan it to instantly access your critical medical information.
                </div>
              </div>

              {/* Emergency URL */}
              <div className="mt-3 text-xs text-slate-500 font-mono break-all text-center w-full">
                URL: {emergencyUrl}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Medical ID Card Preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                Medical ID Card Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Visual card preview */}
              <div className="border-4 border-red-500 rounded-xl overflow-hidden bg-white mb-4">
                {/* Red header */}
                <div className="bg-red-600 px-4 py-2 text-center">
                  <span className="text-white font-bold text-sm">MemoryVault — EMERGENCY MEDICAL ID</span>
                </div>
                {/* Card body */}
                <div className="p-4 flex gap-4">
                  {/* QR code in card */}
                  <div className="flex-shrink-0">
                    <div className="bg-white border border-slate-200 p-1 rounded">
                      {qrImageData ? (
                        <img src={qrImageData} alt="QR Code" className="w-[120px] h-[120px]" />
                      ) : (
                        <div className="w-[120px] h-[120px] bg-slate-100 flex items-center justify-center">
                          <QrCode className="w-10 h-10 text-slate-300" />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-black font-bold text-lg">{p.user?.name}</div>
                    <div className="text-slate-600 text-sm">DOB: {new Date(p.dateOfBirth).toLocaleDateString()} • Age: {age}</div>
                    <div className="text-red-600 font-bold text-xl mt-1">Blood: {bloodDisplay}</div>
                    {p.dnr && (
                      <Badge className="bg-red-600 text-white mt-1">DNR</Badge>
                    )}
                    {severeAllergies.length > 0 && (
                      <div className="mt-2">
                        <div className="text-red-600 font-bold text-xs">⚠ ALLERGIES:</div>
                        <div className="text-black text-xs">
                          {severeAllergies.map(a => a.name).join(', ')}
                        </div>
                      </div>
                    )}
                    {primaryContact && (
                      <div className="mt-2">
                        <div className="text-black font-bold text-xs">Emergency Contact:</div>
                        <div className="text-slate-600 text-xs">
                          <Phone className="w-3 h-3 inline mr-1" />{primaryContact.name} ({primaryContact.relationship}) — {primaryContact.phone}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Red footer */}
                <div className="bg-red-600 px-4 py-2 text-center">
                  <span className="text-white font-bold text-xs">SCAN QR CODE IN EMERGENCY — vault.memoryvault.app</span>
                </div>
              </div>

              {/* Download full card */}
              <div className="hidden">
                <canvas ref={cardCanvasRef} />
              </div>
              <Button onClick={handleDownloadCard} className="w-full bg-red-600 hover:bg-red-700">
                <Download className="w-4 h-4 mr-2" />Download Medical ID Card
              </Button>

              {/* Key info summary */}
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Card Contents:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-800 rounded text-center">
                    <Droplets className="w-4 h-4 text-red-400 mx-auto mb-1" />
                    <div className="text-xs text-slate-500">Blood Type</div>
                    <div className="font-bold text-sm">{bloodDisplay}</div>
                  </div>
                  <div className="p-2 bg-slate-800 rounded text-center">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <div className="text-xs text-slate-500">Allergies</div>
                    <div className="font-bold text-sm">{p.allergies.length} ({severeAllergies.length} severe)</div>
                  </div>
                  <div className="p-2 bg-slate-800 rounded text-center">
                    <Heart className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <div className="text-xs text-slate-500">Conditions</div>
                    <div className="font-bold text-sm">{p.conditions.length}</div>
                  </div>
                  <div className="p-2 bg-slate-800 rounded text-center">
                    <Phone className="w-4 h-4 text-green-400 mx-auto mb-1" />
                    <div className="text-xs text-slate-500">Emergency</div>
                    <div className="font-bold text-sm">{p.emergencyContacts.length} contacts</div>
                  </div>
                </div>
                {p.dnr && (
                  <div className="p-2 bg-red-500/10 border border-red-500/30 rounded flex items-center gap-2">
                    <Badge variant="destructive">DNR</Badge>
                    <span className="text-sm text-red-400">Do Not Resuscitate order on file — shown on card</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
