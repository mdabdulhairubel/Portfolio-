
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Play, ArrowRight, Star, X } from 'lucide-react';
import { supabase } from '../supabase';
import { Service, Project, SiteConfig } from '../types';

const Home: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const heroImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { data: siteData },
          { data: srvData },
          { data: projData }
        ] = await Promise.all([
          supabase.from('site_config').select('*').order('updated_at', { ascending: false }).limit(1),
          supabase.from('services').select('*').limit(3),
          supabase.from('projects').select('*').eq('is_featured', true).limit(4)
        ]);
        
        if (siteData && siteData.length > 0) setConfig(siteData[0]);
        if (srvData) setServices(srvData);
        if (projData) setProjects(projData);
      } catch (err) {
        console.error("Home page fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?\??v=))([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const videoId = config?.hero_video_url ? getYouTubeId(config.hero_video_url) : null;
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : "";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-24 pb-24 overflow-hidden">
      <section className="relative min-h-[90vh] flex items-center pt-24">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-500"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left opacity-0 animate-fade-up">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">Available for New Projects</span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-6">{config?.hero_title || 'Crafting Digital Experiences'}</h1>
              <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">{config?.hero_subtitle || 'Md Abdul Hai — Creative Visualizer'}</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 items-center">
                <Link to="/contact" className="px-8 py-4 bg-primary hover:bg-primary-hover text-gray-950 font-bold rounded-full transition-all flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95">Hire Me Now <ArrowRight size={20} /></Link>
                <Link to="/portfolio" className="px-8 py-4 bg-gray-900 border border-gray-800 hover:border-primary text-white font-bold rounded-full transition-all flex items-center gap-2 hover:bg-gray-800 hover:scale-105">View Portfolio</Link>
                {videoId && (
                  <button onClick={() => setIsModalOpen(true)} className="group flex items-center gap-4 text-white font-bold transition-all hover:text-primary ml-2">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-10 h-10 bg-primary/30 rounded-full animate-ping"></div>
                      <div className="relative w-12 h-12 bg-primary rounded-full flex items-center justify-center text-gray-950 shadow-2xl group-hover:scale-110 transition-transform"><Play size={20} fill="currentColor" className="ml-1" /></div>
                    </div>
                    <div className="flex flex-col items-start"><span className="text-xs uppercase tracking-[0.2em] font-black">Watch Video</span><span className="text-[10px] text-gray-500 uppercase tracking-widest group-hover:text-primary/70">Showreel</span></div>
                  </button>
                )}
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end opacity-0 animate-zoom-in delay-200">
              <div ref={heroImageRef} className="relative w-full max-w-md aspect-[4/5] group">
                <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-gray-800 shadow-2xl relative z-10 bg-gray-900">
                  {config?.hero_image_url ? <img src={config.hero_image_url} alt="Hero" className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center bg-gray-950"><Star className="text-gray-800 w-24 h-24" /></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isModalOpen && videoId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/98 backdrop-blur-md animate-fade-in">
          <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-4 bg-gray-900/50 hover:bg-primary hover:text-gray-950 rounded-full text-white transition-all z-[110] border border-white/10 group"><X size={28} className="group-hover:rotate-90 transition-transform" /></button>
          
          <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl animate-zoom-in border border-white/10">
            <iframe 
              width="100%"
              height="100%"
              src={embedUrl} 
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-up">
        <div className="text-center mb-16"><h2 className="text-3xl md:text-5xl font-bold mb-4">My Services</h2><p className="text-gray-400 max-w-2xl mx-auto">Expert solutions tailored to elevate your brand's visual storytelling.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div key={service.id} className="group p-8 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-primary transition-all opacity-0 animate-fade-up" style={{ animationDelay: `${idx * 150}ms` }}>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform"><Star size={28} /></div>
              <h3 className="text-xl font-bold mb-4">{service.title}</h3>
              <p className="text-gray-400 mb-6 line-clamp-3">{service.description}</p>
              <Link to="/services" className="text-primary font-semibold flex items-center gap-2">Learn More <ChevronRight size={18} /></Link>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900/30 py-24 opacity-0 animate-fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16"><div><h2 className="text-3xl md:text-5xl font-bold mb-4">Featured Projects</h2><p className="text-gray-400">A hand-picked selection of my best work.</p></div><Link to="/portfolio" className="hidden md:flex items-center gap-2 text-primary font-semibold">View All Projects <ArrowRight size={18} /></Link></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, idx) => (
              <Link to="/portfolio" key={project.id} className="group relative overflow-hidden rounded-2xl aspect-video bg-gray-800 opacity-0 animate-zoom-in" style={{ animationDelay: `${idx * 200}ms` }}>
                <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-primary text-sm font-semibold mb-2 uppercase">{project.category}</span>
                  <h3 className="text-2xl font-bold text-white">{project.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
