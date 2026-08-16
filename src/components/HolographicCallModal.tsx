import { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Shield,
  Sparkles,
  Users,
  Search,
  Plus,
  Crown,
  Wifi,
  Activity,
  X,
  Clock,
  PhoneCall,
  UserCheck,
  Disc,
} from 'lucide-react';
import { CallContact, CallStage, AppMode, AppTheme } from '../types';
import { INITIAL_CALL_CONTACTS } from '../utils/creatorAndContacts';
import { playUiSound } from '../utils/audio';
import { logCallToFirebase } from '../lib/firebase';

interface HolographicCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetContactName?: string;
  appMode: AppMode;
  theme: AppTheme;
}

// Simulated dynamic voice banter for known contacts
const CONTACT_VOICE_SCRIPTS: Record<string, string[]> = {
  'Umang Rai': [
    "Hey! Umang here. Good to hear from you. The assistant and J.A.R.V.I.S. neural links are performing at peak efficiency. What's on your mind?",
    "Umang speaking! Always great to connect. Keep building something incredible today!",
  ],
  'Tony Stark': [
    "Stark here. Jarvis, is my lab on fire again, or did you just want to compliment my latest armor design?",
    "Hey, this is Tony. I'm currently at 30,000 feet breaking sound barriers. Make it quick!",
  ],
  'Pepper Potts': [
    "Hello? Pepper Potts speaking. I hope Tony hasn't accidentally launched another satellite into orbit...",
    "Hi there! Stark Industries executive line. How can I assist you right now?",
  ],
  'Peter Parker': [
    "Uh, hey! It's Peter! Sorry if it's loud, I'm swinging through Queens right now trying to stop a runaway taxi. What's up?",
    "Hey! Spider-Man on the line! Jarvis, please tell Mr. Stark the new web shooters are awesome!",
  ],
  'Dr. Bruce Banner': [
    "Banner here. Just running calculations on gamma containment fields. Everything looks stable.",
  ],
  'Nick Fury': [
    "This is Director Fury on a secure encrypted channel. Who authorized this frequency?",
  ],
  'Thor Odinson': [
    "Greetings mortal! The thunder rolls across Asgard! Speak thy purpose!",
  ],
};

