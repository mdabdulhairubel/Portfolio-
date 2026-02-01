
import React, { useState } from 'react';
import { Send, Mail, Phone, MapPin, CheckCircle2, Loader2, MessageSquare } from 'lucide-react';
import { supabase } from '../supabase';
import { SOCIAL_LINKS } from '../constants';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('contacts').insert([formData]);

    if (!error) {
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    }
    setLoading(false);
  };

  return (
    <div className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 opacity-0 animate-fade-up">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Let's Create Magic</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">Have a project in mind? Reach out and let's discuss how we can bring your vision to life.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="opacity-0 animate-fade-up delay-200">
            <h2 className="text-3xl font-bold mb-8">Contact Information</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Mail size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Email Me</h4>
                  <p className="text-gray-400 font-medium">mdabdulhai2506@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MessageSquare size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">WhatsApp</h4>
                  <p className="text-gray-400 font-medium">+880 1779 672765</p>
                </div>
              </div>
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Location</h4>
                  <p className="text-gray-400 font-medium">Dhaka, Bangladesh (Available Worldwide)</p>
                </div>
              </div>
            </div>

            <div className="mt-16">
              <h3 className="text-xl font-bold mb-6">Follow My Journey</h3>
              <div className="flex gap-4">
                {SOCIAL_LINKS.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    className="w-12 h-12 bg-gray-900 border border-gray-800 text-gray-400 flex items-center justify-center rounded-xl hover:text-primary hover:border-primary transition-all shadow-lg"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-gray-900 border border-gray-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-primary/5 opacity-0 animate-fade-up delay-400">
            {success ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-fade-in">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Message Sent!</h3>
                <p className="text-gray-400">Thank you for reaching out. I'll get back to you as soon as possible.</p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-8 text-primary font-bold hover:underline transition-all"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-400 px-1">Name</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all outline-none"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-400 px-1">Email</label>
                    <input
                      required
                      type="email"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all outline-none"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-400 px-1">Message</label>
                  <textarea
                    required
                    rows={6}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all resize-none outline-none"
                    placeholder="Tell me about your project..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-4 bg-primary hover:bg-primary-hover text-gray-950 font-bold rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-primary/20 hover:scale-[1.02]"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
