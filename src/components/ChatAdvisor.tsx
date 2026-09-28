import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, BookOpen } from 'lucide-react';

interface ChatAdvisorProps {
  onSelectCourse?: (courseId: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export const ChatAdvisor: React.FC<ChatAdvisorProps> = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Namaste! I am the Kaushal Karmayogi AI Course Advisor for MoSPI. Ask me anything like:\n\n• "Which course should I take for Data Visualization dashboards?"\n• "I am a Field Investigator; how do I improve in Sampling Design?"\n• "Are there beginner courses in Hindi for Data Cleaning?"',
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText }),
      });
      const data = await res.json();

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'I could not find exact course matches for that specific query.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered a temporary connection issue. Please explore the Course Catalog tab for all 24 official courses.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-300 shadow-[0_2px_8px_rgba(0,0,0,0.06)] max-w-3xl mx-auto flex flex-col h-[600px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              AI Course Advisor (Grounded in MoSPI Catalog)
            </h2>
            <p className="text-[11px] text-slate-500">
              Retrieval-grounded recommendations matching your Cadre and skill gaps (PRD §4.7 F-60)
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                m.sender === 'user'
                  ? 'bg-[#0b2545] text-white rounded-tr-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
              }`}
            >
              {m.text}
              <div
                className={`text-[10px] mt-1.5 text-right ${
                  m.sender === 'user' ? 'text-slate-300' : 'text-slate-400'
                }`}
              >
                {m.time}
              </div>
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-500 italic">
              Searching MoSPI course catalog & grounding response...
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
        <span className="text-slate-400 shrink-0 font-medium">Try:</span>
        <button
          onClick={() => handleQuickPrompt('Which course should I take for data visualization?')}
          className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 whitespace-nowrap cursor-pointer"
        >
          Courses for Data Visualization?
        </button>
        <button
          onClick={() => handleQuickPrompt('Recommend beginner courses available in Hindi')}
          className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 whitespace-nowrap cursor-pointer"
        >
          Beginner courses in Hindi?
        </button>
        <button
          onClick={() => handleQuickPrompt('I have a gap in Sampling Design (SD), what should I study?')}
          className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 whitespace-nowrap cursor-pointer"
        >
          Sampling Design gap?
        </button>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask about courses, competencies, or role skill recommendations..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className={`p-2 rounded-lg text-white transition-colors cursor-pointer ${
            input.trim() && !loading
              ? 'bg-[#0b2545] hover:bg-[#13315c]'
              : 'bg-slate-300 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
