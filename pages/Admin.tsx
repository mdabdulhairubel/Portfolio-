
import React, { useState, useEffect } from 'react';
import { 
  Settings, Briefcase, LayoutGrid, FileText, Image as ImageIcon, 
  MessageSquare, Users, Plus, Trash2, Edit2, LogOut, CheckCircle2, 
  X, Save, Loader2, Upload, Camera, Youtube, Mail, Lock, Database,
  Star, AlertCircle, Info, Copy, ShieldAlert, Check
} from 'lucide-react';
import { supabase, uploadFile } from '../supabase';
import { 
  Service, Project, Testimonial, BrandLogo, 
  BlogPost, ContactSubmission, SiteConfig 
} from '../types';

const Admin: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('config');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);
  const [showRlsFix, setShowRlsFix] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [bucketName, setBucketName] = useState(() => localStorage.getItem('sb_bucket_name') || 'media');
  const [configForm, setConfigForm] = useState<Partial<SiteConfig>>({});

  useEffect(() => {
    localStorage.setItem('sb_bucket_name', bucketName);
  }, [bucketName]);

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
    if (error) {
      alert('Login failed: ' + error.message);
    } else {
      setUser(data.user);
    }
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
      const [
        { data: configData },
        { data: services },
        { data: projects },
        { data: blog },
        { data: contacts },
        { data: logos }
      ] = await Promise.all([
        supabase.from('site_config').select('*').order('updated_at', { ascending: false }),
        supabase.from('services').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('blog_posts').select('*'),
        supabase.from('contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('brand_logos').select('*')
      ]);
      
      const config = configData && configData.length > 0 ? configData[0] : null;
      
      setData({ config, services, projects, blog, contacts, logos });
      if (config) {
        setConfigForm(config);
        setHasUnsavedChanges(false);
      } else {
        setConfigForm({
          hero_title: 'Md Abdul Hai',
          hero_subtitle: 'Creative Visualizer',
          bio: '',
        });
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleConfigChange = (updates: Partial<SiteConfig>) => {
    setConfigForm(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const handleConfigSave = async () => {
    setSaving(true);
    
    // Ensure we are updating the existing row by providing the ID
    const payload = { 
      ...configForm,
      updated_at: new Date().toISOString()
    };
    
    const { data: savedData, error } = await supabase
      .from('site_config')
      .upsert(payload)
      .select();

    if (error) {
      console.error("Save error:", error);
      alert('Error updating config: ' + error.message);
    } else {
      alert('Settings saved! Site content has been updated.');
      setHasUnsavedChanges(false);
      if (savedData && savedData[0]) {
        setConfigForm(savedData[0]);
      }
      fetchData();
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'hero_image_url' | 'profile_pic_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const publicUrl = await uploadFile(bucketName, file);
      handleConfigChange({ [field]: publicUrl });
      alert('Image uploaded to storage! Now click the green "Save All Changes" button.');
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-gray-900 p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl">
        <h2 className="text-3xl font-bold text-primary mb-8 text-center">Admin Login</h2>
        <div className="space-y-6">
          <input
            type="email" required placeholder="Email"
            className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password" required placeholder="Password"
            className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-gray-950 font-black rounded-2xl hover:bg-primary-hover disabled:opacity-50">
            {loading ? 'Entering...' : 'Unlock Dashboard'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-8 px-3 text-primary">Admin Panel</h2>
        <div className="flex-grow space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
                activeTab === tab.id ? 'bg-primary text-gray-950' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl font-bold">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="flex-grow p-8 overflow-y-auto max-h-screen custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'config' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center bg-gray-900/80 p-6 rounded-3xl border border-gray-800 sticky top-0 z-20 backdrop-blur-md">
                <h3 className="text-2xl font-bold flex items-center gap-3 text-white">
                  <Settings className="text-primary" /> Configuration
                </h3>
                <div className="flex items-center gap-4">
                  {hasUnsavedChanges && (
                    <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">Unsaved Changes</span>
                  )}
                  <button onClick={handleConfigSave} disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-primary text-gray-950 font-black rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20">
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save All Changes
                  </button>
                </div>
              </div>

              <div className="bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-800 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                  <div className="space-y-6">
                     <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Hero Image (Fallback)</label>
                      <div className="aspect-[4/5] bg-gray-950 rounded-3xl overflow-hidden border border-gray-800 relative group cursor-pointer">
                        {configForm.hero_image_url ? (
                          <img src={configForm.hero_image_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                            <ImageIcon size={64} />
                            <p className="font-bold mt-2">No Image</p>
                          </div>
                        )}
                        <label className="absolute inset-0 bg-gray-950/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer">
                          <Upload size={40} className="text-primary mb-2" />
                          <span className="font-bold text-white text-xs uppercase">Upload Hero</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero_image_url')} />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Hero Title</label>
                      <input className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white focus:border-primary outline-none" value={configForm.hero_title || ''} onChange={(e) => handleConfigChange({ hero_title: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Hero Subtitle</label>
                      <textarea rows={3} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white focus:border-primary outline-none resize-none" value={configForm.hero_subtitle || ''} onChange={(e) => handleConfigChange({ hero_subtitle: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">YouTube Video (Full Embed Code or URL)</label>
                      <textarea 
                        rows={4}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white focus:border-primary outline-none font-mono text-sm" 
                        value={configForm.hero_video_url || ''} 
                        onChange={(e) => handleConfigChange({ hero_video_url: e.target.value })} 
                        placeholder="Paste <iframe ...></iframe> or YouTube link here"
                      />
                      <p className="text-[10px] text-gray-500 mt-2 italic px-1">Tip: Paste the full embed code from YouTube for best results.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const tabs = [
  { id: 'config', label: 'Settings', icon: <Settings size={18} /> },
  { id: 'services', label: 'Services', icon: <Briefcase size={18} /> },
  { id: 'projects', label: 'Portfolio', icon: <LayoutGrid size={18} /> },
  { id: 'contacts', label: 'Inquiries', icon: <MessageSquare size={18} /> },
];

export default Admin;
