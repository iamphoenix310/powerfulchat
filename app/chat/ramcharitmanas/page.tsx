'use client';

import { useState } from 'react';

export default function RamcharitmanasChatPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: { role: 'user' | 'bot'; text: string } = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ramcharitmanas-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await res.json();
      const botMsg: { role: 'user' | 'bot'; text: string } = { role: 'bot', text: data.response };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Error fetching response.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-center shadow-md">
        <h1 className="text-2xl font-bold text-white">श्री रामचरितमानस</h1>
        <p className="text-amber-100 text-sm">Ask your spiritual questions</p>
      </header>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 text-amber-800">
            <p className="italic">Namaste 🙏 Ask your first question about Ramcharitmanas</p>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                m.role === 'user' 
                  ? 'bg-orange-500 text-white rounded-tr-none' 
                  : 'bg-amber-100 text-amber-900 rounded-tl-none border border-amber-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-4 rounded-2xl bg-amber-100 text-amber-900 rounded-tl-none border border-amber-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-amber-600 rounded-full animate-pulse"></div>
                <div className="h-2 w-2 bg-amber-600 rounded-full animate-pulse delay-150"></div>
                <div className="h-2 w-2 bg-amber-600 rounded-full animate-pulse delay-300"></div>
                <span className="text-amber-600 ml-1">Contemplating wisdom...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-amber-200 bg-amber-50">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask Ramcharitmanas Ji..."
            className="flex-1 border border-amber-300 p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black"
          />
          <button 
            onClick={sendMessage} 
            disabled={loading || !input.trim()}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}