export function HolographicCallModal({
  isOpen,
  onClose,
  targetContactName,
  appMode,
}: HolographicCallModalProps) {
  const [contacts, setContacts] = useState<CallContact[]>(INITIAL_CALL_CONTACTS);
  const [selectedContact, setSelectedContact] = useState<CallContact>(INITIAL_CALL_CONTACTS[0]);
  const [callStage, setCallStage] = useState<CallStage>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [isRecording, setIsRecording] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [showCustomDialer, setShowCustomDialer] = useState(false);
  const [dialogueSnippet, setDialogueSnippet] = useState<string | null>(null);

  const durationTimerRef = useRef<any>(null);
  const ringtoneIntervalRef = useRef<any>(null);

  const isJarvis = appMode === 'jarvis';

  // Handle incoming voice-initiated target contact
  useEffect(() => {
    if (isOpen && targetContactName) {
      const match = contacts.find(
        (c) =>
          c.name.toLowerCase().includes(targetContactName.toLowerCase()) ||
          targetContactName.toLowerCase().includes(c.name.toLowerCase())
      );
      if (match) {
        startCall(match);
      } else {
        const dynamicContact: CallContact = {
          id: `custom-${Date.now()}`,
          name: targetContactName,
          roleOrTitle: 'Direct Comm Link',
          handleOrNumber: 'Quantum Patch Link',
          category: 'custom',
          avatarGradient: 'from-[#00e5ff] to-[#a855f7]',
          status: 'online',
        };
        setContacts((prev) => [dynamicContact, ...prev]);
        startCall(dynamicContact);
      }
    }
  }, [isOpen, targetContactName]);

  // Clean up timers on unmount or stage change
  useEffect(() => {
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      if (ringtoneIntervalRef.current) clearInterval(ringtoneIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const startCall = (contact: CallContact) => {
    setSelectedContact(contact);
    setCallStage('dialing');
    setCallDuration(0);
    setDialogueSnippet(null);

    // Play initial ringtone
    playUiSound('ringtone');
    if (ringtoneIntervalRef.current) clearInterval(ringtoneIntervalRef.current);
    ringtoneIntervalRef.current = setInterval(() => {
      playUiSound('ringtone');
    }, 1800);

    // Connect after 2.4s of realistic dialing
    setTimeout(() => {
      if (ringtoneIntervalRef.current) clearInterval(ringtoneIntervalRef.current);
      setCallStage('connected');
      playUiSound('call_connect');

      // Pick dialogue script
      const scripts = CONTACT_VOICE_SCRIPTS[contact.name] || [
        `"Secure holographic comms link established with ${contact.name}. Audio uplink active."`,
      ];
      const selectedScript = scripts[Math.floor(Math.random() * scripts.length)];
      setDialogueSnippet(selectedScript);

      // Start duration counter
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }, 2400);
  };

  const endCall = () => {
    if (ringtoneIntervalRef.current) clearInterval(ringtoneIntervalRef.current);
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);

    playUiSound('call_end');
    setCallStage('ended');

    // Log to Firebase
    logCallToFirebase({
      contactName: selectedContact.name,
      handleOrNumber: selectedContact.handleOrNumber,
      durationSeconds: callDuration,
      status: 'COMPLETED',
      category: selectedContact.category,
    });

    setTimeout(() => {
      setCallStage('idle');
      setCallDuration(0);
      setDialogueSnippet(null);
    }, 900);
  };

  const handleCustomCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newContact: CallContact = {
      id: `contact-${Date.now()}`,
      name: customName.trim(),
      roleOrTitle: customNumber.trim() || 'Direct Tactical Dial',
      handleOrNumber: customNumber.trim() || 'Encrypted Satellite Comms',
      category: 'custom',
      avatarGradient: 'from-[#00e5ff] to-[#ec4899]',
      status: 'online',
    };

    setContacts((prev) => [newContact, ...prev]);
    setShowCustomDialer(false);
    setCustomName('');
    setCustomNumber('');
    startCall(newContact);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.roleOrTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      id="holographic-call-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300"
    >
      <div
        id="holographic-call-matrix"
        className={`w-full max-w-4xl h-[92vh] max-h-[720px] rounded-3xl border flex flex-col md:flex-row overflow-hidden shadow-[0_0_90px_rgba(0,229,255,0.2)] relative transition-all ${
          isJarvis
            ? 'bg-[#030712] border-[#00e5ff40]'
            : 'bg-[#0a0a0f] border-[#ffffff15]'
        }`}
      >
        {/* Top Floating Close Button */}
        <button
          onClick={() => {
            if (callStage === 'connected' || callStage === 'dialing') {
              endCall();
            }
            onClose();
          }}
          className="absolute top-4 right-4 z-20 p-2 text-[#7799bb] hover:text-white rounded-full bg-[#ffffff0a] hover:bg-[#ffffff15] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Holographic Active Call Stage */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 relative bg-gradient-to-b from-[#060e1d] to-[#02050b] border-b md:border-b-0 md:border-r border-[#00e5ff20]">
          {/* Top Comm Status Bar */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-ping" />
              <span className="font-mono uppercase font-bold text-[#00e5ff] tracking-widest text-[10px]">
                {isJarvis ? 'Stark Quantum Comms' : 'UMNG Holographic Matrix'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[#7799bb] font-mono text-[11px]">
              <span className="flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-[#00ff9d]" /> 42 Gbps
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-[#00e5ff]" /> 4096-bit AES
              </span>
            </div>
          </div>

          {/* Center Stage: Holographic Avatar & Waveform Rings */}
          <div className="flex flex-col items-center justify-center my-auto py-6">
            {/* Holographic Avatar Box */}
            <div className="relative flex items-center justify-center">
              {/* Outer Rotating HUD Ring 1 */}
              <div
                className={`absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-dashed transition-all duration-700 ${
                  callStage === 'connected'
                    ? 'border-[#00e5ff]/60 animate-[spin_10s_linear_infinite]'
                    : callStage === 'dialing'
                    ? 'border-[#00e5ff]/30 animate-[spin_3s_linear_infinite]'
                    : 'border-[#ffffff10]'
                }`}
              />

              {/* Outer Pulsing Ring 2 */}
              <div
                className={`absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border transition-all duration-500 ${
                  callStage === 'connected'
                    ? 'border-[#00ff9d]/40 shadow-[0_0_30px_rgba(0,255,157,0.3)] animate-pulse'
                    : 'border-transparent'
                }`}
              />

              {/* Avatar Center Circle */}
              <div
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr ${selectedContact.avatarGradient} flex items-center justify-center shadow-2xl relative overflow-hidden transition-transform duration-300 ${
                  callStage === 'connected' ? 'scale-105 ring-4 ring-[#00e5ff]' : ''
                }`}
              >
                {selectedContact.name === 'Umang Rai' ? (
                  <Crown className="w-12 h-12 text-white drop-shadow-md" />
                ) : (
                  <span className="text-3xl font-black text-white tracking-wider">
                    {selectedContact.name.substring(0, 2).toUpperCase()}
                  </span>
                )}

                {/* Scanline overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-40" />
              </div>
            </div>

            {/* Caller Name & Subtitle */}
            <div className="text-center mt-5">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  {selectedContact.name}
                </h3>
                {selectedContact.name === 'Umang Rai' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-400 text-[10px] font-bold">
                    OWNER
                  </span>
                )}
              </div>
              <p className="text-xs text-[#88aacc] font-medium mt-0.5">{selectedContact.roleOrTitle}</p>
              <p className="text-[11px] font-mono text-[#557799] mt-0.5">{selectedContact.handleOrNumber}</p>
            </div>

            {/* Call State & Duration */}
            <div className="mt-4 text-center">
              {callStage === 'dialing' && (
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#00e5ff] uppercase tracking-wider animate-pulse">
                  <Radio className="w-4 h-4 animate-spin" />
                  <span>Diverting Holographic Comms...</span>
                </div>
              )}

              {callStage === 'connected' && (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-ping" />
                  <span className="text-sm font-mono font-bold text-[#00ff9d]">
                    {formatSeconds(callDuration)}
                  </span>
                </div>
              )}

              {callStage === 'idle' && (
                <span className="text-xs text-[#6688aa] font-medium">Ready to initiate comms link</span>
              )}

              {callStage === 'ended' && (
                <span className="text-xs font-mono text-[#ff2d55] uppercase tracking-wider font-bold">
                  Comms Terminated
                </span>
              )}
            </div>

            {/* Dialogue / Script Feedback Quote */}
            {dialogueSnippet && callStage === 'connected' && (
              <div className="mt-4 max-w-sm mx-auto p-3 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#cceeff] text-xs italic leading-relaxed text-center shadow-lg animate-in fade-in duration-300">
                {dialogueSnippet}
              </div>
            )}
          </div>

          {/* Bottom Action Controls Bar */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-[#00e5ff15]">
            {callStage === 'connected' || callStage === 'dialing' ? (
              <>
                {/* Mute Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3.5 rounded-2xl border transition-all active:scale-95 ${
                    isMuted
                      ? 'bg-[#ff2d55]/20 border-[#ff2d55]/50 text-[#ff2d55]'
                      : 'bg-[#0f1d33] border-[#00e5ff30] text-[#00e5ff] hover:bg-[#00e5ff]/20'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* End Call Button */}
                <button
                  onClick={endCall}
                  className="px-6 py-3.5 rounded-2xl bg-[#ff2d55] hover:bg-[#ff4466] text-white font-bold flex items-center gap-2 active:scale-95 shadow-[0_0_30px_rgba(255,45,85,0.6)] transition-all"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-wider">End Comms</span>
                </button>

                {/* Speaker Toggle */}
                <button
                  onClick={() => setIsSpeaker(!isSpeaker)}
                  className={`p-3.5 rounded-2xl border transition-all active:scale-95 ${
                    isSpeaker
                      ? 'bg-[#0f1d33] border-[#00e5ff30] text-[#00e5ff]'
                      : 'bg-[#151520] border-[#ffffff10] text-[#666]'
                  }`}
                  title="Speaker Output"
                >
                  {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <button
                onClick={() => startCall(selectedContact)}
                className="w-full max-w-xs py-3.5 rounded-2xl bg-[#00e5ff] hover:bg-[#33ebff] active:scale-95 text-black font-black flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all"
              >
                <PhoneCall className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wider">Call {selectedContact.name}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Contact Directory & Dial Pad */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col bg-[#050b16] p-5 sm:p-6 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00e5ff]" />
              <h4 className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                Comms Directory
              </h4>
            </div>
            <button
              onClick={() => setShowCustomDialer(!showCustomDialer)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-all ${
                showCustomDialer
                  ? 'bg-[#00e5ff] text-black border-[#00e5ff]'
                  : 'bg-[#0a182e] text-[#00e5ff] border-[#00e5ff30] hover:bg-[#00e5ff]/20'
              }`}
            >
              <Plus className="w-3 h-3" />
              <span>{showCustomDialer ? 'List' : 'Dial Keypad'}</span>
            </button>
          </div>

          {showCustomDialer ? (
            /* Custom Keypad Form */
            <form onSubmit={handleCustomCall} className="space-y-3.5 my-auto">
              <p className="text-xs text-[#88aacc] leading-relaxed">
                Enter any person, agent, or emergency number to route through the J.A.R.V.I.S. matrix:
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-[#88aacc] mb-1">Contact / Person Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Elon Musk, Mom, Bruce Wayne"
                  className="w-full bg-[#0a182e] border border-[#00e5ff30] focus:border-[#00e5ff] text-white text-xs rounded-xl px-3.5 py-2.5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#88aacc] mb-1">Channel / Phone Number</label>
                <input
                  type="text"
                  value={customNumber}
                  onChange={(e) => setCustomNumber(e.target.value)}
                  placeholder="+1 (555) 019-2831 or @handle"
                  className="w-full bg-[#0a182e] border border-[#00e5ff30] focus:border-[#00e5ff] text-white text-xs rounded-xl px-3.5 py-2.5 outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#00e5ff] hover:bg-[#33ebff] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Patch Call Immediately</span>
              </button>
            </form>
          ) : (
            /* Directory List */
            <>
              {/* Search Box */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-[#557799] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full bg-[#0a182e] border border-[#00e5ff20] focus:border-[#00e5ff] text-white text-xs rounded-xl pl-9 pr-3 py-2 outline-none"
                />
              </div>

              {/* Contacts Scrollable List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredContacts.map((contact) => {
                  const isSelected = selectedContact.id === contact.id;
                  return (
                    <button
                      key={contact.id}
                      onClick={() => {
                        setSelectedContact(contact);
                        if (callStage === 'idle') {
                          startCall(contact);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-[#00e5ff]/15 border-[#00e5ff]/60 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                          : 'bg-[#0a182e]/50 border-[#ffffff08] hover:border-[#00e5ff30] hover:bg-[#0a182e]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${contact.avatarGradient} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                        >
                          {contact.name === 'Umang Rai' ? (
                            <Crown className="w-4 h-4 text-white" />
                          ) : (
                            contact.name.substring(0, 1)
                          )}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-xs font-bold text-white truncate">{contact.name}</span>
                            {contact.name === 'Umang Rai' && (
                              <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-[#7799bb] truncate block font-medium">
                            {contact.roleOrTitle}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 pl-2">
                        <PhoneCall
                          className={`w-4 h-4 ${
                            isSelected ? 'text-[#00e5ff]' : 'text-[#446688] hover:text-[#00e5ff]'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
