import React, { useState, useEffect } from 'react';
import { 
  Settings, Briefcase, LayoutGrid, FileText, Image as ImageIcon, 
  MessageSquare, Plus, Trash2, Edit2, LogOut, Save, Loader2, Upload, 
  Youtube, Sparkles, Check, X, Star, Globe, User, Quote, DollarSign
} from 'lucide-react';
import { supabase, uploadFile } from '../supabase.ts';
import { Service, Project, SiteConfig, Testimonial, BrandLogo, ContactSubmission, PricingPlan } from '../types.ts';

const Admin: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('config');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>({
    config: {},
    services: [],
    pricing: [],
    projects: [],
    testimonials: [],
    logos: [],
    inquiries: []
  });
  
  const [editItem, setEditItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setAuthLoading(false);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert('Login failed: ' + error.message);
    else setUser(data.user);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [config, srv, price, proj, test, log, inq] = await Promise.all([
        supabase.from('site_config').select('*').limit(1).single(),
        supabase.from('services').select('*').order('created_at', { ascending: true }),
        supabase.from('pricing_plans').select('*').order('created_at', { ascending: true }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
        supabase.from('brand_logos').select('*').order('created_at', { ascending: false }),
        supabase.from('contacts').select('*').order('created_at', { ascending: false })
      ]);
      setData({
        config: config.data || {},
        services: srv.data || [],
        pricing: price.data || [],
        projects: proj.data || [],
        testimonials: test.data || [],
        logos: log.data || [],
        inquiries: inq.data || []
      });
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const saveConfig = async (formData: any) => {
    setSaving(true);
    const { error } = await supabase.from('site_config').upsert({ ...formData, updated_at: new Date().toISOString() });
    if (error) alert(error.message);
    else {
      alert('Settings saved!');
      fetchData();
    }
    setSaving(false);
  };

  const deleteItem = async (table: string, id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    const tableMap: any = { pricing: 'pricing_plans', logos: 'brand_logos' };
    const actualTable = tableMap[table] || table;
    const { error } = await supabase.from(actualTable).delete().eq('id', id);
    if (error) alert(error.message);
    else fetchData();
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const tableMap: any = { 
      services: 'services', 
      pricing: 'pricing_plans', 
      projects: 'projects', 
      testimonials: 'testimonials', 
      logos: 'brand_logos' 
    };
    const table = tableMap[activeTab];
    
    const preparedItem = { ...editItem };
    if ((activeTab === 'services' || activeTab === 'pricing') && typeof preparedItem.features === 'string') {
      preparedItem.features = preparedItem.features.split(',').map((f: string) => f.trim());
    }

    const { error } = await supabase.from(table).upsert(preparedItem);
    if (error) alert(error.message);
    else {
      setIsModalOpen(false);
      setEditItem(null);
      fetchData();
    }
    setSaving(false);
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-950"><Loader2 className="animate-spin text-primary" size={48} /></div>;

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-gray-900 p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl">
        <h2 className="text-3xl font-bold text-primary mb-8 text-center">Master Control</h2>
        <div className="space-y-6">
          <input type="email" required placeholder="Email" className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" required placeholder="Password" className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-gray-950 font-black rounded-2xl hover:bg-primary-hover shadow-lg">Login</button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col h-screen sticky top-0">
        <h2 className="text-xl font-bold mb-10 text-primary px-3 tracking-tighter uppercase italic">Visualizer HQ</h2>
        <nav className="flex-grow space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setEditItem(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${
                activeTab === tab.id ? 'bg-primary text-gray-950' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-10 flex items-center gap-3 px-4 py-3.5 text-red-400 hover:bg-red-400/10 rounded-xl font-bold transition-all"><LogOut size={18} /> Exit System</button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 md:p-12 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="flex justify-between items-center bg-gray-900/40 p-6 rounded-3xl border border-gray-800 backdrop-blur-md sticky top-0 z-20">
            <h3 className="text-2xl font-black text-white flex items-center gap-3 capitalize tracking-tighter">
              {tabs.find(t => t.id === activeTab)?.icon} {activeTab.replace('_', ' ')}
            </h3>
            {activeTab !== 'config' && activeTab !== 'inquiries' && (
              <button 
                onClick={() => { setEditItem({ features: [] }); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-gray-950 font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                <Plus size={18} /> Add New
              </button>
            )}
          </div>

          {activeTab === 'config' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-6">
                <div className="p-8 bg-gray-900/50 rounded-3xl border border-gray-800">
                  <h4 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-6">Hero Branding</h4>
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Portfolio Name</label>
                      <input className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3.5 text-white outline-none focus:border-primary transition-all" value={data.config.hero_title || ''} onChange={(e) => setData({ ...data, config: { ...data.config, hero_title: e.target.value } })} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Short Description</label>
                      <textarea rows={3} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3.5 text-white outline-none focus:border-primary transition-all resize-none" value={data.config.hero_description || ''} onChange={(e) => setData({ ...data, config: { ...data.config, hero_description: e.target.value } })} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'config' && activeTab !== 'inquiries' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
              {data[activeTab]?.map((item: any) => (
                <div key={item.id} className="group bg-gray-900/50 border border-gray-800 p-6 rounded-3xl hover:border-primary transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white line-clamp-1">{item.title || item.name}</h4>
                    {item.price && <span className="text-primary font-black text-xs">{item.price}</span>}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">{item.description || item.feedback || item.role}</p>
                  <div className="flex gap-2 pt-4 border-t border-gray-800">
                    <button onClick={() => { setEditItem(item); setIsModalOpen(true); }} className="flex-grow py-2 bg-gray-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-700 transition-all"><Edit2 size={14} /> Edit</button>
                    <button onClick={() => deleteItem(activeTab, item.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-950/90 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-[3rem] p-10 relative overflow-y-auto max-h-[90vh] custom-scrollbar">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-all"><X size={24} /></button>
            <h3 className="text-2xl font-black text-primary mb-10 flex items-center gap-3 capitalize">
              {activeTab} Editor
            </h3>
            
            <form onSubmit={handleItemSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Title / Name</label>
                  <input required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3 text-white outline-none focus:border-primary" value={editItem.title || editItem.name || ''} onChange={(e) => setEditItem({ ...editItem, [activeTab === 'testimonials' || activeTab === 'logos' ? 'name' : 'title']: e.target.value })} />
                </div>
                {(activeTab === 'pricing' || activeTab === 'services') && (
                  <div>
                    <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Price Label</label>
                    <input required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3 text-white outline-none focus:border-primary" value={editItem.price || ''} onChange={(e) => setEditItem({ ...editItem, price: e.target.value })} placeholder="$500 or Free" />
                  </div>
                )}
              </div>

              {activeTab === 'pricing' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                    <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Button Text</label>
                    <input className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3 text-white outline-none focus:border-primary" value={editItem.button_text || ''} onChange={(e) => setEditItem({ ...editItem, button_text: e.target.value })} placeholder="Choose Plan" />
                  </div>
                  <div className="flex items-center gap-4 pt-8">
                    <input type="checkbox" id="is_popular" className="w-5 h-5 accent-primary" checked={editItem.is_popular || false} onChange={(e) => setEditItem({ ...editItem, is_popular: e.target.checked })} />
                    <label htmlFor="is_popular" className="text-sm font-bold text-white">Most Popular Plan?</label>
                  </div>
                </div>
              )}

              {(activeTab === 'services' || activeTab === 'pricing') && (
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Features (Comma separated)</label>
                  <input className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3 text-white outline-none focus:border-primary" value={Array.isArray(editItem.features) ? editItem.features.join(', ') : editItem.features || ''} onChange={(e) => setEditItem({ ...editItem, features: e.target.value })} placeholder="Feature 1, Feature 2" />
                </div>
              )}

              <div>
                <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Description</label>
                <textarea rows={4} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3 text-white outline-none focus:border-primary resize-none" value={editItem.description || editItem.feedback || ''} onChange={(e) => setEditItem({ ...editItem, [activeTab === 'testimonials' ? 'feedback' : 'description']: e.target.value })}></textarea>
              </div>

              <button disabled={saving} type="submit" className="w-full py-4 bg-primary text-gray-950 font-black rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20">
                {saving ? <Loader2 className="animate-spin" /> : <Save />} Save Plan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const tabs = [
  { id: 'config', label: 'Dashboard', icon: <Settings size={18} /> },
  { id: 'services', label: 'Services', icon: <Briefcase size={18} /> },
  { id: 'pricing', label: 'Pricing', icon: <DollarSign size={18} /> },
  { id: 'projects', label: 'Portfolio', icon: <LayoutGrid size={18} /> },
  { id: 'testimonials', label: 'Feedback', icon: <User size={18} /> },
  { id: 'logos', label: 'Clients', icon: <Globe size={18} /> },
  { id: 'inquiries', label: 'Leads', icon: <MessageSquare size={18} /> },
];

export default Admin;