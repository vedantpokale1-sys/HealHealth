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
  RefreshCw,
  Edit3,
  Paperclip,
  FileText,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChatMessage, Doctor, HealthcareFacility, ExtendedChatMessage } from '../types';
import { api, AiModelOption } from '../services/api';
import { useApp } from '../context/AppContext';

export const AiNavigatorPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { aiChatMessages: messages, setAiChatMessages: setMessages, clearAiChat } = useApp();

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    type: string;
    size: string;
    content?: string;
    dataUrl?: string;
    isImage?: boolean;
  } | null>(null);

  // Model Selection
  const [availableModels, setAvailableModels] = useState<AiModelOption[]>([
    {
      id: 'nvidia/nemotron-3.5-super-vl-120b-a12b',
      name: 'Nemotron 3.5 Super VL (120B)',
      tag: 'Advanced Multimodal Clinical Reasoning',
      provider: 'NVIDIA NIM',
    },
    {
      id: 'nvidia/nemotron-3.5-lightning-30b-a3b',
      name: 'Nemotron 3.5 Lightning (30B)',
      tag: 'Rapid Clinical Triage & Guidance',
      provider: 'NVIDIA NIM',
    },
    {
      id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',
      name: 'Nemotron 3 Nano Omni',
      tag: 'Deep Reasoning & Clinical Analysis',
      provider: 'NVIDIA NIM',
    },
  ]);
  const [selectedModel, setSelectedModel] = useState<string>('nvidia/nemotron-3.5-super-vl-120b-a12b');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'mr'>('en');

  // Load models on mount
  useEffect(() => {
    api.getAiModels().then((res) => {
      if (res.models && res.models.length > 0) {
        setAvailableModels(res.models);
        if (res.defaultModel) {
          setSelectedModel(res.defaultModel);
        }
      }
    });
  }, []);

  // Handle query prompt passed from Dashboard
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialPrompt = params.get('prompt');
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
      navigate(location.pathname, { replace: true });
    }
  }, [location.search]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const suggestedPrompts = [
    'Analyze sample Complete Blood Count (CBC) with Platelets (PDF)',
    'Analyze sample Dengue NS1 & Acute Febrile Serology Panel',
    'I have a sore throat, mild fever, and difficulty swallowing. What should I do?',
    'My recent report shows elevated LDL cholesterol. What questions should I ask my doctor?',
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();

    reader.onload = () => {
      setAttachedFile({
        name: file.name,
        type: file.type || (isImage ? 'image/jpeg' : 'application/pdf'),
        size: fileSizeFormatted,
        dataUrl: reader.result as string,
        isImage,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSend = async (userText?: string, fileOverride?: typeof attachedFile) => {
    const fileToUpload = fileOverride !== undefined ? fileOverride : attachedFile;
    const rawText = userText !== undefined ? userText : input;
    let trimmed = rawText.trim();

    if (!trimmed && !fileToUpload) return;
    if (isTyping) return;

    if (!trimmed && fileToUpload) {
      trimmed = `Please analyze my attached clinical report (${fileToUpload.name}), explain any abnormal markers in plain language, and recommend 3 questions for my doctor.`;
    }

    const userMsg: ExtendedChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: fileToUpload ? { ...fileToUpload } : undefined,
    };

    // Prepare current history snapshot before adding the new message
    const historyPayload = messages
      .filter((m) => m.id !== 'msg_init' && !m.isError)
      .slice(-6)
      .map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));

    // Clear input once the message is successfully accepted for processing
    setInput('');
    setAttachedFile(null);
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Call Backend AI Chat Route with Multimodal Support
      const response = await api.sendAiChat({
        message: trimmed,
        imageUrl: fileToUpload?.dataUrl,
        attachment: fileToUpload
          ? {
              name: fileToUpload.name,
              type: fileToUpload.type,
              size: fileToUpload.size,
              content: fileToUpload.content,
            }
          : undefined,
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
      console.error('AI chat request failed:', err);
      const errMsg: ExtendedChatMessage = {
        id: `msg_ai_err_${Date.now()}`,
        sender: 'ai',
        text: `AI Assistant Communication Error: ${err.message || 'Unable to reach the AI healthcare model.'}\n\nPlease check your connection and try again. You can retry sending your question below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        failedPrompt: trimmed,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceToggle = () => {
    if (!isListening) {
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
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
          setInput('I have a sore throat, mild fever, and pain when swallowing.');
        }, 2000);
      }
    } else {
      setIsListening(false);
    }
  };

  const resetChat = () => {
    clearAiChat();
  };

  const activeModelObj = availableModels.find((m) => m.id === selectedModel);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-xl border border-hairline overflow-hidden shadow-soft animate-fade-in">
      {/* Header bar with Model Selector */}
      <div className="px-4 sm:px-6 py-3.5 bg-white border-b border-hairline flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-ink flex items-center justify-center text-white shrink-0">
            <Bot className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-ink">Healthcare Navigator</h2>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ONLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Careful, source-backed health information — not a diagnosis. Powered by {activeModelObj?.name || 'AI'}.
            </p>
          </div>
        </div>

        {/* Model Selector & Language Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selectable Models */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-hairline rounded-lg px-2.5 py-1 text-xs">
            <Cpu className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-ink focus:outline-none cursor-pointer max-w-[210px] sm:max-w-[260px] truncate"
              title="Select AI Clinical Foundation Model"
            >
              {availableModels.map((m) => (
                <option key={m.id} value={m.id} className="bg-white text-ink">
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
          </div>

          {/* Multilingual Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as any)}
            className="bg-slate-50 border border-hairline text-ink-soft rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="en">English (EN)</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>

          {/* Reset button */}
          <button
            type="button"
            onClick={resetChat}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-ink-soft hover:text-ink hover:bg-slate-100 transition border border-hairline"
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
                      : msg.isError
                      ? 'bg-rose-50 border border-rose-300 text-rose-950 rounded-bl-none shadow-xs'
                      : msg.isEmergencyAlert
                      ? 'bg-rose-50 border-2 border-rose-500 text-rose-950 rounded-bl-none shadow-md'
                      : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
                  }`}
                >
                  {/* Attached Medical Document / Image */}
                  {msg.attachment && (
                    <div
                      className={`mb-3 p-2.5 rounded-xl flex items-center gap-2.5 ${
                        isUser
                          ? 'bg-blue-700/60 border border-blue-400/40 text-white'
                          : 'bg-slate-100 border border-slate-200 text-slate-800'
                      }`}
                    >
                      {msg.attachment.isImage && msg.attachment.dataUrl ? (
                        <img
                          src={msg.attachment.dataUrl}
                          alt={msg.attachment.name}
                          className="w-12 h-12 object-cover rounded-lg border border-white/40 shrink-0 bg-white"
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            isUser ? 'bg-blue-800 text-blue-100' : 'bg-teal-100 text-teal-700'
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs truncate">{msg.attachment.name}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              isUser ? 'bg-blue-500/50 text-white' : 'bg-teal-50 text-teal-700 border border-teal-200'
                            }`}
                          >
                            {msg.attachment.isImage ? 'Image' : 'PDF Report'}
                          </span>
                        </div>
                        <p className={`text-[10px] mt-0.5 ${isUser ? 'text-blue-100' : 'text-slate-500'}`}>
                          {msg.attachment.size || 'Diagnostic Attachment'} • Clinical telemetry evaluated
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Retry Action on Failure */}
                  {msg.isError && msg.failedPrompt && (
                    <div className="mt-3 pt-3 border-t border-rose-200 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-rose-700">Request could not be completed.</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setInput(msg.failedPrompt!)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSend(msg.failedPrompt!)}
                          disabled={isTyping}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition shadow-xs"
                        >
                          <RefreshCw className={`w-3 h-3 ${isTyping ? 'animate-spin' : ''}`} />
                          <span>Retry</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Grounded Citation Sources */}
                  {!isUser && !msg.isError && msg.citations && msg.citations.length > 0 && (
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
                  {!isUser && msg.modelUsed && !msg.isError && (
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Powered by {msg.modelUsed}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                  )}

                  {/* Recommended Doctors Cards */}
                  {!isUser && !msg.isError && msg.recommendedDoctors && msg.recommendedDoctors.length > 0 && (
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
                  {!isUser && !msg.isError && msg.recommendedFacilities && msg.recommendedFacilities.length > 0 && (
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
              <span>{activeModelObj?.name || 'AI Assistant'} analyzing clinical symptoms...</span>
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
                disabled={isTyping}
                className="text-xs bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 px-3 py-1.5 rounded-full whitespace-nowrap transition shadow-xs text-left disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,image/*,.png,.jpg,.jpeg,.webp,.bmp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Chat Input Bar */}
      <div className="p-4 bg-white border-t border-slate-200">
        {/* Attachment preview if user picked a file */}
        {attachedFile && (
          <div className="mb-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              {attachedFile.isImage && attachedFile.dataUrl ? (
                <img
                  src={attachedFile.dataUrl}
                  alt="Attachment Preview"
                  className="w-9 h-9 rounded-lg object-cover border border-teal-300 shrink-0 bg-white"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-teal-900 truncate">{attachedFile.name}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-200/60 text-teal-800 uppercase">
                    {attachedFile.isImage ? 'Image' : 'PDF'}
                  </span>
                </div>
                <p className="text-[10px] text-teal-700 mt-0.5">
                  {attachedFile.size} • Ready for AI clinical review
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              className="p-1 text-teal-700 hover:text-teal-950 hover:bg-teal-100 rounded-lg transition"
              title="Remove Attachment"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isTyping && (input.trim() || attachedFile)) {
              handleSend(input);
            }
          }}
          className="flex items-center gap-2"
        >
          {/* File Upload Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl border text-slate-600 hover:text-teal-700 hover:bg-teal-50 bg-slate-50 border-slate-200 transition shrink-0"
            title="Attach Medical Report or Image (PDF, JPG, PNG)"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`p-2.5 rounded-xl border transition shrink-0 ${
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isTyping && (input.trim() || attachedFile)) {
                  handleSend(input);
                }
              }
            }}
            disabled={isTyping}
            placeholder={
              attachedFile
                ? `Add notes or send to analyze ${attachedFile.name}...`
                : `Describe symptoms, ask questions, or attach reports (${activeModelObj?.name || 'AI'})...`
            }
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={(!input.trim() && !attachedFile) || isTyping}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl transition flex items-center gap-1.5 font-semibold text-sm shadow-sm shrink-0"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
