
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { chatWithGemini } from '../geminiService';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    {role: 'bot', text: "Meow! I'm Hai's creative assistant. How can I help you today?"}
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
    setIsLoading(true);

    const botResponse = await chatWithGemini(userMsg);
    setMessages(prev => [...prev, {role: 'bot', text: botResponse || "Sorry, I'm feeling a bit sleepy."}]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-[320px] sm:w-[380px] h-[500px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="bg-primary p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-950/20 rounded-full flex items-center justify-center">
                <Bot className="text-gray-950" size={24} />
              </div>
              <div>
                <h3 className="text-gray-950 font-bold text-sm">Visualizer AI</h3>
                <span className="text-gray-950/70 text-xs flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-950 animate-pulse"></div> Online
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-950 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-grow p-4 overflow-y-auto space-y-4 custom-scrollbar">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  m.role === 'user' 
                    ? 'bg-primary text-gray-950 font-medium rounded-br-none' 
                    : 'bg-gray-800 text-gray-200 rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-200 rounded-2xl rounded-bl-none px-4 py-2 text-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-primary" /> Meow is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-800 bg-gray-900/50">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-grow bg-gray-800 border border-gray-700 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-primary hover:bg-primary-hover disabled:opacity-50 text-gray-950 rounded-full flex items-center justify-center transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-primary hover:bg-primary-hover text-gray-950 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-110"
        >
          <MessageSquare size={28} />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
