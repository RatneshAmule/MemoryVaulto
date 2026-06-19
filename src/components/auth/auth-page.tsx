'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export function AuthPage() {
  const { authMode, setAuthMode, setCurrentPage, login, register } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState('patient');
  const [regHospital, setRegHospital] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(loginEmail, loginPassword);
    if (!success) {
      toast.error('Invalid email or password');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPassword || !regName) {
      toast.error('All fields are required');
      return;
    }
    setLoading(true);
    const success = await register({
      email: regEmail,
      password: regPassword,
      name: regName,
      role: regRole,
      hospital: regRole !== 'patient' ? regHospital : undefined,
    });
    if (!success) {
      toast.error('Registration failed. Email may already be in use.');
    } else {
      toast.success('Registration successful!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">MemoryVault</span>
          </div>
          <p className="text-slate-400 text-sm">
            {authMode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex mb-6 bg-slate-800 rounded-lg p-1">
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              authMode === 'login' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setAuthMode('login')}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              authMode === 'register' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
            onClick={() => setAuthMode('register')}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label className="text-slate-300 text-sm">Email</Label>
              <Input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white mt-1.5"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white h-11"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            {/* Test Accounts */}
            <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-3 font-medium">TEST ACCOUNTS</p>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Patient:</span>
                  <button
                    type="button"
                    className="text-red-400 hover:text-red-300 font-mono"
                    onClick={() => { setLoginEmail('maria@test.com'); setLoginPassword('password123'); }}
                  >
                    maria@test.com
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Patient 2:</span>
                  <button
                    type="button"
                    className="text-red-400 hover:text-red-300 font-mono"
                    onClick={() => { setLoginEmail('james@test.com'); setLoginPassword('password123'); }}
                  >
                    james@test.com
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Doctor:</span>
                  <button
                    type="button"
                    className="text-amber-400 hover:text-amber-300 font-mono"
                    onClick={() => { setLoginEmail('dr.chen@test.com'); setLoginPassword('password123'); }}
                  >
                    dr.chen@test.com
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Paramedic:</span>
                  <button
                    type="button"
                    className="text-emerald-400 hover:text-emerald-300 font-mono"
                    onClick={() => { setLoginEmail('paramedic@test.com'); setLoginPassword('password123'); }}
                  >
                    paramedic@test.com
                  </button>
                </div>
                <p className="text-slate-500 mt-1">Password for all: password123</p>
              </div>
            </div>
          </form>
        )}

        {/* Register Form */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label className="text-slate-300 text-sm">Full Name</Label>
              <Input
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white mt-1.5"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Email</Label>
              <Input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white mt-1.5"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white pr-10"
                  placeholder="Min 8 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Role</Label>
              <Select value={regRole} onValueChange={setRegRole}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="paramedic">Paramedic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {regRole !== 'patient' && (
              <div>
                <Label className="text-slate-300 text-sm">Hospital / Organization</Label>
                <Input
                  value={regHospital}
                  onChange={(e) => setRegHospital(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white mt-1.5"
                  placeholder="Hospital name"
                />
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white h-11"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        )}

        {/* Back button */}
        <button
          onClick={() => setCurrentPage('landing')}
          className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mt-6 mx-auto transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>
      </motion.div>
    </div>
  );
}
