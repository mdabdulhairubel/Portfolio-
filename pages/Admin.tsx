import React, { useState, useEffect } from 'react';
import { 
  Settings, Briefcase, LayoutGrid, FileText, Image as ImageIcon, 
  MessageSquare, Plus, Trash2, Edit2, LogOut, Save, Loader2, Upload, 
  Youtube, Sparkles, Check, X, Star, Globe, User, Quote, DollarSign,
  MonitorPlay, Camera, CheckSquare, Link as IconLink, Images, Target,
  Smartphone, Mail, Info, BrainCircuit, ListChecks
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
    config: {
      hero_title: '',
      hero_role: '',
      hero_subtitle: '',
      experience_years: 0,
      bio: '',
      whatsapp: '',
      email: '',
      chatbot_knowledge: ''
    },
    services: [],
    pricing: [],
    projects: [],
    testimonials: [],
    logos: [],
    inquiries: []
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
      const [config, srv, price, proj, test, log, inq] = await Promise.all([
        supabase.from('site_config').select('*').limit(1).maybeSingle(),
        supabase.from('services').select('*').order('created_at', { ascending: true }),
        supabase.from('pricing_plans').select('*').order('created_at', { ascending: true }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
        supabase.from('brand_logos').select('*').order('created_at', { ascending: false }),
        supabase.from('contacts').select('*').order('created_at', { ascending: false })
      ]);
      
      setData({
        config: config.data || { experience_years: 0 },
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
    const payload = { 
      ...formData, 
      experience_years: parseInt(String(formData.experience_years || 0)),
      updated_at: new Date().toISOString() 
    };
    
    const { error } = await supabase.from('site_config').upsert(payload);
    if (error) {
      console.error("Save config error:", error);
      alert('Error: ' + error.message);
    } else {
      alert('Settings saved successfully!');
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

  const handleMultiFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingField('gallery');
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile('media', files[i]);
        newUrls.push(url);
      }
      const existingGallery = editItem.media_gallery || [];
      setEditItem({ ...editItem, media_gallery: [...existingGallery, ...newUrls] });
    } catch (err: any) {
      alert("Gallery upload failed: " + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  const removeFromGallery = (index: number) => {
    const newGallery = [...(editItem.media_gallery || [])];
    newGallery.splice(index, 1);
    setEditItem({ ...editItem, media_gallery: newGallery });
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
    
    if (activeTab === 'logos' && !preparedItem.name) {
      preparedItem.name = 'Client Logo';
    }

    if (activeTab === 'testimonials' && preparedItem.rating !== undefined) {
      preparedItem.rating = parseInt(String(preparedItem.rating));
    }

    // Convert comma-separated string back to array if user edited it as text
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
        <button onClick={handleLogout} className="mt-10 flex items-center gap-3 px-4 py-3.5 text-red-400 hover:bg-red-400/10 rounded-xl font-bold transition-all"><LogOut size={18} /> Exit System</button>
      </aside>

      <main className="flex-grow p-8 md:p-12 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="flex justify-between items-center bg-gray-900/40 p-6 rounded-3xl border border-gray-800 backdrop-blur-md sticky top-0 z-30">
            <h3 className="text-2xl font-black text-white flex items-center gap-3 capitalize tracking-tighter">
              {tabs.find(t => t.id === activeTab)?.icon} {activeTab.replace('_', ' ')}
            </h3>
            {activeTab !== 'config' && activeTab !== 'inquiries' && (
              <button 
                onClick={() => { 
                  let defaultItem: any = {};
                  if (activeTab === 'projects') {
                    defaultItem = { category: 'Motion Graphics', type: 'image', is_featured: false, title: '', media_url: '', thumbnail_url: '', media_gallery: [] };
                  } else if (activeTab === 'logos') {
                    defaultItem = { image_url: '', name: 'Client Logo' };
                  } else if (activeTab === 'testimonials') {
                    defaultItem = { name: '', role: 'Client', rating: 5, feedback: '', image_url: '' };
                  } else if (activeTab === 'services' || activeTab === 'pricing') {
                    defaultItem = { title: '', price: '', description: '', features: [] };
                  }
                  setEditItem(defaultItem); 
                  setIsModalOpen(true); 
                }}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-gray-950 font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                <Plus size={18} /> Add New
              </button>
            )}
            {activeTab === 'config' && (
               <button onClick={() => saveConfig(data.config)} disabled={saving} className="px-8 py-3 bg-primary text-gray-950 font-black rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save All Changes
              </button>
            )}
          </div>

          {activeTab === 'config' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              
              {/* Hero & Branding Section */}
              <div className="bg-gray-900/50 p-8 md:p-10 rounded-[2.5rem] border border-gray-800 space-y-10">
                <div className="flex items-center gap-3 border-b border-gray-800 pb-6">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg"><MonitorPlay size={20} /></div>
                  <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Hero & Branding</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Display Name</label>
                      <input className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3.5 text-white outline-none focus:border-primary transition-all" value={data.config.hero_title || ''} onChange={(e) => setData({ ...data, config: { ...data.config, hero_title: e.target.value } })} placeholder="e.g. Md Abdul Hai" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Role / Professional Tagline</label>
                      <input className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3.5 text-white outline-none focus:border-primary transition-all" value={data.config.hero_role || ''} onChange={(e) => setData({ ...data, config: { ...data.config, hero_role: e.target.value } })} placeholder="e.g. Senior Visualizer & Motion Storyteller" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Hero Description Paragraph</label>
                      <textarea rows={3} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3 text-white outline-none focus:border-primary transition-all resize-none" value={data.config.hero_subtitle || ''} onChange={(e) => setData({ ...data, config: { ...data.config, hero_subtitle: e.target.value } })} placeholder="Cinematic experience description..." />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Hero Video / Showreel (YouTube Link)</label>
                      <div className="relative">
                        <input className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-12 pr-5 py-3.5 text-white outline-none focus:border-primary transition-all" value={data.config.hero_video_url || ''} onChange={(e) => setData({ ...data, config: { ...data.config, hero_video_url: e.target.value } })} placeholder="https://youtube.com/watch?v=..." />
                        <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={20} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Main Portfolio Portrait</label>
                    <div className="aspect-[4/5] bg-gray-950 rounded-[2.5rem] overflow-hidden border border-gray-800 relative group cursor-pointer max-w-[300px] mx-auto">
                      {data.config.hero_image_url ? (
                        <img src={data.config.hero_image_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                          <ImageIcon size={48} />
                          <span className="text-[10px] font-bold uppercase tracking-widest mt-2">No Photo</span>
                        </div>
                      )}
                      <label className="absolute inset-0 bg-primary/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer">
                         {uploadingField === 'hero_image_url' ? <Loader2 className="animate-spin text-gray-950" /> : <Upload className="text-gray-950" size={32} />}
                        <span className="text-gray-950 font-black text-xs uppercase mt-2">Change Image</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'hero_image_url')} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Profile Section */}
              <div className="bg-gray-900/50 p-8 md:p-10 rounded-[2.5rem] border border-gray-800 space-y-8">
                <div className="flex items-center gap-3 border-b border-gray-800 pb-6">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg"><User size={20} /></div>
                  <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">About & Experience</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="md:col-span-2">
                      <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Professional Bio</label>
                      <textarea rows={6} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-primary transition-all resize-none" value={data.config.bio || ''} onChange={(e) => setData({ ...data, config: { ...data.config, bio: e.target.value } })} placeholder="Describe your creative journey..." />
                   </div>
                   <div className="space-y-6">
                      <div>
                        <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Years of Experience</label>
                        <input 
                          type="number" 
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3.5 text-white outline-none focus:border-primary transition-all" 
                          value={data.config.experience_years ?? 0} 
                          onChange={(e) => setData({ ...data, config: { ...data.config, experience_years: e.target.value === '' ? '' : parseInt(e.target.value) } })} 
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-bold uppercase block mb-2">About Section Video Link</label>
                        <input className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-3.5 text-white outline-none focus:border-primary transition-all" value={data.config.about_video_url || ''} onChange={(e) => setData({ ...data, config: { ...data.config, about_video_url: e.target.value } })} placeholder="YouTube/Vimeo Intro Link" />
                      </div>
                   </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-900/50 p-8 md:p-10 rounded-[2.5rem] border border-gray-800 space-y-8">
                <div className="flex items-center gap-3 border-b border-gray-800 pb-6">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg"><Info size={20} /></div>
                  <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Direct Channels</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-xs text-gray-500 font-bold uppercase block mb-2">WhatsApp Number</label>
                    <div className="relative">
                       <input className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-12 pr-5 py-3.5 text-white outline-none focus:border-primary transition-all" value={data.config.whatsapp || ''} onChange={(e) => setData({ ...data, config: { ...data.config, whatsapp: e.target.value } })} placeholder="+8801..." />
                       <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Public Email</label>
                    <div className="relative">
                       <input className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-12 pr-5 py-3.5 text-white outline-none focus:border-primary transition-all" value={data.config.email || ''} onChange={(e) => setData({ ...data, config: { ...data.config, email: e.target.value } })} placeholder="hello@example.com" />
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Chatbot Knowledge Base */}
              <div className="bg-gradient-to-br from-gray-900/80 to-primary/5 p-8 md:p-10 rounded-[2.5rem] border border-primary/20 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg"><BrainCircuit size={20} /></div>
                  <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">AI Intelligence Settings</h4>
                </div>
                <div>
                   <label className="text-xs text-gray-400 font-bold uppercase block mb-3">Assistant Knowledge Base (Custom Grounding)</label>
                   <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Feed specific details to the Gemini assistant to make it smarter about your work.</p>
                   <textarea rows={8} className="w-full bg-gray-950/80 border border-gray-800 rounded-2xl px-6 py-5 text-gray-200 outline-none focus:border-primary transition-all resize-none font-mono text-sm" value={data.config.chatbot_knowledge || ''} onChange={(e) => setData({ ...data, config: { ...data.config, chatbot_knowledge: e.target.value } })} placeholder="Write instructions, project lists, and unique facts for the AI here..." />
                </div>
              </div>

            </div>
          )}

          {activeTab !== 'config' && activeTab !== 'inquiries' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
              {data[activeTab]?.map((item: any) => (
                <div key={item.id} className="group bg-gray-900/50 border border-gray-800 p-6 rounded-3xl hover:border-primary transition-all relative overflow-hidden">
                  {(item.thumbnail_url || item.image_url) && (
                    <div className={`w-full rounded-2xl overflow-hidden mb-4 border border-gray-800 bg-gray-950 ${activeTab === 'logos' ? 'aspect-video flex items-center justify-center p-4' : 'aspect-video'}`}>
                      <img src={item.thumbnail_url || item.image_url} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white line-clamp-1">{item.title || item.name}</h4>
                    {item.is_featured && <Star size={14} className="text-primary fill-primary" />}
                  </div>
                  {activeTab !== 'logos' && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">{item.category || item.description || item.feedback || item.role}</p>
                  )}
                  <div className={`flex gap-2 ${activeTab === 'logos' ? '' : 'pt-4 border-t border-gray-800'}`}>
                    <button onClick={() => { setEditItem(item); setIsModalOpen(true); }} className="flex-grow py-2.5 bg-gray-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-gray-700 transition-all uppercase tracking-widest"><Edit2 size={12} /> Edit</button>
                    <button onClick={() => deleteItem(activeTab, item.id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Editor */}
      {isModalOpen && editItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-[3rem] p-10 relative overflow-y-auto max-h-[95vh] custom-scrollbar shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-all"><X size={24} /></button>
            <h3 className="text-2xl font-black text-primary mb-10 flex items-center gap-3 capitalize tracking-tighter">
              {activeTab.replace('_', ' ')} Editor
            </h3>
            
            <form onSubmit={handleItemSubmit} className="space-y-8">
              {/* Testimonial Specific Header */}
              {activeTab === 'testimonials' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                   <div className="md:col-span-1 space-y-4">
                      <label className="text-xs text-gray-500 font-bold uppercase block px-1 text-center">Client Photo</label>
                      <div className="relative group aspect-square bg-gray-950 border-2 border-dashed border-gray-800 rounded-[2rem] flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary/50 max-w-[180px] mx-auto">
                        {editItem.image_url ? (
                          <>
                            <img src={editItem.image_url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gray-900/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3">
                               <Upload className="text-primary" size={24} />
                               <span className="text-[10px] font-black uppercase text-white">Change</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-gray-700">
                             <User size={32} />
                             <span className="text-[10px] font-black uppercase">Upload</span>
                          </div>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileUpload(e, 'image_url')} />
                        {uploadingField === 'image_url' && (
                          <div className="absolute inset-0 bg-gray-950/90 flex items-center justify-center z-10">
                             <Loader2 className="animate-spin text-primary" size={24} />
                          </div>
                        )}
                      </div>
                   </div>
                   <div className="md:col-span-2 space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500 font-bold uppercase block px-1">Client Name</label>
                        <input required className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary transition-all" value={editItem.name || ''} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} placeholder="e.g. Sarah Jenkins" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500 font-bold uppercase block px-1">Client Role / Company</label>
                        <input required className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary transition-all" value={editItem.role || ''} onChange={(e) => setEditItem({ ...editItem, role: e.target.value })} placeholder="e.g. Marketing Lead at Nike" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500 font-bold uppercase block px-1">Star Rating</label>
                        <div className="flex gap-4">
                           {[1, 2, 3, 4, 5].map(star => (
                             <button 
                               key={star} 
                               type="button" 
                               onClick={() => setEditItem({...editItem, rating: star})}
                               className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${editItem.rating >= star ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-950 border-gray-800 text-gray-700'}`}
                             >
                               <Star size={20} fill={editItem.rating >= star ? 'currentColor' : 'none'} />
                             </button>
                           ))}
                        </div>
                      </div>
                   </div>
                </div>
              )}

              {/* Price Field for Services & Pricing */}
              {(activeTab === 'services' || activeTab === 'pricing') && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold uppercase block px-1">Starting Price / Plan Amount</label>
                  <div className="relative">
                    <input required className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-12 pr-5 py-4 text-white outline-none focus:border-primary transition-all" value={editItem.price || ''} onChange={(e) => setEditItem({ ...editItem, price: e.target.value })} placeholder="e.g. $499 or Starting at $250" />
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={20} />
                  </div>
                </div>
              )}

              {/* Common Title/Name - HIDDEN FOR LOGOS & TESTIMONIALS */}
              {activeTab !== 'logos' && activeTab !== 'testimonials' && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold uppercase block px-1">Display Title / Name</label>
                  <input required className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary transition-all" value={editItem.title || editItem.name || ''} onChange={(e) => setEditItem({ ...editItem, [activeTab === 'testimonials' ? 'name' : 'title']: e.target.value })} />
                </div>
              )}

              {/* Feature Points Field - THE MISSING PART */}
              {(activeTab === 'services' || activeTab === 'pricing') && (
                <div className="space-y-4 p-6 bg-primary/5 border border-primary/10 rounded-[2rem]">
                  <div className="flex items-center gap-3">
                    <ListChecks size={20} className="text-primary" />
                    <label className="text-sm font-black text-white uppercase tracking-wider">Features / Highlights Checklist</label>
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Add the bullet points you want to see in the card. Separate each point with a comma.</p>
                  <textarea 
                    rows={3} 
                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary transition-all resize-none font-medium text-sm" 
                    value={Array.isArray(editItem.features) ? editItem.features.join(', ') : (editItem.features || '')} 
                    onChange={(e) => setEditItem({ ...editItem, features: e.target.value })} 
                    placeholder="e.g. Sound Design, VFX Compositing, Color Grading, 4K Export"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(Array.isArray(editItem.features) ? editItem.features : (editItem.features?.split(',') || [])).filter((f: string) => f.trim() !== '').map((feat: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold rounded-full flex items-center gap-2">
                        <Check size={10} /> {feat.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Logo Specific Editor */}
              {activeTab === 'logos' && (
                <div className="space-y-6">
                  <label className="text-xs text-gray-500 font-bold uppercase block px-1">Client Brand Logo</label>
                  <div className="relative group aspect-video bg-gray-950 border-2 border-dashed border-gray-800 rounded-[2rem] flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary/50">
                    {editItem.image_url ? (
                      <>
                        <img src={editItem.image_url} className="w-full h-full object-contain p-8" />
                        <div className="absolute inset-0 bg-gray-900/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3">
                           <Upload className="text-primary" size={32} />
                           <span className="text-xs font-black uppercase text-white">Replace Logo</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-gray-600 group-hover:text-primary transition-colors">
                         <ImageIcon size={48} />
                         <div className="text-center">
                            <p className="text-sm font-bold text-white mb-1">Upload Brand Logo</p>
                            <p className="text-[10px] uppercase tracking-widest">Supports PNG, SVG, WebP</p>
                         </div>
                      </div>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileUpload(e, 'image_url')} />
                    {uploadingField === 'image_url' && (
                      <div className="absolute inset-0 bg-gray-950/90 flex items-center justify-center z-10">
                         <Loader2 className="animate-spin text-primary" size={40} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Project Specific Fields */}
              {activeTab === 'projects' && (
                <div className="space-y-10">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 font-bold uppercase block px-1">Category</label>
                      <select className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary transition-all" value={editItem.category || 'Motion Graphics'} onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}>
                        <option value="Graphic Design">Graphic Design</option>
                        <option value="Motion Graphics">Motion Graphics</option>
                        <option value="Video Editing">Video Editing</option>
                        <option value="CGI Ads">CGI Ads</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 font-bold uppercase block px-1">Content Type</label>
                      <div className="flex gap-2">
                        {['image', 'video'].map(type => (
                          <button 
                            key={type} 
                            type="button" 
                            onClick={() => setEditItem({...editItem, type})}
                            className={`flex-1 py-4 rounded-2xl border font-bold capitalize transition-all ${editItem.type === type ? 'bg-primary border-primary text-gray-950' : 'bg-gray-950 border-gray-800 text-gray-400'}`}
                          >
                            {type === 'image' ? <Camera className="inline mr-2" size={16} /> : <MonitorPlay className="inline mr-2" size={16} />} {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs text-gray-500 font-bold uppercase block px-1">Main Media Content</label>
                    {editItem.type === 'image' ? (
                       <div className="relative group aspect-video bg-gray-950 border-2 border-dashed border-gray-800 rounded-[2rem] flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary/50">
                          {editItem.media_url ? (
                            <>
                              <img src={editItem.media_url} className="w-full h-full object-contain" />
                              <div className="absolute inset-0 bg-gray-900/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3">
                                 <Upload className="text-primary" size={32} />
                                 <span className="text-xs font-black uppercase text-white">Replace Image</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-4 text-gray-600 group-hover:text-primary transition-colors">
                               <Upload size={48} />
                               <div className="text-center">
                                  <p className="text-sm font-bold text-white mb-1">Upload Main Project Image</p>
                                  <p className="text-[10px] uppercase tracking-widest">Supports PNG, JPG, WebP</p>
                               </div>
                            </div>
                          )}
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileUpload(e, 'media_url')} />
                          {uploadingField === 'media_url' && (
                            <div className="absolute inset-0 bg-gray-950/90 flex items-center justify-center z-10">
                               <Loader2 className="animate-spin text-primary" size={40} />
                            </div>
                          )}
                       </div>
                    ) : (
                      <div className="relative">
                        <input required className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-12 pr-5 py-4 text-white outline-none focus:border-primary transition-all" value={editItem.media_url || ''} onChange={(e) => setEditItem({ ...editItem, media_url: e.target.value })} placeholder="Enter YouTube or Vimeo URL" />
                        <IconLink className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-6">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs text-gray-500 font-bold uppercase block flex items-center gap-2">
                        <Images size={14} className="text-primary" /> Project Gallery (Multiple Images)
                      </label>
                      <span className="text-[10px] text-gray-500 font-bold uppercase bg-gray-950 px-3 py-1 rounded-full border border-gray-800">
                        {editItem.media_gallery?.length || 0} Images
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {editItem.media_gallery?.map((url: string, index: number) => (
                        <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-800 group bg-gray-950">
                          <img src={url} className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => removeFromGallery(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      
                      <label className="relative aspect-square rounded-2xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-gray-500 hover:text-primary overflow-hidden">
                        {uploadingField === 'gallery' ? (
                          <Loader2 className="animate-spin" size={24} />
                        ) : (
                          <>
                            <Plus size={24} />
                            <span className="text-[10px] font-black uppercase">Add More</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          multiple 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleMultiFileUpload} 
                          disabled={uploadingField !== null}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-3">
                       <label className="text-xs text-gray-500 font-bold uppercase block px-1">Grid Thumbnail (16:9)</label>
                       <div className="relative aspect-video bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden group cursor-pointer">
                          {editItem.thumbnail_url ? (
                            <img src={editItem.thumbnail_url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                               <ImageIcon size={28} />
                               <span className="text-[10px] mt-2 font-black uppercase">No Thumbnail</span>
                            </div>
                          )}
                          <label className="absolute inset-0 bg-primary/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer">
                            {uploadingField === 'thumbnail_url' ? <Loader2 className="animate-spin text-gray-950" /> : <Upload className="text-gray-950" size={24} />}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnail_url')} />
                          </label>
                       </div>
                    </div>
                    <div className="flex flex-col justify-center space-y-6">
                       <div className="p-5 bg-gray-950 rounded-2xl border border-gray-800">
                          <label className="flex items-center gap-4 cursor-pointer group">
                             <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${editItem.is_featured ? 'bg-primary border-primary' : 'border-gray-700 bg-gray-900'}`}>
                                {editItem.is_featured && <Check size={16} strokeWidth={4} className="text-gray-950" />}
                             </div>
                             <input type="checkbox" className="hidden" checked={editItem.is_featured || false} onChange={(e) => setEditItem({...editItem, is_featured: e.target.checked})} />
                             <div className="flex flex-col">
                                <span className="text-sm font-black text-white group-hover:text-primary transition-colors">Featured Portfolio Work</span>
                                <span className="text-[10px] text-gray-500 uppercase">Displays on home page</span>
                             </div>
                          </label>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {/* General Description - HIDDEN FOR LOGOS */}
              {activeTab !== 'logos' && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-bold uppercase block px-1">
                    {activeTab === 'testimonials' ? 'Client Testimonial Message' : 'Project Story / Description'}
                  </label>
                  <textarea rows={6} className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary transition-all resize-none" value={editItem.description || editItem.feedback || ''} onChange={(e) => setEditItem({ ...editItem, [activeTab === 'testimonials' ? 'feedback' : 'description']: e.target.value })} placeholder={activeTab === 'testimonials' ? "What did the client say about your work?" : "What was the creative vision behind this?"}></textarea>
                </div>
              )}

              <button disabled={saving || uploadingField !== null} type="submit" className="w-full py-5 bg-primary text-gray-950 font-black rounded-2xl hover:bg-primary-hover transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 shadow-md text-lg uppercase tracking-widest disabled:opacity-50">
                {saving ? <Loader2 className="animate-spin" /> : <Save />} 
                {uploadingField ? 'Processing...' : (editItem.id ? 'Update Item' : 'Publish Item')}
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