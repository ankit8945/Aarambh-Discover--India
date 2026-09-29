import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Users,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Clock,
  MapPin,
  ThumbsUp,
  Loader2,
  Check,
} from 'lucide-react';
import { fetchCommunityChat, sendCommunityChatMessage } from '../services/api';
import { CommunityChatMessage } from '../types';

interface CommunityTravelerChatProps {
  initialChannel?: string;
  cityName?: string;
}

export const CommunityTravelerChat: React.FC<CommunityTravelerChatProps> = ({
  initialChannel = 'all',
  cityName = 'Agra',
}) => {
  const [messages, setMessages] = useState<CommunityChatMessage[]>([]);
  const [channel, setChannel] = useState(initialChannel);
  const [loading, setLoading] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [userName, setUserName] = useState(() => localStorage.getItem('aarambh_traveler_name') || 'Yatri');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channels = [
    { id: 'all', label: 'All India Lounge 🇮🇳' },
    { id: 'agra', label: 'Agra & Taj Mahal 🏛️' },
    { id: 'varanasi', label: 'Varanasi Ghats 🪔' },
    { id: 'jaipur', label: 'Jaipur Pink City 🏰' },
    { id: 'delhi', label: 'Delhi Historic 🕌' },
  ];

  const loadMessages = async () => {
    try {
      setLoading(true);
      const list = await fetchCommunityChat(channel);
      setMessages(list);
    } catch (err) {
      console.error('Failed to load chat messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 10000); // 10s live polling
    return () => clearInterval(interval);
  }, [channel]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    try {
      setSending(true);
      localStorage.setItem('aarambh_traveler_name', userName.trim() || 'Yatri');
      const locationTag = channel === 'all' ? `${cityName} - Traveler Hub` : `${channel.toUpperCase()} - Heritage Hub`;
      await sendCommunityChatMessage({
        userName: userName.trim() || 'Yatri',
        userRole: 'Traveler',
        channel,
        locationTag,
        text: inputMessage.trim(),
        badge: inputMessage.toLowerCase().includes('fare') || inputMessage.toLowerCase().includes('auto') ? 'Transit Tip 🛺' : 'Traveler Update',
      });
      setInputMessage('');
      await loadMessages();
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputMessage(promptText);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md p-5 sm:p-7 space-y-5 flex flex-col h-[650px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center text-lg shadow-xs">
            💬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold font-serif text-stone-900">
                Community Traveler Live Chat
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-xs text-stone-500">
              Communicate live with fellow travelers, verified local guides & artisans
            </p>
          </div>
        </div>

        {/* Name input */}
        <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-200 shrink-0">
          <span className="text-stone-400">Posting as:</span>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-24 bg-transparent font-bold text-stone-800 focus:outline-none border-b border-transparent focus:border-amber-500 text-xs"
          />
        </div>
      </div>

      {/* Channel Switcher */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        {channels.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setChannel(ch.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              channel === ch.id
                ? 'bg-stone-900 text-amber-300 shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            {ch.label}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 scrollbar-thin">
        {loading && messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span className="text-xs">Loading live community stream...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-1">
            <MessageSquare className="w-8 h-8 text-stone-300" />
            <p className="text-xs">No messages yet in this lounge. Be the first to say Namaste!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3.5 rounded-2xl border transition-all space-y-1.5 ${
                msg.isImportantAlert
                  ? 'bg-amber-50/70 border-amber-300/80 shadow-2xs'
                  : 'bg-stone-50/60 border-stone-200/80 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white border border-stone-300 flex items-center justify-center text-sm shadow-2xs">
                    {msg.avatar || '🎒'}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-stone-900">{msg.userName}</span>
                    <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-medium bg-stone-200/80 text-stone-700">
                      {msg.userRole}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {msg.badge && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20">
                      {msg.badge}
                    </span>
                  )}
                  <span className="text-[10px] text-stone-400">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Text */}
              <p className="text-xs text-stone-800 leading-relaxed font-normal pl-9">
                {msg.text}
              </p>

              {/* Location Tag */}
              <div className="text-[10px] text-stone-400 pl-9 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400" />
                <span>{msg.locationTag}</span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="pt-2 border-t border-stone-100 flex gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        {[
          '🛺 Auto fare from station is ₹100-₹120',
          '👥 Is the queue moving fast right now?',
          '🍛 Best Bedai or Kachori breakfast nearby?',
          '⚠️ Beware of touts outside the main gate',
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleQuickPrompt(prompt)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 shrink-0 transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="flex gap-2 shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Share tip, ask question or report fare in ${channel === 'all' ? 'All India' : channel}...`}
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-amber-500 bg-stone-50/50"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || sending}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
