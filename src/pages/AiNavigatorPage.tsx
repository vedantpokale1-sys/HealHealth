import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Stethoscope,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  PhoneCall,
  ExternalLink,
  MapPin,
  CalendarCheck,
  Building2,
  Cpu,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChatMessage, Doctor, HealthcareFacility } from '../types';
import { api, AiModelOption } from '../services/api';

interface ExtendedChatMessage extends ChatMessage {
  modelUsed?: string;
  citations?: Array<{ title: string; url: string }>;
  recommendedDoctors?: Doctor[];
  recommendedFacilities?: HealthcareFacility[];
  isEmergencyAlert?: boolean;
}

export const AiNavigatorPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Model Selection
  const [availableModels, setAvailableModels] = useState<AiModelOption[]>([
    {
      id: 'nvidia/nemotron-3.5-lightning-30b-a3b',
      name: 'NVIDIA Nemotron 3.5 Lightning 30B',
      tag: 'Ultra-Fast Clinical Reasoning',
      provider: 'NVIDIA NIM',
    },
    {
      id: 'meta/muse-glimmer-30b',
      name: 'Meta Muse Glimmer 30B',
      tag: 'Advanced Dialogue & Empathy',
      provider: 'NVIDIA NIM',
    },
    {
      id: 'nvidia/nemotron-3-ultra-550b-a55b',
      name: 'NVIDIA Nemotron 3 Ultra 550B',
      tag: 'Flagship Deep Medical Reasoning',
      provider: 'NVIDIA NIM',
    },
  ]);
  const [selectedModel, setSelectedModel] = useState<string>('nvidia/nemotron-3.5-lightning-30b-a3b');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'mr'>('en');

  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    {
      id: 'msg_init',
      sender: 'ai',
      text: "Hello! I am your HEALHEALTH AI Healthcare Navigator powered by NVIDIA NIM. Describe any physical symptoms, medications, or lab report questions. I will guide you with grounded clinical evidence and suggest verified medical specialists.",
      timestamp: 'Just now',
      modelUsed: 'nvidia/nemotron-3.5-lightning-30b-a3b',
    },
  ]);

  // Load models on mount
  useEffect(() => {
    api.getAiModels().then((res) => {
      if (res.models && res.models.length > 0) {
        setAvailableModels(res.models);
      }
    });
  }, []);

  // Handle query prompt passed from Dashboard
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialPrompt = params.get('prompt');
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
    }
  }, [location.search]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const suggestedPrompts = [
    'I have a sore throat, mild fever, and difficulty swallowing. What should I do?',
    'I have persistent morning headaches and sensitivity to light.',
    'Sharp knee pain and joint stiffness when standing up after long sitting.',
    'My recent report shows elevated LDL cholesterol. What questions should I ask my doctor?',
  ];

  const handleSend = async (userText: string) => {
    if (!userText.trim() || isTyping) return;

    const userMsg: ExtendedChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Build conversation history format
      const historyPayload = messages
        .filter((m) => m.id !== 'msg_init')
        .slice(-4)
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text,
        }));

      // Call Backend NVIDIA NIM AI Route
      const response = await api.sendAiChat({
        message: userText,
        history: historyPayload,
        modelId: selectedModel,
        language: selectedLanguage,
      });

      const aiMsg: ExtendedChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        urgencyLevel: response.isEmergency ? 'emergency' : 'routine',
        suggestedSpecialty: response.suggestedSpecialty,
        modelUsed: response.modelUsed,
        citations: response.citations,
        recommendedDoctors: response.recommendedDoctors,
        recommendedFacilities: response.recommendedFacilities,
        isEmergencyAlert: response.isEmergency,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('AI chat failed:', err);
      // Fallback message
      const fallbackMsg: ExtendedChatMessage = {
        id: `msg_ai_err_${Date.now()}`,
        sender: 'ai',
        text: `We are connecting to your healthcare assistant. Please review: general supportive care includes rest and hydration. If you experience critical symptoms, consult local emergency services immediately.\n\n*Educational Guidance Disclaimer: HEALHEALTH AI is an educational assistant.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedSpecialty: 'General Physician',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceToggle = () => {
    if (!isListening) {
      // Speech recognition if available
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'mr' ? 'mr-IN' : 'en-US';
        recognition.start();
        setIsListening(true);

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
      } else {
        // Fallback simulation
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
          setInput('I have a sore throat, mild fever, and pain when swallowing.');
        }, 2200);
      }
    } else {
      setIsListening(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: `msg_${Date.now()}`,
        sender: 'ai',
        text: "Conversation reset. Feel free to describe any new symptoms, health questions, or lab results.",
        timestamp: 'Just now',
        modelUsed: selectedModel,
      },
    ]);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg animate-in fade-in duration-200">
      {/* Header bar with Model Selector */}
      <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-500 flex items-center justify-center text-white shadow-md shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white">AI Healthcare Navigator</h2>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                NVIDIA NIM LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Evidence-Grounded Clinical Guidance • Doctor & Map Dispatch
            </p>
          </div>
        </div>

        {/* Model Selector & Language Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 3 Selectable NVIDIA NIM Models */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
            <Cpu className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer max-w-[210px] sm:max-w-[260px] truncate"
              title="Select NVIDIA NIM Foundation Model"
            >
              {availableModels.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Multilingual Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as any)}
            className="bg-slate-800/90 border border-slate-700 text-slate-300 rounded-xl px-2 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="en">English (EN)</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>

          {/* Reset button */}
          <button
            type="button"
            onClick={resetChat}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition border border-slate-700"
            title="Start new conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>

      {/* Safety Protocol Banner */}
      <div className="bg-amber-50/90 border-b border-amber-200 px-6 py-2 text-xs text-amber-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Clinical Safety Protocol:</strong> Guidance is educational triage grounded in verified medical references (MedlinePlus/NHS). Not a diagnostic substitute.
          </span>
        </div>
        <a href="tel:112" className="text-rose-700 font-bold hover:underline shrink-0 ml-2">
          Emergency: 112 / 911
        </a>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-[#F8FAFC]">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in`}
            >
              <div className={`max-w-2xl ${isUser ? 'order-1' : 'order-2'}`}>
                <div
                  className={`p-4 sm:p-5 rounded-2xl shadow-xs text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : msg.isEmergencyAlert
                      ? 'bg-rose-50 border-2 border-rose-500 text-rose-950 rounded-bl-none shadow-md'
                      : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Grounded Citation Sources */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                        Verified Sources:
                      </span>
                      {msg.citations.map((c, i) => (
                        <a
                          key={i}
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-md transition"
                        >
                          <span>{c.title}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Model Footer Tag */}
                  {!isUser && msg.modelUsed && (
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Powered by {msg.modelUsed}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                  )}

                  {/* Recommended Doctors Cards */}
                  {!isUser && msg.recommendedDoctors && msg.recommendedDoctors.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                        <span>Recommended Verified Doctors ({msg.suggestedSpecialty}):</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.recommendedDoctors.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-400 transition flex flex-col justify-between"
                          >
                            <div className="flex items-center gap-2.5 mb-2">
                              {doc.avatarUrl && (
                                <img
                                  src={doc.avatarUrl}
                                  alt={doc.name}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-300 shrink-0"
                                />
                              )}
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                                  {doc.name}
                                </h4>
                                <p className="text-[11px] text-teal-700 font-medium">
                                  {doc.specialty}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate max-w-[140px]">
                                  {doc.clinic}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                              <span className="text-[11px] font-semibold text-slate-700">
                                ₹{doc.consultationFee}
                              </span>
                              <Link
                                to={`/booking/${doc.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] rounded-lg transition shadow-xs"
                              >
                                <CalendarCheck className="w-3 h-3" />
                                <span>Book Slot</span>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Facilities Map Link */}
                  {!isUser && msg.recommendedFacilities && msg.recommendedFacilities.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Healthcare Facilities near you</span>
                      </div>
                      <Link
                        to="/locations"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>View on Live Map</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span>NVIDIA NIM ({availableModels.find((m) => m.id === selectedModel)?.name}) analyzing clinical symptoms...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Chips */}
      {messages.length <= 2 && (
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 overflow-x-auto">
          <p className="text-[11px] text-slate-500 font-semibold mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-600" /> Suggested Clinical Scenarios:
          </p>
          <div className="flex gap-2">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                className="text-xs bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 px-3 py-1.5 rounded-full whitespace-nowrap transition shadow-xs text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`p-2.5 rounded-xl border transition ${
              isListening
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'text-slate-500 hover:text-slate-800 bg-slate-50 border-slate-200'
            }`}
            title="Voice Symptom Dictation"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Describe symptoms or ask clinical questions (${availableModels.find((m) => m.id === selectedModel)?.name})...`}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
          />

          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl transition flex items-center gap-1.5 font-semibold text-sm shadow-sm"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
