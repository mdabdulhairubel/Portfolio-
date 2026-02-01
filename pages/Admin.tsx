
import React, { useState, useEffect } from 'react';
import { 
  Settings, Briefcase, LayoutGrid, FileText, Image as ImageIcon, 
  MessageSquare, Users, Plus, Trash2, Edit2, LogOut, CheckCircle2, 
  X, Save, Loader2, Upload, Camera
} from 'lucide-react';
import { supabase, uploadFile } from '../supabase';
import { 
  Service, Project, Testimonial, BrandLogo, 
  BlogPost, ContactSubmission, SiteConfig 
} from '../types';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('config');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);
  
  // Site Config Form State
  const [configForm, setConfigForm] = useState<Partial<SiteConfig>>({});

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { 
      setIsAuthenticated(true);
    } else {
      alert('Wrong credentials');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const [
      { data: config },
      { data: services },
      { data: projects },
      { data: blog },
      { data: contacts },
      { data: logos }
    ] = await Promise.all([
      supabase.from('site_config').select('*').single(),
      supabase.from('services').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('blog_posts').select('*'),
      supabase.from('contacts').select('*').order('created_at', { ascending: false }),
      supabase.from('brand_logos').select('*')
    ]);
    
    setData({ config, services, projects, blog, contacts, logos });
    if (config) setConfigForm(config);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const handleConfigSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('site_config')
      .update(configForm)
      .eq('id', configForm.id);

    if (error) {
      alert('Error updating config: ' + error.message);
    } else {
      alert('Configuration updated successfully!');
      fetchData();
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'hero_image_url' | 'profile_pic_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const publicUrl = await uploadFile('media', file);
      setConfigForm({ ...configForm, [field]: publicUrl });
      alert('Image uploaded! Don\'t forget to click Save Changes.');
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-2xl">
          <h2 className="text-3xl font-bold mb-8 text-center text-primary">Admin Access</h2>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <input
              type="password"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full py-4 bg-primary hover:bg-primary-hover text-gray-950 font-bold rounded-xl transition-all">
            Unlock Panel
          </button>
        </form>
      </div>
    );
  }

  const tabs = [
    { id: 'config', label: 'Site Config', icon: <Settings size={18} /> },
    { id: 'services', label: 'Services', icon: <Briefcase size={18} /> },
    { id: 'projects', label: 'Portfolio', icon: <LayoutGrid size={18} /> },
    { id: 'blog', label: 'Blog', icon: <FileText size={18} /> },
    { id: 'logos', label: 'Brand Logos', icon: <ImageIcon size={18} /> },
    { id: 'contacts', label: 'Inquiries', icon: <MessageSquare size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 border-r border-gray-800 p-6 space-y-2">
        <h2 className="text-xl font-bold mb-8 px-3 text-primary">Admin Control</h2>
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
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 mt-12 transition-all font-bold"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Content */}
      <main className="flex-grow p-8 overflow-y-auto max-h-screen custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {activeTab === 'config' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Settings className="text-primary" /> General Configuration
                  </h3>
                  <button 
                    onClick={handleConfigSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-hover text-gray-950 font-bold rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save All Changes
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-900 p-8 rounded-3xl border border-gray-800">
                  {/* Hero Media Upload */}
                  <div className="md:col-span-2 p-6 bg-gray-950 border border-gray-800 rounded-2xl">
                    <h4 className="text-lg font-bold mb-6 flex items-center gap-2"><Camera size={20} className="text-primary" /> Hero Section Media</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                       <div className="aspect-[4/5] bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 relative group">
                         {configForm.hero_image_url ? (
                           <img src={configForm.hero_image_url} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                             <ImageIcon size={48} className="mb-2" />
                             <p className="text-xs">No Hero Image</p>
                           </div>
                         )}
                         <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all">
                           <Upload size={32} className="text-primary mb-2" />
                           <span className="text-xs font-bold text-white">Upload New Hero Photo</span>
                           <input 
                             type="file" 
                             className="hidden" 
                             accept="image/*"
                             onChange={(e) => handleImageUpload(e, 'hero_image_url')} 
                           />
                         </label>
                       </div>
                       <div className="space-y-4">
                         <div className="space-y-2">
                           <label className="text-sm font-bold text-gray-400">Hero Title</label>
                           <input 
                             className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none" 
                             value={configForm.hero_title || ''} 
                             onChange={(e) => setConfigForm({...configForm, hero_title: e.target.value})}
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-sm font-bold text-gray-400">Hero Subtitle</label>
                           <textarea 
                             rows={3}
                             className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none" 
                             value={configForm.hero_subtitle || ''} 
                             onChange={(e) => setConfigForm({...configForm, hero_subtitle: e.target.value})}
                           />
                         </div>
                       </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <label className="block text-sm font-bold text-gray-400 px-1">Professional Bio (About Section)</label>
                    <textarea 
                      rows={4} 
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none" 
                      value={configForm.bio || ''}
                      onChange={(e) => setConfigForm({...configForm, bio: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <label className="block text-sm font-bold text-gray-400 px-1">Chatbot Knowledge Base (Context for AI)</label>
                    <textarea 
                      rows={6} 
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none" 
                      value={configForm.chatbot_knowledge || ''}
                      onChange={(e) => setConfigForm({...configForm, chatbot_knowledge: e.target.value})}
                    ></textarea>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-400 px-1">WhatsApp (+880...)</label>
                    <input 
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none" 
                      value={configForm.whatsapp || ''}
                      onChange={(e) => setConfigForm({...configForm, whatsapp: e.target.value})}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-400 px-1">Email Address</label>
                    <input 
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none" 
                      value={configForm.email || ''}
                      onChange={(e) => setConfigForm({...configForm, email: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Briefcase className="text-primary" /> Manage Services
                  </h3>
                  <button className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-hover text-gray-950 font-bold rounded-xl transition-all">
                    <Plus size={18} /> Add New
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {data.services?.map((s: Service) => (
                    <div key={s.id} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-all">
                      <div>
                        <h4 className="font-bold text-lg">{s.title}</h4>
                        <p className="text-primary text-sm font-bold">{s.price}</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-primary bg-gray-800 rounded-lg"><Edit2 size={16} /></button>
                        <button className="p-2 text-red-400 hover:bg-red-400/10 bg-gray-800 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <LayoutGrid className="text-primary" /> Portfolio Projects
                  </h3>
                  <button className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-hover text-gray-950 font-bold rounded-xl transition-all">
                    <Plus size={18} /> Add Project
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {data.projects?.map((p: Project) => (
                     <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden group hover:border-primary/50 transition-all">
                       <div className="aspect-video relative">
                         <img src={p.thumbnail_url} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button className="p-3 bg-white text-gray-950 rounded-full hover:scale-110 transition-transform"><Edit2 size={18} /></button>
                            <button className="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                         </div>
                       </div>
                       <div className="p-4">
                         <h4 className="font-bold mb-1 truncate">{p.title}</h4>
                         <p className="text-xs text-primary font-bold uppercase tracking-widest">{p.category}</p>
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <MessageSquare className="text-primary" /> Form Inquiries
                </h3>
                <div className="space-y-4">
                  {data.contacts?.map((c: ContactSubmission) => (
                    <div key={c.id} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl hover:border-primary/30 transition-all">
                       <div className="flex justify-between items-start mb-4">
                         <div>
                            <h4 className="font-bold text-lg text-white">{c.name}</h4>
                            <p className="text-primary text-sm font-medium">{c.email}</p>
                         </div>
                         <span className="text-xs text-gray-600 bg-gray-950 px-3 py-1 rounded-full">{new Date(c.created_at).toLocaleString()}</span>
                       </div>
                       <p className="text-gray-400 text-sm italic leading-relaxed">"{c.message}"</p>
                    </div>
                  ))}
                  {data.contacts?.length === 0 && <div className="text-center py-20 text-gray-600">No messages yet.</div>}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
