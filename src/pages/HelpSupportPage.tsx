import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  ChevronRight,
  PhoneCall,
  ShieldAlert,
  Send,
  CheckCircle2,
  Lock,
  Bot,
  Activity,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { FAQS } from '../data/mockData';

export const HelpSupportPage: React.FC = () => {
  const [faqSearch, setFaqSearch] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setTicketSent(true);
    setTicketSubject('');
    setTicketMessage('');
    setTimeout(() => setTicketSent(false), 4000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Help Center & Clinical Safety
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Browse platform documentation, understand AI triage limitations, and reach customer care.
          </p>
        </div>

        <Badge variant="teal">24/7 Patient Support Guidance</Badge>
      </div>

      {/* Emergency Immediate Action Alert Card */}
      <div className="p-5 bg-gradient-to-r from-rose-600 to-red-700 text-white rounded-2xl shadow-md space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-300" />
          <span>Experiencing an Acute Medical Emergency?</span>
        </div>
        <p className="text-xs text-rose-100 leading-relaxed">
          If you or someone in your care is experiencing crushing chest pain, difficulty breathing, sudden slurred speech, or uncontrollable bleeding, do not wait for AI responses or doctor appointments.
        </p>
        <div className="flex items-center gap-3 pt-1">
          <a
            href="tel:112"
            className="inline-flex items-center gap-2 bg-white text-rose-700 hover:bg-rose-50 px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm transition"
          >
            <PhoneCall className="w-4 h-4 text-rose-600" />
            <span>Call National Emergency: 112 (India) / 911 (US)</span>
          </a>
        </div>
      </div>

      {/* AI Limitations & Boundaries */}
      <Card className="p-6 bg-slate-900 text-white space-y-3 border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
          <Bot className="w-4 h-4 text-teal-400" />
          <span>AI Clinical Scope & Medical Guardrails</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          HEALHEALTH uses artificial intelligence to interpret layperson descriptions into relevant clinical specialties and explain laboratory biomarker terminology. <strong>It does not diagnose medical conditions, alter dosages, or prescribe pharmaceuticals.</strong> Always follow instructions from your treating physician.
        </p>
      </Card>

      {/* FAQ Search */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h2>
          <span className="text-xs text-slate-500">{filteredFaqs.length} articles</span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            placeholder="Search FAQs by topic (e.g. AI safety, appointments, reports)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={faq.question}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-900 hover:text-teal-600 transition"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" size="sm">{faq.category}</Badge>
                    <span>{faq.question}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90 text-teal-600' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulated Support Inquiry Form */}
      <Card className="p-6 sm:p-8">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Contact Platform Support</h3>
        <p className="text-xs text-slate-500 mb-4">
          Need assistance with simulated records or experiencing technical navigation issues?
        </p>

        {ticketSent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Support ticket recorded! In a production deployment, our team responds within 24 hours.</span>
          </div>
        ) : (
          <form onSubmit={handleSendTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="e.g. Appointment rescheduling question or bug report"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Message Details</label>
              <textarea
                rows={4}
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Provide details about your query..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
            </div>

            <div className="flex justify-end">
              <Button variant="teal" size="md" type="submit" rightIcon={<Send className="w-4 h-4" />}>
                Submit Inquiry
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
