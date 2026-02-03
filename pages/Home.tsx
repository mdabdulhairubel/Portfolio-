
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Play, ArrowRight, Star, X, Sparkles, CheckCircle2, Quote, Send, Loader2 } from 'lucide-react';
import { supabase } from '../supabase.ts';
import { Service, Project, SiteConfig, Testimonial, BrandLogo } from '../types.ts';

const Home: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [logos, setLogos] = useState<BrandLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { data: siteData },
          { data: srvData },
          { data: projData },
          { data: testData },
          { data: logoData }
        ] = await Promise.all([
          supabase.from('site_config').select('*').limit(1).single(),
          supabase.from('services').select('*').order('created_at', { ascending: true }),
          supabase.from('projects').select('*').eq('is_featured', true).limit(4),
          supabase.from('testimonials').select('*').order('created_at', { ascending: false }).limit(6),
          supabase.from('brand_logos').select('*')
        ]);
        
        if (siteData) setConfig(siteData);
        if (srvData) setServices(srvData);
        if (projData) setProjects(projData);
        if (testData) setTestimonials(testData);
        if (logoData) setLogos(logoData);
      } catch (err) {
        console.error("Home page fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    };
    const { error } = await supabase.from('contacts').insert([payload]);
    if (!error) {
      setContactSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setContactSuccess(false), 5000);
    }
    setContactLoading(false);
  };

  const getYouTubeId = (input: string) => {
    if (!input) return null;
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([^"&?\/\s]{11})/i;
    const match = input.match(regExp);
    return (match && match[1]) ? match[1] : null;
  };

  const videoId = config?.hero_video_url ? getYouTubeId(config.hero_video_url) : null;
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1` : "";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-24 pb-24 overflow-hidden bg-gray-950 min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-500"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left animate-fade-up">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">Available for Global Projects</span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-6 text-white">
                {config?.hero_title || 'Md Abdul Hai'}
              </h1>
              <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">{config?.hero_subtitle || 'Visualizer & Creative Artist'}</p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 items-center">
                <a href="#contact-section" className="px-8 py-4 bg-primary hover:bg-primary-hover text-gray-950 font-bold rounded-full transition-all flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95">Start a Project <ArrowRight size={20} /></a>
                <Link to="/portfolio" className="px-8 py-4 bg-gray-900 border border-gray-800 hover:border-primary text-white font-bold rounded-full transition-all flex items-center gap-2 hover:bg-gray-800 hover:scale-105">View Showreel</Link>
                
                {videoId && (
                  <button onClick={() => setIsModalOpen(true)} className="group flex items-center gap-4 text-white font-bold transition-all hover:text-primary ml-2">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-10 h-10 bg-primary/30 rounded-full animate-ping"></div>
                      <div className="relative w-12 h-12 bg-primary rounded-full flex items-center justify-center text-gray-950 shadow-2xl group-hover:scale-110 transition-transform">
                        <Play size={20} fill="currentColor" className="ml-1" />
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end animate-zoom-in">
              <div className="relative w-full max-w-md aspect-[4/5] group">
                <div className="absolute -inset-4 bg-primary/10 rounded-[2.5rem] blur-2xl -z-10"></div>
                <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-gray-800 shadow-2xl relative z-10 bg-gray-950">
                  <img 
                    src={config?.hero_image_url || config?.profile_pic_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800'} 
                    alt="Md Abdul Hai" 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Scrolling Section */}
      {logos.length > 0 && (
        <section className="py-12 border-y border-gray-900 overflow-hidden bg-gray-900/10">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...logos, ...logos, ...logos].map((logo, idx) => (
              <div key={idx} className="flex items-center justify-center px-12 opacity-50 hover:opacity-100 transition-opacity">
                <img src={logo.image_url} alt={logo.name} className="h-10 w-auto object-contain brightness-0 invert" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Services Section */}
      {services.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Professional Services</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">High-end visual solutions tailored for brands and creators.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <div key={service.id} className="group relative p-8 bg-gray-900/50 border border-gray-800 rounded-3xl hover:border-primary transition-all animate-fade-up flex flex-col h-full" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Sparkles size={28} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-gray-400 mb-8 text-sm leading-relaxed">{service.description}</p>
                <ul className="space-y-4 mb-8 flex-grow">
                  {service.features.slice(0, 4).map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-medium text-gray-300">
                      <CheckCircle2 size={16} className="text-primary" /> {feat}
                    </li>
                  ))}
                </ul>
                <a href="#contact-section" className="w-full py-3 bg-gray-950 border border-gray-800 rounded-xl text-center text-sm font-bold hover:bg-primary hover:text-gray-950 transition-all block">Get Started</a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Projects */}
      {projects.length > 0 && (
        <section className="py-24 bg-gray-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Featured Work</h2>
                <p className="text-gray-400">Selected projects that define my visual style.</p>
              </div>
              <Link to="/portfolio" className="text-primary font-bold flex items-center gap-2 hover:translate-x-1 transition-transform">
                Browse Full Gallery <ArrowRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {projects.map((project, idx) => (
                <div key={project.id} className="group relative rounded-[2.5rem] overflow-hidden aspect-video bg-gray-800 border border-gray-800 animate-zoom-in">
                  <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent flex flex-col justify-end p-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-4">{project.category}</span>
                    <h3 className="text-3xl font-bold text-white mb-6">{project.title}</h3>
                    <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm font-black text-primary">View Details <ChevronRight size={16} /></Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">What my clients say</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Trust is the foundation of every creative partnership.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div key={test.id} className="group p-8 bg-gray-900/40 border border-gray-800 rounded-[2.5rem] relative hover:bg-gray-900/60 transition-all flex flex-col h-full">
                <Quote className="absolute top-6 right-6 text-primary/10 group-hover:text-primary/20 transition-colors" size={64} />
                
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < (test.rating || 5) ? "fill-primary text-primary" : "text-gray-700"} />
                  ))}
                </div>

                <p className="text-gray-200 text-lg italic mb-10 leading-relaxed flex-grow">
                  "{test.feedback}"
                </p>

                <div className="flex items-center gap-4 pt-6 border-t border-gray-800/50">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-primary/20 bg-gray-800">
                    <img src={test.image_url || `https://ui-avatars.com/api/?name=${test.name}&background=random`} className="w-full h-full object-cover" alt={test.name} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{test.name}</h4>
                    <p className="text-xs text-primary font-bold uppercase tracking-wider">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-[3rem] p-8 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-3xl -z-10 rounded-full"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">Ready to launch your <span className="text-primary">next vision?</span></h2>
              <p className="text-gray-400 text-lg mb-12">I'm currently accepting new projects and creative consultations. Let's discuss your goals.</p>
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-white">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary"><Star size={20} /></div>
                  <span className="font-bold">Fast Turnaround (24-48h)</span>
                </div>
                <div className="flex items-center gap-4 text-white">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary"><CheckCircle2 size={20} /></div>
                  <span className="font-bold">Premium High-End Visuals</span>
                </div>
              </div>
            </div>
            <form onSubmit={handleContact} className="bg-gray-950/50 p-8 rounded-[2rem] border border-gray-800 space-y-6">
              {contactSuccess ? (
                <div className="text-center py-10 animate-fade-in">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={32} /></div>
                  <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-gray-400">Hai will get back to you within 24 hours.</p>
                </div>
              ) : (
                <>
                  <input name="name" required placeholder="Full Name" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-primary transition-all" />
                  <input name="email" type="email" required placeholder="Email Address" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-primary transition-all" />
                  <textarea name="message" required rows={4} placeholder="Tell me about your project..." className="w-full bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-primary transition-all resize-none"></textarea>
                  <button disabled={contactLoading} type="submit" className="w-full py-4 bg-primary text-gray-950 font-black rounded-xl hover:bg-primary-hover shadow-xl flex items-center justify-center gap-3">
                    {contactLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    Submit Inquiry
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {isModalOpen && videoId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/98 backdrop-blur-md animate-fade-in">
          <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-white hover:text-primary transition-all z-[110]"><X size={40} /></button>
          <div className="w-full max-w-6xl aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10 animate-zoom-in">
            <iframe width="100%" height="100%" src={embedUrl} title="Visualizer Showreel" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
