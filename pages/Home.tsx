import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, Play, ArrowRight, Star, X, Sparkles, 
  CheckCircle2, Quote, Send, Loader2, 
  Trophy, Zap
} from 'lucide-react';
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

  // High-performance Parallax State
  const heroRef = useRef<HTMLElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const targetRotation = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const currentRotation = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          configRes,
          srvRes,
          projRes,
          testRes,
          logoRes
        ] = await Promise.all([
          supabase.from('site_config').select('*').limit(1).single(),
          supabase.from('services').select('*').order('created_at', { ascending: true }),
          supabase.from('projects').select('*').eq('is_featured', true).limit(4),
          supabase.from('testimonials').select('*').order('created_at', { ascending: false }).limit(6),
          supabase.from('brand_logos').select('*')
        ]);
        
        if (configRes.data) setConfig(configRes.data);
        if (srvRes.data && srvRes.data.length > 0) setServices(srvRes.data);
        if (projRes.data && projRes.data.length > 0) setProjects(projRes.data);
        if (testRes.data && testRes.data.length > 0) setTestimonials(testRes.data);
        if (logoRes.data && logoRes.data.length > 0) setLogos(logoRes.data);

      } catch (err) {
        console.error("Home page fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Parallax Animation Loop
  useEffect(() => {
    if (loading) return;

    let animationFrame: number;
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const animate = () => {
      const container = imageContainerRef.current;
      if (container) {
        // Interpolate current values toward targets
        currentRotation.current.x = lerp(currentRotation.current.x, targetRotation.current.x, 0.1);
        currentRotation.current.y = lerp(currentRotation.current.y, targetRotation.current.y, 0.1);
        currentRotation.current.tx = lerp(currentRotation.current.tx, targetRotation.current.tx, 0.1);
        currentRotation.current.ty = lerp(currentRotation.current.ty, targetRotation.current.ty, 0.1);

        container.style.transform = `perspective(1200px) rotateX(${currentRotation.current.x}deg) rotateY(${currentRotation.current.y}deg) translate3d(${currentRotation.current.tx}px, ${currentRotation.current.ty}px, 0)`;
      }
      animationFrame = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const hero = heroRef.current;
      if (!hero) return;

      const { left, top, width, height } = hero.getBoundingClientRect();
      const x = ((e.clientX - left) / width - 0.5) * 2; // -1 to 1
      const y = ((e.clientY - top) / height - 0.5) * 2; // -1 to 1

      // Set target values for the lerp in the animate loop
      targetRotation.current = {
        x: -y * 6,   // Subtle tilt
        y: x * 6,    // Subtle tilt
        tx: x * 12,  // Subtle shift
        ty: y * 12   // Subtle shift
      };
    };

    const handleMouseLeave = () => {
      targetRotation.current = { x: 0, y: 0, tx: 0, ty: 0 };
    };

    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove);
      hero.addEventListener('mouseleave', handleMouseLeave);
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      if (hero) {
        hero.removeEventListener('mousemove', handleMouseMove);
        hero.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrame);
    };
  }, [loading]);

  // Re-trigger scroll observer after dynamic content is rendered
  useEffect(() => {
    if (!loading) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const animation = target.getAttribute('data-scroll-animation') || 'animate-fade-up';
            target.classList.add(animation);
            target.classList.remove('opacity-0');
            observer.unobserve(target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('[data-scroll]').forEach(el => observer.observe(el));
      return () => observer.disconnect();
    }
  }, [loading, services, projects]);

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

  const displayLogos = logos.length > 0 ? logos : [
    { id: 'l1', name: 'Nike', image_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
    { id: 'l2', name: 'Adidas', image_url: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
    { id: 'l3', name: 'Puma', image_url: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Puma_Logo.svg' },
    { id: 'l4', name: 'RedBull', image_url: 'https://upload.wikimedia.org/wikipedia/en/f/f5/Red_Bull_Racing_logo.svg' },
    { id: 'l5', name: 'Beats', image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Beats_Electronics_logo.svg' },
    { id: 'l6', name: 'Sony', image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg' }
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : [
    {
      id: 'demo-1',
      name: 'Sarah Johnson',
      role: 'Creative Director at PixelFlow',
      feedback: 'Md Abdul Hai transformed our brand vision into a cinematic experience. His eye for detail in motion graphics is unmatched.',
      image_url: 'https://i.pravatar.cc/150?u=sarah',
      rating: 5
    },
    {
      id: 'demo-2',
      name: 'Michael Chen',
      role: 'Founder of TechNova',
      feedback: 'Working with Hai was the best decision for our CGI product launch. High-end visuals and perfect timing.',
      image_url: 'https://i.pravatar.cc/150?u=michael',
      rating: 5
    }
  ];

  const displayServices = services.length > 0 ? services : [
    { id: 's1', title: 'CGI Product Ads', description: 'Hyper-realistic product visuals and animations.', features: ['4K Rendering', 'Physically Based Lighting', 'Realistic Textures'] },
    { id: 's2', title: 'Motion Graphics', description: 'Dynamic typography and shape-based storytelling.', features: ['Logo Animation', 'Infographics', 'Explainer Videos'] },
    { id: 's3', title: 'Video Editing', description: 'Narrative-driven professional post-production.', features: ['Color Grading', 'Sound Design', 'VFX Integration'] }
  ];

  const displayProjects = projects.length > 0 ? projects : [
    { id: 'p1', title: 'Futuristic Tech Ad', category: 'CGI Ads', thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800' },
    { id: 'p2', title: 'Liquid Motion Identity', category: 'Motion Graphics', thumbnail_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800' }
  ];

  return (
    <div className="space-y-24 pb-24 overflow-hidden bg-gray-950 min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[85vh] flex items-center pt-16 lg:pt-10 group/hero">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid-subtle"></div>
          <div className="absolute top-0 left-0 w-[50rem] h-[50rem] bg-primary/10 rounded-full blur-[180px]"></div>
          <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-purple-600/5 rounded-full blur-[150px]"></div>
        </div>
        
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-32 items-center">
            
            <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 text-primary text-[11px] font-black uppercase tracking-[0.25em] mb-6 animate-fade-in backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                Available for Global Projects
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] mb-6 text-white tracking-tighter animate-fade-up">
                {config?.hero_title || 'Md Abdul Hai'}<span className="text-primary">.</span>
              </h1>
              
              <div className="flex flex-col sm:flex-row items-center gap-5 mb-6 animate-fade-up [animation-delay:200ms]">
                <p className="text-xl md:text-2xl text-gray-400 font-medium tracking-tight">
                  <span className="text-white font-bold">Senior Visualizer</span> & Motion Storyteller
                </p>
                <div className="hidden sm:block w-10 h-px bg-gray-800"></div>
                <p className="text-gray-500 font-black uppercase text-[10px] tracking-[0.3em]">
                  Based in Dhaka
                </p>
              </div>

              <div className="max-w-xl mb-10 animate-fade-up [animation-delay:300ms]">
                <p className="text-gray-400 text-lg leading-relaxed">
                  {(config as any)?.hero_description || 'Crafting high-end cinematic experiences through motion graphics and CGI ads. Dedicated to bringing complex brand stories to life with precision and artistic flair.'}
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 items-center animate-fade-up [animation-delay:500ms]">
                <a href="#contact-section" className="group px-10 py-5 bg-primary hover:bg-primary-hover text-gray-950 font-black rounded-2xl transition-all flex items-center gap-3 shadow-2xl shadow-primary/30 hover:scale-[1.03] active:scale-95">
                  Start a Project <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                </a>
                <Link to="/portfolio" className="px-10 py-5 bg-white/5 border border-white/10 hover:border-primary/50 text-white font-black rounded-2xl transition-all flex items-center gap-3 hover:bg-white/10 backdrop-blur-xl">Explore Work</Link>
                
                {videoId && (
                  <div className="relative group/play">
                    <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-ping-slow opacity-40 scale-105"></div>
                    <div className="absolute inset-0 bg-primary/5 rounded-2xl animate-ping-slow opacity-20 scale-115 [animation-delay:1.5s]"></div>
                    
                    <button 
                      onClick={() => setIsModalOpen(true)} 
                      className="group relative flex items-center justify-center w-16 h-16 rounded-2xl border border-white/10 hover:border-primary transition-all overflow-hidden bg-gray-900/60 backdrop-blur-xl shadow-xl shadow-primary/5 hover:shadow-primary/20 z-10"
                    >
                      <div className="absolute inset-0 bg-primary scale-0 group-hover:scale-100 transition-transform duration-500 origin-center opacity-10"></div>
                      <Play size={22} className="text-primary group-hover:scale-110 transition-transform relative z-20" fill="currentColor" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 relative flex justify-center lg:justify-end perspective-[1200px]">
              <div 
                ref={imageContainerRef}
                className="relative w-full max-w-[420px] aspect-[4/5] animate-zoom-in [animation-delay:600ms] will-change-transform"
              >
                {/* Floating Experience Badge */}
                <div className="absolute -top-8 -right-4 lg:-right-10 z-20 bg-gray-900/60 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-bounce [animation-duration:5s]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Trophy size={24} /></div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Experience</p>
                      <p className="text-xl font-bold text-white leading-tight">5+ Years</p>
                    </div>
                  </div>
                </div>

                {/* Floating Projects Badge */}
                <div className="absolute -bottom-6 -left-4 lg:-left-12 z-20 bg-gray-900/60 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-bounce [animation-duration:4s] [animation-delay:1.5s]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500"><Zap size={24} /></div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Projects</p>
                      <p className="text-xl font-bold text-white leading-tight">500+</p>
                    </div>
                  </div>
                </div>

                <div className="w-full h-full rounded-[3.5rem] overflow-hidden border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.4)] relative z-10 group bg-gray-900 transition-all duration-700 hover:border-primary/30">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-80 z-[1]"></div>
                  <img 
                    src={config?.hero_image_url || config?.profile_pic_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800'} 
                    alt="Md Abdul Hai" 
                    className="w-full h-full object-cover transition-transform duration-700 scale-105 group-hover:scale-100" 
                  />
                </div>
                
                {/* Visual Glow behind image */}
                <div className="absolute inset-4 bg-primary/20 blur-[100px] -z-10 rounded-full group-hover:bg-primary/30 transition-colors"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-fade-in [animation-delay:2000ms]">
          <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] ml-1">Scroll Down</span>
          <div className="w-px h-10 bg-gradient-to-b from-primary to-transparent animate-pulse"></div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 opacity-0" data-scroll data-scroll-animation="animate-fade-up">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter">Core Expertise</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">High-end visual solutions tailored for global brands.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayServices.map((service, idx) => (
            <div key={service.id} data-scroll style={{ animationDelay: `${idx * 150}ms` }} className="group relative p-8 bg-gray-900/50 border border-gray-800 rounded-[2.5rem] hover:border-primary transition-all flex flex-col h-full opacity-0">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Sparkles size={28} /></div>
              </div>
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-gray-400 mb-8 text-sm leading-relaxed">{service.description}</p>
              <ul className="space-y-4 mb-8 flex-grow">
                {service.features.slice(0, 4).map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-medium text-gray-300"><CheckCircle2 size={16} className="text-primary" /> {feat}</li>
                ))}
              </ul>
              <a href="#contact-section" className="w-full py-3 bg-gray-950 border border-gray-800 rounded-xl text-center text-sm font-bold hover:bg-primary hover:text-gray-950 transition-all block">Book a Consultation</a>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 bg-gray-900/30 relative">
        <div className="absolute inset-0 bg-grid-subtle opacity-40 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-end mb-16 opacity-0" data-scroll data-scroll-animation="animate-fade-up">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter">Selected Works</h2>
              <p className="text-gray-400">Cinematic motion and CGI narratives.</p>
            </div>
            <Link to="/portfolio" className="text-primary font-bold flex items-center gap-2 hover:translate-x-1 transition-transform">Gallery <ArrowRight size={18} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {displayProjects.map((project, idx) => (
              <div key={project.id} data-scroll data-scroll-animation="animate-zoom-in" style={{ animationDelay: `${idx * 200}ms` }} className="group relative rounded-[2.5rem] overflow-hidden aspect-video bg-gray-800 border border-gray-800 opacity-0">
                <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent flex flex-col justify-end p-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-4">{project.category}</span>
                  <h3 className="text-3xl font-bold text-white mb-6">{project.title}</h3>
                  <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm font-black text-primary">Explore Project <ChevronRight size={16} /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
        <div className="text-center mb-16 opacity-0" data-scroll data-scroll-animation="animate-fade-up">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter">Client Stories</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Collaboration that leads to impactful results.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayTestimonials.map((test, idx) => (
            <div key={test.id} data-scroll style={{ animationDelay: `${idx * 100}ms` }} className="group p-8 bg-gray-900/40 border border-gray-800 rounded-[2.5rem] relative hover:bg-gray-900/60 transition-all flex flex-col h-full opacity-0">
              <Quote className="absolute top-6 right-6 text-primary/10 group-hover:text-primary/20 transition-colors" size={64} />
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < (test.rating || 5) ? "fill-primary text-primary" : "text-gray-700"} />
                ))}
              </div>
              <p className="text-gray-200 text-lg italic mb-10 leading-relaxed flex-grow">"{test.feedback}"</p>
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

      {/* Brands */}
      <section className="py-20 border-y border-gray-900 bg-gray-900/10 overflow-hidden relative opacity-0" data-scroll data-scroll-animation="animate-fade-in">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-[0.4em]">Brands I've Worked With</span>
        </div>
        <div className="mask-marquee w-full overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee py-4">
            {[...displayLogos, ...displayLogos, ...displayLogos].map((logo, idx) => (
              <div key={`${logo.id}-${idx}`} className="flex items-center justify-center px-12 opacity-30 hover:opacity-100 transition-all duration-500 filter grayscale brightness-200 hover:grayscale-0 hover:scale-110">
                <img src={logo.image_url} alt={logo.name} className="h-10 md:h-14 w-auto object-contain pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 opacity-0" data-scroll data-scroll-animation="animate-fade-up">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-[3rem] p-8 md:p-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-subtle opacity-20 pointer-events-none"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight tracking-tighter">Bring your <span className="text-primary">vision to life.</span></h2>
              <p className="text-gray-400 text-lg mb-12">Discussing creative concepts, budgeting, or just saying hi—my door is always open.</p>
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-white"><CheckCircle2 size={20} className="text-primary" /> <span className="font-bold">Fast Turnaround</span></div>
                <div className="flex items-center gap-4 text-white"><CheckCircle2 size={20} className="text-primary" /> <span className="font-bold">High-End Production Quality</span></div>
              </div>
            </div>
            <form onSubmit={handleContact} className="bg-gray-950/50 p-8 rounded-[2rem] border border-gray-800 space-y-6">
              {contactSuccess ? (
                <div className="text-center py-10 animate-fade-in">
                  <CheckCircle2 size={32} className="text-primary mx-auto mb-6" />
                  <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                </div>
              ) : (
                <>
                  <input name="name" required placeholder="Name" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-primary transition-all" />
                  <input name="email" type="email" required placeholder="Email" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-primary transition-all" />
                  <textarea name="message" required rows={4} placeholder="What are we creating?" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-primary transition-all resize-none"></textarea>
                  <button disabled={contactLoading} type="submit" className="w-full py-4 bg-primary text-gray-950 font-black rounded-xl hover:bg-primary-hover shadow-xl flex items-center justify-center gap-3">
                    {contactLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />} Submit Inquiry
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      {isModalOpen && videoId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/98 backdrop-blur-md animate-fade-in">
          <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-white hover:text-primary transition-all z-[110]"><X size={40} /></button>
          <div className="w-full max-w-6xl aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10 animate-zoom-in">
            <iframe width="100%" height="100%" src={embedUrl} title="Showreel" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;