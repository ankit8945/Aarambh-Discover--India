import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Send, Loader2, MessageSquare, Info } from 'lucide-react';

interface TempleChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  experienceTitle: string;
}

interface ChatMessage {
  text: string;
  isUser: boolean;
}

export const TempleChatModal: React.FC<TempleChatModalProps> = ({
  isOpen,
  onClose,
  experienceTitle,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { text: `Namaste! I am your AI Heritage Guide. How can I help you explore ${experienceTitle} today?`, isUser: false }
      ]);
    }
  }, [isOpen, experienceTitle, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ text: m.text, isUser: m.isUser }));
      const res = await fetch('/api/temple-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, templeContext: experienceTitle, history }),
      });
      const data = await res.json();

      if (data.text) {
        setMessages(prev => [...prev, { text: data.text, isUser: false }]);
      } else {
        setMessages(prev => [...prev, { text: 'I am sorry, I encountered an error.', isUser: false }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { text: 'Network error. Please try again later.', isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice dictation.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col h-[85vh] my-8 text-stone-100 overflow-hidden shrink-0">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heritage text-amber-100">AI Guide</h2>
              <p className="text-xs text-stone-400">Ask about {experienceTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-stone-900">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-sm flex gap-3">
            <Info className="w-5 h-5 shrink-0 text-amber-500" />
            <p>
              I can help you understand the history, architecture, and significance of this sacred place.
            </p>
          </div>

          <div className="space-y-4 mt-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.isUser ? 'bg-amber-600 text-stone-950 rounded-br-sm' : 'bg-stone-800 border border-stone-700 text-stone-200 rounded-bl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-stone-800 border border-stone-700 text-stone-400 rounded-bl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 shrink-0">
          <div className="flex items-center gap-2 bg-stone-900 border border-stone-700 rounded-full p-1.5 focus-within:border-amber-500 transition-colors">
            
            {/* Voice Dictation Toggle */}
            <button
              onClick={startVoiceDictation}
              disabled={isListening}
              className={`p-2.5 rounded-full transition-colors shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:text-amber-400 hover:bg-stone-800'}`}
              title="Dictate with voice"
            >
              <Mic className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Listening..." : "Ask your AI guide..."}
              className="flex-1 bg-transparent text-sm text-stone-100 placeholder-stone-500 focus:outline-none px-2 py-2"
            />
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
