import React, { useState } from 'react';
import { askTalkToPast } from '../services/api';
import { MessageSquare, Send, X, Sparkles, User, ShieldCheck, Loader2, Compass } from 'lucide-react';

interface TalkToPastModalProps {
  placeName: string;
  context: any;
  isOpen: boolean;
  onClose: () => void;
}

const PERSONAS = [
  {
    id: 'Resident',
    label: 'Elderly Resident',
    icon: '👵',
    desc: 'Lifelong inhabitant of the historic quarters and ghats',
  },
  {
    id: 'Artisan',
    label: 'Master Artisan',
    icon: '🧵',
    desc: 'Practitioner of living ancestral crafts & workshop lore',
  },
  {
    id: 'Historian',
    label: 'Heritage Historian',
    icon: '🏛️',
    desc: 'Academic archival perspective on eras & inscriptions',
  },
  {
    id: 'Caretaker',
    label: 'Sanctuary Caretaker',
    icon: '🛕',
    desc: 'Custodian of sacred rituals, courtyards & conservation',
  },
  {
    id: 'Local Community',
    label: 'Local Community Voice',
    icon: '👨‍🌾',
    desc: 'Agrarian customs, folk festivals & oral bazaar memory',
  },
];

export const TalkToPastModal: React.FC<TalkToPastModalProps> = ({
  placeName,
  context,
  isOpen,
  onClose,
}) => {
  const [selectedPersona, setSelectedPersona] = useState('Resident');
  const [inputQuestion, setInputQuestion] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; persona?: string; sources?: string[] }[]
  >([
    {
      role: 'assistant',
      persona: 'Resident',
      text: `Pranam. I have spent my life in the historic alleys surrounding ${placeName}. What would you like to discover about what these stones have witnessed over generations?`,
    },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectPersona = (pId: string) => {
    setSelectedPersona(pId);
    const pObj = PERSONAS.find((p) => p.id === pId);
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        persona: pId,
        text: `Switched perspective to ${pObj?.label} (${pObj?.desc}). Grounded in authentic records of ${placeName}.`,
      },
    ]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || loading) return;

    const userQ = inputQuestion.trim();
    setInputQuestion('');

    const newHistory = [...messages, { role: 'user' as const, text: userQ }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await askTalkToPast(
        placeName,
        selectedPersona,
        userQ,
        context,
        messages.map((m) => ({ role: m.role, text: m.text }))
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          persona: selectedPersona,
          text: res.reply,
          sources: res.sources,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          persona: selectedPersona,
          text: 'I apologize; I could not access the cultural intelligence layer at this moment. Please ask again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col h-[85vh] my-8 text-stone-100 overflow-hidden shrink-0">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-heritage text-amber-100">
                  Talk to the Past
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  Grounded Persona
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Consult authentic conversational perspectives grounded in verified history of{' '}
                <span className="text-stone-200 font-medium">{placeName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Selector Carousel */}
        <div className="px-4 sm:px-6 py-2.5 bg-stone-900 border-b border-stone-800/80 overflow-x-auto flex gap-2">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPersona(p.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all ${
                selectedPersona === p.id
                  ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-md'
                  : 'bg-stone-950/70 text-stone-300 border-stone-800 hover:border-stone-700'
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Chat Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 font-medium mb-1">
                  <span>
                    {PERSONAS.find((p) => p.id === m.persona)?.icon || '🏛️'} Speaking as{' '}
                    {m.persona || 'Historian'}
                  </span>
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-amber-600 text-stone-950 font-medium rounded-tr-none'
                    : 'bg-stone-800/90 text-stone-100 border border-stone-700/80 rounded-tl-none shadow-md'
                }`}
              >
                {m.text}

                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-stone-700/60 text-[10px] text-stone-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>Grounded in: {m.sources.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-stone-800/60 px-3.5 py-2.5 rounded-2xl w-fit border border-stone-700/50 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Consulting cultural records as {selectedPersona}...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompt Chips */}
        <div className="px-4 py-2 bg-stone-950/60 border-t border-stone-800/80 overflow-x-auto flex gap-2">
          {[
            'Why is this landmark culturally sacred?',
            'What traditional craft was practiced here?',
            'Are there generational families still living nearby?',
            'What heirloom recipes belong to this season?',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => setInputQuestion(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700 shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Question Input */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 bg-stone-950 border-t border-stone-800 flex gap-2">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={`Ask the ${selectedPersona} about ${placeName}...`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
