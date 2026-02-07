import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { 
  ChevronRight as IconChevron, Play as IconPlay, ArrowRight as IconArrow, 
  Star as IconStar, X as IconX, Sparkles as IconSpark, 
  CheckCircle2 as IconCheckCircle, Send as IconSend, Loader2 as IconLoader, 
  Trophy as IconTrophy, Check as IconCheck, ShieldCheck as IconShield, 
  Clock as IconClock, Layers as IconLayers, Youtube as IconYoutube, 
  ExternalLink as IconExternal, Calendar as IconCalendar, 
  Info as IconInfo, Target as IconTarget, Zap as IconZap, 
  Heart as IconHeart, Award as IconAward, Quote as IconQuote,
  ChevronDown as IconChevronDown,
  Activity, Award as AwardIcon, Heart as HeartIcon, Zap as ZapIcon, 
  Star as StarIcon, Shield, Sparkles as SparklesIcon, Target as TargetIcon
} from 'lucide-react';
import { supabase } from '../supabase.ts';
import { Service, Project, SiteConfig, Testimonial, BrandLogo, PricingPlan } from '../types.ts';

// Helper for optimized image URLs
const getOptimizedUrl = (url: string, width: number = 800, quality: number = 80) => {
  if (!url || !url.includes('supabase.co') || !url.includes('/object/public/')) return url;
  return url
    .replace('/object/public/', '/render/image/public/')
    .concat(`?width=${width}&quality=${quality}`);
};

// Dynamic Icon Mapper
const IconMap: Record<string, any> = {
  Zap: ZapIcon,
  Heart: HeartIcon,
  Award: AwardIcon,
  Target: TargetIcon,
  Activity: Activity,
  Star: StarIcon,
  Shield: Shield,
  Sparkles: SparklesIcon
};

