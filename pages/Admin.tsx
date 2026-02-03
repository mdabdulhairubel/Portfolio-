
import React, { useState, useEffect } from 'react';
import { 
  Settings, Briefcase, LayoutGrid, FileText, Image as ImageIcon, 
  MessageSquare, Users, Plus, Trash2, Edit2, LogOut, CheckCircle2, 
  X, Save, Loader2, Upload, Camera, Youtube, Mail, Lock, Database,
  Star, AlertCircle, Info, Copy, ShieldAlert, Check, RefreshCcw, Sparkles
} from 'lucide-react';
import { supabase, uploadFile } from '../supabase.ts';
import { 
  Service, Project, Testimonial, BrandLogo, 
  BlogPost, ContactSubmission, SiteConfig 
} from '../types.ts';

const Admin: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('config');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [data, setData] = useState<any>(null);
  
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
  };

  const handleConfigSave = async () => {
    setSaving(true);
    const payload = { 
      ...configForm,
      updated_at: new Date().toISOString()
    };
    
    const { data: savedData, error } = await supabase
      .from('site_config')
      .upsert(payload)
      .select();

    if (error) {
      alert('Error updating config: ' + error.message);
    } else {
      alert('Settings saved!');
      if (savedData && savedData[0]) setConfigForm(savedData[0]);
      fetchData();
    }
    setSaving(false);
  };

  const seedDemoData = async () => {
    if (!confirm("This will add sample projects, services, and blog posts to your site. Continue?")) return;
    setSeeding(true);
    try {
      // 1. Seed Site Config (Upsert)
      await supabase.from('site_config').upsert({
        hero_title: "Crafting Visual Realities",
        hero_subtitle: "Md Abdul Hai — Senior Visualizer & Creative Artist. Transforming complex ideas into stunning motion and graphic experiences.",
        bio: "With over 5 years of industry experience, I specialize in high-end motion graphics, CGI commercials, and cinematic video editing. My goal is to bridge the gap between imagination and digital reality.",
        experience_years: 5,
        profile_pic_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
        hero_image_url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1200&auto=format&fit=crop",
        hero_video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        whatsapp: "8801779672765",
        email: "mdabdulhai2506@gmail.com",
        skills: [
          { name: "Motion Design", level: 95 },
          { name: "Video Editing", level: 90 },
          { name: "3D Animation", level: 85 },
          { name: "Brand Identity", level: 88 }
        ],
        experience_timeline: [
          { year: "2021 - Present", title: "Lead Visualizer", company: "Creative Flow Studio", description: "Spearheading global motion design campaigns for top-tier brands." },
          { year: "2018 - 2021", title: "Motion Designer", company: "Digital Dreamers", description: "Developed high-impact social media commercials and CGI assets." }
        ],
        chatbot_knowledge: "Md Abdul Hai is a professional designer. He loves cats and creative challenges."
      });

      // 2. Seed Services (If empty)
      const { data: existingServices } = await supabase.from('services').select('id').limit(1);
      if (!existingServices?.length) {
        await supabase.from('services').insert([
          { title: "CGI Commercials", description: "High-end 3D advertising pieces that bring products to life with cinematic realism.", price: "$499", features: ["3D Product Rendering", "Physics Simulation", "Photorealistic Lighting"] },
          { title: "Motion Graphics", description: "Dynamic visual storytelling for social media, broadcast, and corporate presentations.", price: "$299", features: ["Logo Animation", "Explainer Videos", "Lottie Animations"] },
          { title: "Cinematic Editing", description: "Professional color grading and narrative-driven video editing for commercials and shorts.", price: "$199", features: ["Advanced Color Grading", "Sound Design", "VFX Compositing"] }
        ]);
      }

      // 3. Seed Projects (If empty)
      const { data: existingProjects } = await supabase.from('projects').select('id').limit(1);
      if (!existingProjects?.length) {
        await supabase.from('projects').insert([
          { title: "Neon Cyberpunk Ad", category: "Motion Graphics", type: "video", media_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnail_url: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800", is_featured: true },
          { title: "Luxury Watch CGI", category: "CGI Ads", type: "video", media_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnail_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800", is_featured: true },
          { title: "Modern Brand Identity", category: "Graphic Design", type: "image", media_url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800", thumbnail_url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800", is_featured: false }
        ]);
      }

      // 4. Seed Blog
      const { data: existingBlog } = await supabase.from('blog_posts').select('id').limit(1);
      if (!existingBlog?.length) {
        await supabase.from('blog_posts').insert([
          { title: "The Future of CGI in Advertising", slug: "future-of-cgi", category: "Trends", content: "CGI is no longer just for Hollywood. Brands are now using 3D assets to create hyper-realistic ads that were previously impossible...", image_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800" }
        ]);
      }

      alert("Demo data successfully seeded! Refresh the site to see changes.");
      fetchData();
    } catch (err: any) {
      alert("Seeding failed: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'hero_image_url' | 'profile_pic_url') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const publicUrl = await uploadFile(bucketName, file);
      handleConfigChange({ [field]: publicUrl });
      alert('Image uploaded! Click Save to confirm.');
    } catch (err: any) {
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
                  <button 
                    onClick={seedDemoData} 
                    disabled={seeding} 
                    className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all text-sm border border-gray-700"
                  >
                    {seeding ? <Loader2 className="animate-spin" size={18} /> : <Sparkles className="text-primary" size={18} />}
                    Seed Demo Data
                  </button>
                  <button onClick={handleConfigSave} disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-primary text-gray-950 font-black rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20">
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Settings
                  </button>
                </div>
              </div>

              <div className="bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-800 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                  <div className="aspect-[4/5] bg-gray-950 rounded-3xl overflow-hidden border border-gray-800 relative group cursor-pointer">
                    {configForm.hero_image_url ? (
                      <img src={configForm.hero_image_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                        <ImageIcon size={64} />
                        <p className="font-bold mt-2 text-xs uppercase tracking-widest">No Hero Photo</p>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-gray-950/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer">
                      <Upload size={40} className="text-primary mb-2" />
                      <span className="font-bold text-white text-xs uppercase">Change Photo</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero_image_url')} />
                    </label>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block px-1">Hero Title</label>
                      <input className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white focus:border-primary outline-none transition-all" value={configForm.hero_title || ''} onChange={(e) => handleConfigChange({ hero_title: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block px-1">Hero Subtitle</label>
                      <textarea rows={3} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white focus:border-primary outline-none resize-none transition-all" value={configForm.hero_subtitle || ''} onChange={(e) => handleConfigChange({ hero_subtitle: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block px-1">Main Showreel URL (YouTube)</label>
                      <div className="relative">
                        <input 
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-12 pr-5 py-4 text-white focus:border-primary outline-none transition-all" 
                          value={configForm.hero_video_url || ''} 
                          onChange={(e) => handleConfigChange({ hero_video_url: e.target.value.trim() })} 
                          placeholder="https://youtube.com/watch?v=..."
                        />
                        <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab !== 'config' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 text-gray-700">
                <LayoutGrid size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">Editor for {activeTab} coming soon</h3>
              <p className="text-gray-500 max-w-xs">Use the "Seed Demo Data" button in Settings to populate your database tables for now.</p>
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
