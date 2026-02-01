
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Play, ExternalLink, ArrowRight, Star } from 'lucide-react';
import { supabase } from '../supabase';
import { Service, Project, Testimonial, BrandLogo, SiteConfig } from '../types';

const Home: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [logos, setLogos] = useState<BrandLogo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mouse interaction state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const heroImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [
        { data: siteData },
        { data: srvData },
        { data: projData },
        { data: testData },
        { data: logoData }
      ] = await Promise.all([
        supabase.from('site_config').select('*').single(),
        supabase.from('services').select('*').limit(3),
        supabase.from('projects').select('*').eq('is_featured', true).limit(4),
        supabase.from('testimonials').select('*'),
        supabase.from('brand_logos').select('*')
      ]);

      if (siteData) setConfig(siteData);
      if (srvData) setServices(srvData);
      if (projData) setProjects(projData);
      if (testData) setTestimonials(testData);
      if (logoData) setLogos(logoData);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroImageRef.current) return;
    const rect = heroImageRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Limit the rotation angle
    const rotateX = (mouseY / (rect.height / 2)) * -15; // Max 15 degrees
    const rotateY = (mouseX / (rect.width / 2)) * 15; // Max 15 degrees
    
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-24 pb-24 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-500"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left opacity-0 animate-fade-up">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                Available for New Projects
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-6">
                {config?.hero_title || 'Crafting Digital Experiences'}
              </h1>
              <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {config?.hero_subtitle || 'Md Abdul Hai — Visualizer specializing in high-end Motion Graphics and Video Production.'}
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Link to="/contact" className="px-8 py-4 bg-primary hover:bg-primary-hover text-gray-950 font-bold rounded-full transition-all flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105">
                  Hire Me Now <ArrowRight size={20} />
                </Link>
                <Link to="/portfolio" className="px-8 py-4 bg-gray-900 border border-gray-800 hover:border-primary text-white font-bold rounded-full transition-all flex items-center gap-2 hover:bg-gray-800">
                  View Portfolio
                </Link>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end opacity-0 animate-zoom-in delay-200">
              <div 
                ref={heroImageRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  transition: tilt.x === 0 && tilt.y === 0 ? 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)' : 'transform 0.1s ease-out',
                }}
                className="relative w-full max-w-md aspect-[4/5] cursor-pointer group"
              >
                {/* Parallax Background Layers */}
                <div className="absolute -top-6 -right-6 w-32 h-32 border-t-4 border-r-4 border-primary rounded-tr-3xl group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 border-b-4 border-l-4 border-primary rounded-bl-3xl group-hover:-translate-x-2 group-hover:translate-y-2 transition-transform duration-300"></div>
                
                {/* Main Image Wrapper */}
                <div className="w-full h-full rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative z-10 bg-gray-900">
                  {config?.hero_image_url ? (
                    <img 
                      src={config.hero_image_url} 
                      alt="Md Abdul Hai" 
                      className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Star className="text-gray-800 w-24 h-24" />
                    </div>
                  )}
                  
                  {/* Glassmorphism Badge */}
                  <div 
                    className="absolute bottom-6 left-6 right-6 p-4 bg-gray-950/60 backdrop-blur-md border border-white/10 rounded-2xl transition-transform duration-300 group-hover:translate-z-10"
                    style={{ transform: 'translateZ(20px)' }}
                  >
                    <div className="flex justify-between items-center text-left">
                      <div>
                        <p className="text-white font-bold text-sm">Md Abdul Hai</p>
                        <p className="text-primary text-[10px] font-bold uppercase tracking-widest">Visualizer & Editor</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <Star size={14} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Glow */}
                <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-2xl -z-10 group-hover:bg-primary/10 transition-colors"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-up">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">My Services</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Expert solutions tailored to elevate your brand's visual storytelling.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div key={service.id} className={`group p-8 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-primary transition-all opacity-0 animate-fade-up`} style={{ animationDelay: `${idx * 150}ms` }}>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Star size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4">{service.title}</h3>
              <p className="text-gray-400 mb-6 line-clamp-3">{service.description}</p>
              <Link to="/services" className="text-primary font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Learn More <ChevronRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="bg-gray-900/30 py-24 opacity-0 animate-fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Featured Projects</h2>
              <p className="text-gray-400">A hand-picked selection of my best work.</p>
            </div>
            <Link to="/portfolio" className="hidden md:flex items-center gap-2 text-primary font-semibold">
              View All Projects <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, idx) => (
              <Link to="/portfolio" key={project.id} className="group relative overflow-hidden rounded-2xl aspect-video bg-gray-800 opacity-0 animate-zoom-in" style={{ animationDelay: `${idx * 200}ms` }}>
                <img src={project.thumbnail_url || 'https://picsum.photos/800/600'} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                  <span className="text-primary text-sm font-semibold mb-2 uppercase tracking-wider">{project.category}</span>
                  <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                  <div className="flex items-center gap-2 text-gray-300">View Project <ChevronRight size={16} /></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Logos */}
      <section className="py-12 bg-gray-950 overflow-hidden border-y border-gray-900 opacity-0 animate-fade-in">
        <div className="marquee">
          <div className="marquee-content">
            {logos.concat(logos).map((logo, idx) => (
              <div key={idx} className="flex items-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all px-8">
                <img src={logo.image_url} alt={logo.name} className="h-10 w-auto object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-up">
        <div className="relative rounded-[2rem] bg-primary p-12 md:p-24 overflow-hidden shadow-2xl shadow-primary/10">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent"></div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-950 mb-8">Ready to start your next masterpiece?</h2>
            <p className="text-xl text-gray-950/80 mb-10 font-medium">Let's collaborate and bring your vision to life with stunning visuals and creative excellence.</p>
            <Link to="/contact" className="inline-flex items-center gap-3 px-10 py-5 bg-gray-950 text-white font-bold rounded-full hover:shadow-xl transition-all text-lg hover:scale-105">
              Let's Talk <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
