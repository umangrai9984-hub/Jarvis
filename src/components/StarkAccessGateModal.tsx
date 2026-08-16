import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Key,
  Flame,
  Zap,
  Lock,
  Unlock,
  Sparkles,
  Database,
  Cpu,
  Fingerprint,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  Crown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  verifyStarkAccessKey,
  generateFirebaseClearanceKey,
  DEFAULT_STARK_KEYS,
  seedInitialStarkKeys,
} from '../lib/firebase';
import { playUiSound } from '../utils/audio';
import { StarkClearanceState } from '../types';

interface StarkAccessGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearanceGranted: (clearance: StarkClearanceState) => void;
}

export function StarkAccessGateModal({
  isOpen,
  onClose,
  onClearanceGranted,
}: StarkAccessGateModalProps) {
  const [keyCode, setKeyCode] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ label: string; clearance: string } | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      seedInitialStarkKeys();
      setErrorMessage(null);
      setSuccessInfo(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerVerificationSuccess = (key: string, label: string, clearanceLevel: string) => {
    setSuccessInfo({ label, clearance: clearanceLevel });
    playUiSound('access_granted');

    // Launch Stark Arc confetti
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#00e5ff', '#00ff9d', '#ff2d55', '#ffffff'],
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      const clearanceData: StarkClearanceState = {
        isGranted: true,
        activeKey: key,
        clearanceLevel,
        keyLabel: label,
        grantedAt: new Date().toISOString(),
      };
      localStorage.setItem('stark_clearance_cache', JSON.stringify(clearanceData));
      onClearanceGranted(clearanceData);
      onClose();
    }, 1400);
  };

  const handleVerify = async (keyToTest?: string) => {
    const targetKey = keyToTest || keyCode;
    if (!targetKey.trim()) {
      setErrorMessage('Please enter a Stark Security Access Key.');
      playUiSound('access_denied');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    // Simulate holographic biometric quantum scan
    for (let i = 20; i <= 100; i += 20) {
      setScanProgress(i);
      await new Promise((r) => setTimeout(r, 60));
    }

    const result = await verifyStarkAccessKey(targetKey);
    setIsVerifying(false);

    if (result.isValid) {
      triggerVerificationSuccess(
        targetKey.trim().toUpperCase(),
        result.label || 'Stark Clearance Key',
        result.clearanceLevel || 'Level 9 Tactical Command'
      );
    } else {
      setErrorMessage(result.message || 'Access Denied. Key not found in Stark Firebase database.');
      playUiSound('access_denied');
    }
  };

  const handleGenerateFirebaseKey = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const res = await generateFirebaseClearanceKey(applicantName.trim() || 'Stark Guest Operative');
      setKeyCode(res.keyCode);
      setIsGenerating(false);
      // Auto verify generated key
      await handleVerify(res.keyCode);
    } catch (err) {
      setIsGenerating(false);
      setErrorMessage('Could not generate key from Firebase. Try quick unlock keys below.');
    }
  };

  return (
    <div
      id="stark-access-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300"
    >
      <div
        id="stark-access-modal-box"
        className="w-full max-w-lg bg-[#050b16] border border-[#00e5ff50] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[0_0_80px_rgba(0,229,255,0.25)] text-left"
      >
        {/* Holographic Laser Grid Scanner line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent animate-pulse" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#6688aa] hover:text-white rounded-full bg-[#ffffff08] hover:bg-[#ffffff15] transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/15 border border-[#00e5ff]/40 flex items-center justify-center text-[#00e5ff] shadow-[0_0_25px_rgba(0,229,255,0.3)]">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#00e5ff] font-black">
                Stark Security Protocol
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#00e5ff]/20 text-[#00e5ff] text-[9px] font-mono font-bold">
                FIREBASE SYNC
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-wide">
              J.A.R.V.I.S. Access Clearance
            </h2>
          </div>
        </div>

        {/* Owner & Architect Credit */}
        <div className="p-3 bg-[#0a182e] border border-[#00e5ff25] rounded-xl flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs text-[#a0c4e8]">
              Authorized by Creator: <strong className="text-white">Umang Rai</strong>
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase text-[#00e5ff] font-bold">ARC MK-VII</span>
        </div>

        {/* Success Banner */}
        {successInfo ? (
          <div className="p-5 rounded-2xl bg-[#00ff9d]/15 border border-[#00ff9d]/50 text-center animate-in zoom-in-95 duration-200 mb-4">
            <CheckCircle2 className="w-10 h-10 text-[#00ff9d] mx-auto mb-2" />
            <h4 className="text-base font-bold text-white mb-1">Clearance Granted</h4>
            <p className="text-xs text-[#00ff9d] font-mono uppercase tracking-wider">{successInfo.clearance}</p>
            <p className="text-[11px] text-[#88cca8] mt-1 font-medium">{successInfo.label}</p>
          </div>
        ) : (
          <>
            {/* Input & Form */}
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-[#88a8cc] mb-1.5">
                  Enter Stark Clearance Access Key
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#00e5ff] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={keyCode}
                    onChange={(e) => setKeyCode(e.target.value)}
                    placeholder="Enter confidential authorization key..."
                    className="w-full bg-[#071224] border border-[#00e5ff40] focus:border-[#00e5ff] focus:ring-2 focus:ring-[#00e5ff]/20 text-white font-mono text-sm rounded-xl pl-10 pr-4 py-3 placeholder:text-[#335577] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#ff2d55]/15 border border-[#ff2d55]/40 text-[#ff2d55] text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => handleVerify()}
                  disabled={isVerifying || isGenerating}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#00e5ff] hover:bg-[#33ebff] active:scale-95 text-black font-bold text-sm shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying ({scanProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-4 h-4" />
                      <span>Verify & Unlock</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleGenerateFirebaseKey}
                  disabled={isVerifying || isGenerating}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0a1e38] hover:bg-[#0f2c52] border border-[#00e5ff35] text-[#00e5ff] font-semibold text-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Requesting from Cloud...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      <span>Request Cloud Clearance</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 rounded-xl bg-[#07152b] border border-[#00e5ff15] flex items-center gap-2.5 text-left">
              <ShieldAlert className="w-4 h-4 text-[#00e5ff] shrink-0" />
              <p className="text-[11px] text-[#7799bb] leading-relaxed">
                Stark clearance keys are strictly confidential and encrypted in Firebase Firestore. Enter your authorized credential above to unlock J.A.R.V.I.S. protocols.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
