import React, { useEffect, useState } from 'react';
import { Play, Calendar, Award, Cpu, ArrowRight } from 'lucide-react';
import { supabase } from '../supabase.ts';
import { SiteConfig } from '../types.ts';

const About: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase.from('site_config').select('*').single();
      if (data) setConfig(data);
      setLoading(false);
    };
    fetchConfig();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="py-24 space-y-32 overflow-hidden relative animate-fade-in">
      {/* Intro Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute -top-10 -left-10 w-full h-full bg-grid-subtle opacity-20 pointer-events-none -z-10"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative opacity-0 animate-zoom-in">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/10 border border-gray-800">
              <img 
                src={config?.profile_pic_url || 'https://picsum.photos/800/1000'} 
                alt="Md Abdul Hai" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-3xl p-6 hidden md:flex flex-col justify-center items-center shadow-2xl">
              <span className="text-4xl font-bold text-primary">5+</span>
              <span className="text-sm text-gray-400 text-center font-black uppercase tracking-widest mt-2">Years Exp</span>
            </div>
          </div>
          <div className="opacity-0 animate-fade-up delay-200">
            <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Visualizer & Motion Designer</span>
            <h1 className="text-5xl md:text-6xl font-bold mb-8 tracking-tighter">Meet Md Abdul Hai</h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              {config?.bio || 'Professional visual storyteller based in Bangladesh, dedicated to pushing the boundaries of graphic and motion design.'}
            </p>
            {config?.about_video_url && (
              <a 
                href={config.about_video_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 border border-gray-800 rounded-full text-white font-bold hover:bg-gray-800 transition-all group backdrop-blur-sm"
              >
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-gray-950 group-hover:scale-110 transition-transform">
                  <Play size={20} fill="currentColor" />
                </div>
                Watch Intro Video
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Skills & Timeline Section */}
      <section className="bg-gray-900/30 py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            {/* Technical Prowess */}
            <div 
              className="opacity-0" 
              data-scroll 
              data-scroll-animation="animate-fade-up"
            >
              <h2 className="text-3xl font-bold mb-10 tracking-tight flex items-center gap-3">
                <Cpu className="text-primary" /> Technical Prowess
              </h2>
              <div className="space-y-8">
                {config?.skills?.map((skill, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-gray-200 group-hover:text-primary transition-colors">{skill.name}</span>
                      <span className="text-primary font-bold">{skill.level}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-800/50 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,219,154,0.4)]" 
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div 
              className="opacity-0" 
              data-scroll 
              data-scroll-animation="animate-fade-up"
              style={{ transitionDelay: '200ms' }}
            >
              <h2 className="text-3xl font-bold mb-10 tracking-tight flex items-center gap-3">
                <Calendar className="text-primary" /> Professional Journey
              </h2>
              <div className="space-y-12">
                {config?.experience_timeline?.map((item, idx) => (
                  <div key={idx} className="relative pl-8 border-l border-gray-800 group">
                    <div className="absolute left-[-5px] top-0 w-[11px] h-[11px] bg-primary rounded-full shadow-[0_0_10px_rgba(0,219,154,0.6)] group-hover:scale-125 transition-transform duration-300"></div>
                    <span className="text-xs font-black text-primary mb-2 block tracking-widest uppercase">{item.year}</span>
                    <h4 className="text-xl font-bold mb-1 text-white group-hover:translate-x-1 transition-transform">{item.title}</h4>
                    <p className="text-gray-500 mb-4 font-bold text-sm uppercase tracking-wider">{item.company}</p>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-md">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Software Tools */}
      <section 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative py-12 opacity-0"
        data-scroll
        data-scroll-animation="animate-fade-up"
      >
        <div className="absolute inset-0 bg-grid-subtle opacity-30 -z-10 pointer-events-none"></div>
        <h2 className="text-3xl font-bold mb-16 tracking-tighter">Production Stack</h2>
        <div className="flex flex-wrap justify-center gap-12">
          {(!config?.tools || config.tools.length === 0) ? ['After Effects', 'Premiere Pro', 'Photoshop', 'Illustrator', 'Blender', 'Cinema 4D'].map((name, idx) => (
             <div key={name} className="group flex flex-col items-center gap-4">
               <div className="w-20 h-20 bg-gray-900 border border-gray-800 rounded-3xl flex items-center justify-center p-4 group-hover:border-primary group-hover:scale-110 transition-all shadow-xl">
                 <div className="w-full h-full bg-primary/10 rounded flex items-center justify-center text-primary font-bold text-xl">{name[0]}</div>
               </div>
               <span className="text-sm font-black text-gray-500 group-hover:text-white transition-colors uppercase tracking-widest">{name}</span>
             </div>
          )) : config.tools.map((tool, idx) => (
            <div key={idx} className="group flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gray-900 border border-gray-800 rounded-3xl flex items-center justify-center p-4 group-hover:border-primary group-hover:scale-110 transition-all shadow-xl">
                <img src={tool.icon_url} alt={tool.name} className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-black text-gray-500 group-hover:text-white transition-colors uppercase tracking-widest">{tool.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;