const Home: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [logos, setLogos] = useState<BrandLogo[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  
  // Image Loading States
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Project Modal State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeMedia, setActiveMedia] = useState<{url: string, type: 'image' | 'video'}>({url: '', type: 'image'});

  // Parallax Refs
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
          priceRes,
          projRes,
          logoRes,
          testRes,
          highRes
        ] = await Promise.all([
          supabase.from('site_config').select('*').limit(1).maybeSingle(),
          supabase.from('services').select('*').order('created_at', { ascending: true }),
          supabase.from('pricing_plans').select('*').order('created_at', { ascending: true }),
          supabase.from('projects').select('*').eq('is_featured', true).order('created_at', { ascending: false }),
          supabase.from('brand_logos').select('*').order('created_at', { ascending: false }),
          supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
          supabase.from('site_highlights').select('*').order('order_index', { ascending: true })
        ]);
        
        if (configRes.data) setConfig(configRes.data);
        if (srvRes.data) setServices(srvRes.data);
        if (priceRes.data) setPricingPlans(priceRes.data);
        if (projRes.data) setProjects(projRes.data);
        if (logoRes.data) setLogos(logoRes.data);
        if (testRes.data) setTestimonials(testRes.data);
        if (highRes.data) setHighlights(highRes.data);

      } catch (err) {
        console.error("Home page fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Body Scroll Lock logic
  useEffect(() => {
    if (isHeroModalOpen || selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isHeroModalOpen, selectedProject]);

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  // Parallax & Spotlight Logic
  useEffect(() => {
    if (loading) return;
    let animationFrame: number;
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const animate = () => {
      const container = imageContainerRef.current;
      if (container) {
        currentRotation.current.x = lerp(currentRotation.current.x, targetRotation.current.x, 0.08);
        currentRotation.current.y = lerp(currentRotation.current.y, targetRotation.current.y, 0.08);
        currentRotation.current.tx = lerp(currentRotation.current.tx, targetRotation.current.tx, 0.08);
        currentRotation.current.ty = lerp(currentRotation.current.ty, targetRotation.current.ty, 0.08);
        container.style.transform = `perspective(1000px) rotateX(${currentRotation.current.x}deg) rotateY(${currentRotation.current.y}deg) translate3d(${currentRotation.current.tx}px, ${currentRotation.current.ty}px, 0)`;
      }
      animationFrame = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const hero = heroRef.current;
      const container = imageContainerRef.current;
      if (!hero || !container) return;

      const { left, top, width, height } = hero.getBoundingClientRect();
      const x = ((e.clientX - left) / width - 0.5) * 2; 
      const y = ((e.clientY - top) / height - 0.5) * 2;
      
      targetRotation.current = { x: -y * 12, y: x * 12, tx: x * 20, ty: y * 20 };

      const rect = container.getBoundingClientRect();
      const lx = ((e.clientX - rect.left) / rect.width) * 100;
      const ly = ((e.clientY - rect.top) / rect.height) * 100;
      container.style.setProperty('--spotlight-x', `${lx}%`);
      container.style.setProperty('--spotlight-y', `${ly}%`);
    };

    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove);
      hero.addEventListener('mouseleave', () => {
        targetRotation.current = { x: 0, y: 0, tx: 0, ty: 0 };
      });
      animationFrame = requestAnimationFrame(animate);
    }
    return () => {
      if (hero) hero.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, [loading]);

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
  }, [loading, projects]);

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
    let target = input;
    const srcMatch = input.match(/src=["']([^"']+)["']/);
    if (srcMatch) target = srcMatch[1];
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([^"&?\/\s]{11})/i;
    const match = target.match(regExp);
    return (match && match[1]) ? match[1] : null;
  };

  const handleScrollDown = () => {
    const nextSection = document.getElementById('services-overview');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const heroVideoId = config?.hero_video_url ? getYouTubeId(config.hero_video_url) : null;
  const heroEmbedUrl = heroVideoId ? `https://www.youtube.com/embed/${heroVideoId}?rel=0&autoplay=1` : "";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const categories = ['Graphic Design', 'Motion Graphics', 'Video Editing', 'CGI Ads'];

  return (
    <div className="space-y-24 pb-24 overflow-hidden bg-gray-950 min-h-screen animate-fade-in">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[100vh] flex items-center pt-24 pb-20 lg:pt-16 lg:pb-32 group/hero overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid-subtle opacity-30"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-primary/10 rounded-full blur-[200px] opacity-60"></div>
          <div className="absolute -top-[10%] -left-[10%] w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[150px]"></div>
        </div>
        
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 xl:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-10 animate-fade-in backdrop-blur-xl shadow-xl shadow-primary/5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Available for Global Projects
              </div>

              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-[1] mb-8 text-white tracking-tighter animate-fade-up">
                {config?.hero_title || 'Md Abdul Hai'}<span className="text-primary">.</span>
              </h1>

              <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 animate-fade-up [animation-delay:200ms]">
                <div className="h-px w-12 bg-primary hidden lg:block"></div>
                <p className="text-2xl md:text-3xl text-white/90 font-semibold tracking-tight">
                  {config?.hero_role || 'Senior Visualizer & Motion Storyteller'}
                </p>
              </div>
              
              <p className="text-lg md:text-xl text-gray-400 max-w-xl mb-14 leading-relaxed animate-fade-up [animation-delay:350ms]">
                {config?.hero_subtitle || 'Crafting cinematic experiences through advanced motion design and high-end CGI advertisements for visionary brands.'}
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-5 items-center animate-fade-up [animation-delay:500ms]">
                <a 
                  href="#contact-section" 
                  className="group px-12 py-5 bg-primary hover:bg-primary-hover text-gray-950 font-black rounded-2xl transition-all flex items-center gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.03] active:scale-95"
                >
                  Start a Project <IconArrow size={22} className="group-hover:translate-x-1.5 transition-transform" />
                </a>
                
                <Link 
                  to="/portfolio" 
                  className="px-12 py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
                >
                  Explore Work
                </Link>

                {heroVideoId && (
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-primary/30 animate-ping-slow pointer-events-none"></div>
                    <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse pointer-events-none delay-700"></div>
                    
                    <button 
                      onClick={() => setIsHeroModalOpen(true)} 
                      className="relative w-16 h-16 rounded-2xl border border-white/10 hover:border-primary transition-all bg-gray-900/60 backdrop-blur-md flex items-center justify-center group/play shadow-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover/play:opacity-100 transition-opacity"></div>
                      <IconPlay 
                        size={24} 
                        className="text-primary group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,219,154,0.5)] transition-all duration-300 relative z-10" 
                        fill="currentColor" 
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 xl:col-span-6 relative flex justify-center lg:justify-end">
              <div 
                ref={imageContainerRef} 
                className={`relative w-full max-w-[460px] aspect-[4/5] animate-zoom-in [animation-delay:600ms] will-change-transform rounded-[4rem] overflow-hidden group cursor-none ${!loadedImages['hero'] ? 'animate-shimmer-bg animate-shimmer' : ''}`}
                style={{
                  '--spotlight-x': '50%',
                  '--spotlight-y': '50%'
                } as React.CSSProperties}
              >
                <img 
                  src={getOptimizedUrl(config?.hero_image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800', 900, 85)} 
                  alt="Md Abdul Hai" 
                  onLoad={() => handleImageLoad('hero')}
                  decoding="async"
                  className={`w-full h-full object-cover transition-all duration-1000 ease-out ${loadedImages['hero'] ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-110 blur-md'}`} 
                />
                <div 
                  className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                  style={{
                    background: 'radial-gradient(circle at var(--spotlight-x) var(--spotlight-y), rgba(255, 255, 255, 0.15) 0%, transparent 60%)',
                    mixBlendMode: 'plus-lighter'
                  }}
                ></div>
                <div className="absolute inset-0 border-[1.5px] border-white/10 rounded-[4rem] pointer-events-none z-30"></div>
                <div className="absolute bottom-10 left-10 p-5 bg-gray-950/80 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-10 group-hover:translate-y-0 z-40">
                  <div className="text-2xl font-black text-primary leading-none">{config?.experience_years || '5'}+</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">Years of Impact</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div 
          onClick={handleScrollDown}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 cursor-pointer group animate-fade-in [animation-delay:1200ms]"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 group-hover:text-primary transition-colors">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white animate-scroll-line"></div>
          </div>
          <IconChevronDown size={16} className="text-primary animate-bounce mt-1" />
        </div>
      </section>

      {/* Services Overview */}
      <section id="services-overview" className="py-24 bg-gray-900/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 opacity-0" data-scroll data-scroll-animation="animate-fade-up">
             <span className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Core Solutions</span>
             <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">What I Do Best</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.slice(0, 4).map((s) => (
              <div key={s.id} className="group p-8 bg-gray-950 border border-gray-800 rounded-xl hover:border-primary transition-all">
                <h4 className="text-xl font-bold text-white mb-4">{s.title}</h4>
                <p className="text-sm text-gray-500 mb-6 line-clamp-3">{s.description}</p>
                <ul className="space-y-2">
                  {s.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-gray-400">
                      <IconCheck size={12} className="text-primary" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorized Selected Works */}
      <section className="py-24 relative">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12">
          <div className="text-center mb-20 opacity-0" data-scroll data-scroll-animation="animate-fade-up">
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">Portfolio Selection</h2>
          </div>
          <div className="space-y-32">
            {categories.map((cat) => {
              const catProjects = projects.filter(p => p.category === cat);
              if (catProjects.length === 0) return null;
              return (
                <div key={cat} data-scroll data-scroll-animation="animate-fade-up" className="opacity-0">
                  <div className="flex items-center gap-6 mb-12">
                    <h3 className="text-2xl md:text-4xl font-bold text-white tracking-tighter uppercase italic">{cat}</h3>
                    <div className="h-px bg-gray-800 flex-grow"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {catProjects.map((project) => (
                      <div key={project.id} onClick={() => { setSelectedProject(project); setActiveMedia({url: project.media_url, type: project.type}); }} className="group relative bg-gray-950 rounded-xl overflow-hidden border border-gray-800 hover:border-primary transition-all duration-500 cursor-pointer aspect-video">
                        <div className={`w-full h-full relative ${!loadedImages[project.id] ? 'animate-shimmer-bg animate-shimmer' : ''}`}>
                          <img 
                            src={getOptimizedUrl(project.thumbnail_url, 600, 75)} 
                            alt={project.title} 
                            loading="lazy"
                            decoding="async"
                            onLoad={() => handleImageLoad(project.id)}
                            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${loadedImages[project.id] ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-110 blur-md'}`} 
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-8">
                          <h3 className="text-xl font-bold text-white leading-tight">{project.title}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-12 flex justify-center lg:justify-start">
                    <Link 
                      to="/portfolio" 
                      className="group flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[11px] hover:text-white transition-all py-3 px-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-primary"
                    >
                      Explore {cat} <IconArrow size={14} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic Why Choose Me Section */}
      {highlights.length > 0 && (
        <section id="why-choose-me" className="py-32 relative overflow-hidden bg-gray-950">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full opacity-30 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20 opacity-0" data-scroll data-scroll-animation="animate-fade-up">
               <span className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">The Hai Difference</span>
               <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">Why Choose Me</h2>
            </div>
            
            <div className={`grid grid-cols-1 ${highlights.length > 3 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'} gap-8`}>
              {highlights.map((item, idx) => {
                const Icon = IconMap[item.icon_name] || ZapIcon;
                return (
                  <div 
                    key={item.id} 
                    className="group relative p-10 bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-[2rem] hover:border-primary/50 transition-all duration-500 opacity-0" 
                    data-scroll 
                    data-scroll-animation="animate-fade-up"
                    style={{ transitionDelay: `${idx * 150}ms` }}
                  >
                    <div className="absolute top-8 right-8 text-white/5 font-black text-6xl group-hover:text-primary/10 transition-colors">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-gray-950 transition-all">
                      <Icon size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-sm">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-gray-900/30">
          <div className="max-w-7xl mx-auto px-6">
             <div className="text-center mb-20 opacity-0" data-scroll data-scroll-animation="animate-fade-up">
                <span className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Client Feedback</span>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">Voices of Satisfaction</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.map((t) => (
                   <div key={t.id} className="p-10 bg-gray-950 border border-gray-800 rounded-xl relative opacity-0" data-scroll data-scroll-animation="animate-fade-up">
                      <IconQuote size={40} className="text-primary/20 absolute top-10 right-10" />
                      <div className="flex items-center gap-4 mb-6">
                         <img src={getOptimizedUrl(t.image_url, 100, 70)} alt={t.name} className="w-14 h-14 rounded-full object-cover border border-gray-800" />
                         <div>
                            <h4 className="font-bold text-white">{t.name}</h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.role}</p>
                         </div>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6 italic">"{t.feedback}"</p>
                      <div className="flex gap-1">
                         {[...Array(5)].map((_, i) => (
                            <IconStar key={i} size={14} className={i < t.rating ? 'text-primary fill-primary' : 'text-gray-800'} />
                         ))}
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-16 opacity-0" data-scroll data-scroll-animation="animate-fade-up">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter text-white">Project Packages</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan) => (
                <div key={plan.id} className={`p-10 rounded-xl border transition-all duration-500 ${plan.is_popular ? 'bg-gradient-to-br from-gray-900 to-gray-950 border-primary/50 shadow-2xl scale-105 z-10' : 'bg-gray-900/40 border-gray-800'}`}>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.title}</h3>
                  <p className="text-gray-500 text-sm mb-6">{plan.description}</p>
                  <div className="text-3xl font-black text-white mb-8">{plan.price}</div>
                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                        <IconCheck size={14} className="text-primary" /> {feat}
                      </li>
                    ))}
                  </ul>
                  <a href="#contact-section" className={`block w-full py-4 rounded-xl text-center font-black text-sm transition-all ${plan.is_popular ? 'bg-primary text-gray-950' : 'bg-white/5 text-white border border-white/10'}`}>
                    {plan.button_text}
                  </a>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Client Logos Marquee */}
      {logos.length > 0 && (
        <section className="py-20 bg-gray-950/50 border-y border-gray-900 overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6 mb-10 text-center opacity-0" data-scroll data-scroll-animation="animate-fade-up">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Trusted By Industry Leaders</span>
          </div>
          <div className="relative mask-marquee">
            <div className="flex w-fit animate-marquee whitespace-nowrap">
              <div className="flex items-center gap-24 px-12">
                {logos.map((logo) => (
                  <div key={logo.id} className="w-32 md:w-48 h-20 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                    <img src={getOptimizedUrl(logo.image_url, 300, 60)} alt={logo.name} className="max-w-full max-h-full object-contain" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-24 px-12">
                {logos.map((logo) => (
                  <div key={`dup-${logo.id}`} className="w-32 md:w-48 h-20 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                    <img src={getOptimizedUrl(logo.image_url, 300, 60)} alt={logo.name} className="max-w-full max-h-full object-contain" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact-section" className="max-w-7xl mx-auto px-4 py-24 opacity-0" data-scroll data-scroll-animation="animate-fade-up">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-8 md:p-20 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tighter">Bring your <span className="text-primary">vision to life.</span></h2>
              <p className="text-gray-400 text-lg mb-12">Discussing creative concepts, budgeting, or just saying hi—my door is always open.</p>
            </div>
            <form onSubmit={handleContact} className="bg-gray-950/50 p-8 rounded-xl border border-gray-800 space-y-6">
              {contactSuccess ? (
                <div className="text-center py-10">
                  <IconCheckCircle size={32} className="text-primary mx-auto mb-6" />
                  <h3 className="text-xl font-bold mb-2 text-white">Message Sent!</h3>
                </div>
              ) : (
                <>
                  <input name="name" required placeholder="Name" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-primary" />
                  <input name="email" type="email" required placeholder="Email" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-primary" />
                  <textarea name="message" required rows={4} placeholder="What are we creating?" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white outline-none focus:border-primary resize-none"></textarea>
                  <button disabled={contactLoading} type="submit" className="w-full py-4 bg-primary text-gray-950 font-black rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-3">
                    {contactLoading ? <IconLoader className="animate-spin" /> : <IconSend />} Submit Inquiry
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Hero Video Modal - Using Portal */}
      {isHeroModalOpen && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-950/98 backdrop-blur-md animate-fade-in">
          <button onClick={() => setIsHeroModalOpen(false)} className="absolute top-8 right-8 text-white z-[210] hover:scale-110 transition-transform"><IconX size={40} /></button>
          <div className="w-full max-w-6xl aspect-video rounded-xl overflow-hidden bg-black shadow-2xl border border-white/10">
            <iframe width="100%" height="100%" src={heroEmbedUrl} title="Showreel" frameBorder="0" allowFullScreen></iframe>
          </div>
        </div>,
        document.body
      )}

      {/* Project Detail Modal - Using Portal */}
      {selectedProject && createPortal(
        <div className="fixed inset-0 z-[200] bg-gray-950/98 flex items-center justify-center p-4 md:p-8 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-6xl bg-gray-900 rounded-xl border border-gray-800 shadow-2xl overflow-hidden animate-zoom-in flex flex-col lg:flex-row max-h-[92vh]">
            <button onClick={() => setSelectedProject(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white p-3 bg-gray-950/80 backdrop-blur-md border border-gray-800 rounded-xl z-[210] hover:scale-110 transition-transform"><IconX size={20} /></button>
            <div className={`w-full lg:w-[65%] bg-black flex items-center justify-center relative min-h-[350px] lg:min-h-0 ${activeMedia.type === 'image' && !loadedImages[activeMedia.url] ? 'animate-shimmer-bg animate-shimmer' : ''}`}>
               {activeMedia.type === 'video' ? (
                  <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYouTubeId(activeMedia.url)}?autoplay=1`} className="w-full h-full absolute inset-0" frameBorder="0" allowFullScreen></iframe>
               ) : (
                  <img 
                    src={getOptimizedUrl(activeMedia.url, 1600, 85)} 
                    alt={selectedProject.title} 
                    onLoad={() => handleImageLoad(activeMedia.url)}
                    className={`w-full h-full object-contain transition-opacity duration-500 ${loadedImages[activeMedia.url] ? 'opacity-100 blur-0' : 'opacity-0 blur-lg'}`} 
                  />
               )}
            </div>
            <div className="w-full lg:w-[35%] p-10 flex flex-col h-full bg-gray-900 overflow-y-auto custom-scrollbar">
              <h2 className="text-3xl font-bold text-white mb-6">{selectedProject.title}</h2>
              <p className="text-gray-400 text-sm mb-10 leading-relaxed">{selectedProject.description}</p>
              <div className="mt-auto space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><IconLayers size={14} /> Gallery</h4>
                 <div className="grid grid-cols-3 gap-2">
                    <img 
                      onClick={() => setActiveMedia({url: selectedProject.media_url, type: selectedProject.type})} 
                      src={getOptimizedUrl(selectedProject.thumbnail_url, 300, 70)} 
                      className={`aspect-square object-cover rounded-xl cursor-pointer border border-gray-800 hover:border-primary transition-all ${activeMedia.url === selectedProject.media_url ? 'border-primary' : ''}`} 
                    />
                    {selectedProject.media_gallery?.map((url, i) => (
                       <img 
                         key={i} 
                         onClick={() => setActiveMedia({url, type: 'image'})} 
                         src={getOptimizedUrl(url, 300, 70)} 
                         className={`aspect-square object-cover rounded-xl cursor-pointer border border-gray-800 hover:border-primary transition-all ${activeMedia.url === url ? 'border-primary' : ''}`} 
                       />
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Home;