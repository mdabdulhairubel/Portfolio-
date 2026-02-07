import React, { useState, useEffect } from 'react';
import { 
  Settings, Briefcase, LayoutGrid, FileText, Image as ImageIcon, 
  MessageSquare, Plus, Trash2, Edit2, LogOut, Save, Loader2, Upload, 
  Youtube, Sparkles, Check, X, Star, Globe, User, Quote, DollarSign,
  MonitorPlay, Camera, CheckSquare, Link as IconLink, Images, Target,
  Smartphone, Mail, Info, BrainCircuit, ListChecks, Heart, Zap, Award, Activity, Shield
} from 'lucide-react';
import { supabase, uploadFile } from '../supabase.ts';

const Admin: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('config');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [data, setData] = useState<any>({
    config: {
      hero_title: '',
      hero_role: '',
      hero_subtitle: '',
      experience_years: 5,
      bio: '',
      whatsapp: '',
      email: '',
      chatbot_knowledge: '',
      hero_image_url: ''
    },
    services: [],
    pricing: [],
    projects: [],
    testimonials: [],
    logos: [],
    inquiries: [],
    highlights: []
  });
  
  const [editItem, setEditItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

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
      const [config, srv, price, proj, test, log, inq, high] = await Promise.all([
        supabase.from('site_config').select('*').limit(1).maybeSingle(),
        supabase.from('services').select('*').order('created_at', { ascending: true }),
        supabase.from('pricing_plans').select('*').order('created_at', { ascending: true }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
        supabase.from('brand_logos').select('*').order('created_at', { ascending: false }),
        supabase.from('contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('site_highlights').select('*').order('order_index', { ascending: true })
      ]);
      
      setData({
        config: config.data || data.config,
        services: srv.data || [],
        pricing: price.data || [],
        projects: proj.data || [],
        testimonials: test.data || [],
        logos: log.data || [],
        inquiries: inq.data || [],
        highlights: high.data || []
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

  const saveConfig = async () => {
    setSaving(true);
    const payload = { 
      ...data.config,
      id: '00000000-0000-0000-0000-000000000000',
      experience_years: parseInt(String(data.config.experience_years || 0)),
      updated_at: new Date().toISOString() 
    };
    
    const { error } = await supabase.from('site_config').upsert(payload);
    if (error) {
      alert('Error saving config: ' + error.message);
    } else {
      alert('Dashboard updated!');
      fetchData();
    }
    setSaving(false);
  };

  const deleteItem = async (table: string, id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    const tableMap: any = { 
      pricing: 'pricing_plans', 
      logos: 'brand_logos',
      highlights: 'site_highlights'
    };
    const actualTable = tableMap[table] || table;
    const { error } = await supabase.from(actualTable).delete().eq('id', id);
    if (error) alert(error.message);
    else fetchData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(field);
    try {
      const publicUrl = await uploadFile('media', file);
      if (activeTab === 'config') {
        setData({ ...data, config: { ...data.config, [field]: publicUrl } });
      } else {
        setEditItem({ ...editItem, [field]: publicUrl });
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const tableMap: any = { 
      services: 'services', 
      pricing: 'pricing_plans', 
      projects: 'projects', 
      testimonials: 'testimonials', 
      logos: 'brand_logos',
      highlights: 'site_highlights'
    };
    const table = tableMap[activeTab];
    
    const preparedItem = { ...editItem };
    
    // Handle array conversion for services/pricing features
    if ((activeTab === 'services' || activeTab === 'pricing') && typeof preparedItem.features === 'string') {
      preparedItem.features = preparedItem.features.split(',').map((f: string) => f.trim()).filter((f: string) => f !== '');
    }

    const { error } = await supabase.from(table).upsert(preparedItem);
    if (error) {
      alert('Submission Error: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditItem(null);
      fetchData();
    }
    setSaving(false);
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-950"><Loader2 className="animate-spin text-primary" size={48} /></div>;

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-gray-900 p-10 rounded-xl border border-gray-800 shadow-2xl">
        <h2 className="text-3xl font-bold text-primary mb-8 text-center tracking-tighter uppercase italic">Master Control</h2>
        <div className="space-y-6">
          <input type="email" required placeholder="Email" className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" required placeholder="Password" className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-gray-950 font-black rounded-2xl hover:bg-primary-hover shadow-lg transition-all">Login</button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col h-screen sticky top-0 z-40">
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
        <button onClick={handleLogout} className="mt-10 flex items-center gap-3 px-4 py-3.5 text-red-400 hover:bg-red-400/10 rounded-xl font-bold transition-all"><LogOut size={18} /> Logout</button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 md:p-12 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="flex justify-between items-center bg-gray-900/40 p-6 rounded-xl border border-gray-800 backdrop-blur-md sticky top-0 z-30">
            <h3 className="text-2xl font-black text-white flex items-center gap-3 capitalize tracking-tighter">
               {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            {activeTab !== 'config' && activeTab !== 'inquiries' && (
              <button 
                onClick={() => { 
                  let defaultItem: any = { features: [] };
                  if (activeTab === 'projects') defaultItem = { category: 'Motion Graphics', type: 'image', is_featured: false, title: '', media_url: '', thumbnail_url: '', media_gallery: [] };
                  else if (activeTab === 'highlights') defaultItem = { title: '', description: '', icon_name: 'Zap', order_index: data.highlights.length + 1 };
                  else if (activeTab === 'services' || activeTab === 'pricing') defaultItem = { title: '', price: '', description: '', features: [] };
                  setEditItem(defaultItem); 
                  setIsModalOpen(true); 
                }}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-gray-950 font-black rounded-xl hover:scale-105 transition-all shadow-lg"
              >
                <Plus size={18} /> Add New
              </button>
            )}
            {activeTab === 'config' && (
               <button onClick={saveConfig} disabled={saving} className="px-8 py-3 bg-primary text-gray-950 font-black rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save All Changes
              </button>
            )}
          </div>

          {activeTab === 'config' && (
            <div className="space-y-10">
              <div className="bg-gray-900/50 p-8 md:p-10 rounded-xl border border-gray-800 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Display Name</label>
                      <input className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3.5 text-white outline-none focus:border-primary transition-all" value={data.config.hero_title || ''} onChange={(e) => setData({ ...data, config: { ...data.config, hero_title: e.target.value } })} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Role</label>
                      <input className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3.5 text-white outline-none focus:border-primary transition-all" value={data.config.hero_role || ''} onChange={(e) => setData({ ...data, config: { ...data.config, hero_role: e.target.value } })} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Hero Intro</label>
                      <textarea rows={3} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3 text-white outline-none focus:border-primary transition-all resize-none" value={data.config.hero_subtitle || ''} onChange={(e) => setData({ ...data, config: { ...data.config, hero_subtitle: e.target.value } })} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Hero Image</label>
                    <div className="aspect-[4/5] bg-gray-950 rounded-xl overflow-hidden border border-gray-800 relative group cursor-pointer max-w-[280px]">
                      {data.config.hero_image_url ? <img src={data.config.hero_image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center"><ImageIcon size={48} /></div>}
                      <label className="absolute inset-0 bg-primary/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer">
                         {uploadingField === 'hero_image_url' ? <Loader2 className="animate-spin text-gray-950" /> : <Upload className="text-gray-950" size={32} />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'hero_image_url')} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900/50 p-8 md:p-10 rounded-xl border border-gray-800 space-y-6">
                <div className="flex items-center gap-3">
                   <BrainCircuit size={20} className="text-primary" />
                   <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">AI Knowledge</h4>
                </div>
                <textarea rows={6} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-6 py-5 text-gray-200 outline-none focus:border-primary transition-all resize-none font-mono text-sm" value={data.config.chatbot_knowledge || ''} onChange={(e) => setData({ ...data, config: { ...data.config, chatbot_knowledge: e.target.value } })} placeholder="Feed instructions to the AI here..." />
              </div>
            </div>
          )}

          {activeTab !== 'config' && activeTab !== 'inquiries' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data[activeTab]?.map((item: any) => (
                <div key={item.id} className="group bg-gray-900/50 border border-gray-800 p-6 rounded-xl hover:border-primary transition-all">
                  <h4 className="font-bold text-white mb-2">{item.title || item.name}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">{item.description || item.feedback || item.role}</p>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditItem(item); setIsModalOpen(true); }} className="flex-grow py-2 bg-gray-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-700 transition-all"><Edit2 size={12} /> Edit</button>
                    <button onClick={() => deleteItem(activeTab, item.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              {data.inquiries.map((inq: any) => (
                <div key={inq.id} className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <h4 className="font-bold text-white">{inq.name} <span className="text-xs text-primary ml-2">{inq.email}</span></h4>
                  <p className="text-sm text-gray-400 mt-2">{inq.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Item Editor Modal */}
      {isModalOpen && editItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/90 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-xl p-10 relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white"><X size={24} /></button>
            <h3 className="text-2xl font-black text-primary mb-8 tracking-tighter uppercase italic">{activeTab} Editor</h3>
            <form onSubmit={handleItemSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-bold uppercase block px-1">Title / Name</label>
                <input required className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-primary" value={editItem.title || editItem.name || ''} onChange={(e) => setEditItem({ ...editItem, [activeTab === 'testimonials' ? 'name' : 'title']: e.target.value })} />
              </div>

              {(activeTab === 'services' || activeTab === 'pricing') && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold uppercase block px-1">Feature Points (Comma separated)</label>
                  <textarea rows={3} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-primary resize-none" value={Array.isArray(editItem.features) ? editItem.features.join(', ') : (editItem.features || '')} onChange={(e) => setEditItem({ ...editItem, features: e.target.value })} placeholder="Point 1, Point 2, Point 3, Point 4..." />
                </div>
              )}

              {activeTab !== 'logos' && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold uppercase block px-1">Description / Feedback</label>
                  <textarea rows={4} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-primary resize-none" value={editItem.description || editItem.feedback || ''} onChange={(e) => setEditItem({ ...editItem, [activeTab === 'testimonials' ? 'feedback' : 'description']: e.target.value })} />
                </div>
              )}

              <button disabled={saving} type="submit" className="w-full py-4 bg-primary text-gray-950 font-black rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" /> : <Save />} Save Changes
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
  { id: 'highlights', label: 'Why Me', icon: <Sparkles size={18} /> },
  { id: 'services', label: 'Services', icon: <Briefcase size={18} /> },
  { id: 'pricing', label: 'Pricing', icon: <DollarSign size={18} /> },
  { id: 'projects', label: 'Portfolio', icon: <LayoutGrid size={18} /> },
  { id: 'testimonials', label: 'Feedback', icon: <User size={18} /> },
  { id: 'logos', label: 'Clients', icon: <Globe size={18} /> },
  { id: 'inquiries', label: 'Leads', icon: <MessageSquare size={18} /> },
];

export default Admin;