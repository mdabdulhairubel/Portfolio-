import React, { useState, useEffect } from 'react';
import { Play, ExternalLink, X, Calendar, Tag, Info, Youtube } from 'lucide-react';
import { supabase } from '../supabase.ts';
import { Project } from '../types.ts';

const Portfolio: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (data) setProjects(data);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const getYouTubeId = (input: string) => {
    if (!input) return null;
    let target = input;
    const srcMatch = input.match(/src=["']([^"']+)["']/);
    if (srcMatch) target = srcMatch[1];

    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([^"&?\/\s]{11})/i;
    const match = target.match(regExp);
    return (match && match[1]) ? match[1] : null;
  };

  const categories = ['All', 'Graphic Design', 'Motion Graphics', 'Video Editing', 'CGI Ads'];
  const filteredProjects = filter === 'All' ? projects : projects.filter(p => p.category === filter);

  const activeVideoId = selectedProject?.type === 'video' ? getYouTubeId(selectedProject.media_url) : null;
  const embedUrl = activeVideoId ? `https://www.youtube.com/embed/${activeVideoId}?rel=0&modestbranding=1&autoplay=1` : "";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="py-24 relative overflow-hidden">
      {/* Texture Layer */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-grid-subtle opacity-40 pointer-events-none"></div>
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 opacity-0 animate-fade-up">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter">Work Showcase</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg font-medium">Explore high-end cinematic visuals and expert design solutions.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-16 opacity-0 animate-fade-in delay-200">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat)} 
              className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all ${
                filter === cat 
                  ? 'bg-primary text-gray-950 shadow-xl shadow-primary/20 scale-105' 
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Updated Grid: 4 columns on large desktops, reduced roundness to xl for a cleaner look */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProjects.map((project, idx) => (
            <div 
              key={project.id} 
              onClick={() => setSelectedProject(project)}
              className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-primary transition-all duration-500 opacity-0 animate-zoom-in shadow-xl cursor-pointer" 
              style={{ animationDelay: `${(idx % 8) * 100}ms` }}
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={project.thumbnail_url} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                
                {/* Minimalist Hover Overlay for title and category */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5 translate-y-2 group-hover:translate-y-0">
                  <span className="text-primary font-black text-[9px] uppercase tracking-[0.2em] mb-1">{project.category}</span>
                  <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">{project.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="py-32 text-center animate-fade-in">
            <div className="text-gray-600 font-bold uppercase tracking-widest text-sm">No projects in this category yet.</div>
          </div>
        )}
      </div>

      {/* Project Detail Pop-up Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] bg-gray-950/95 flex items-center justify-center p-4 md:p-8 animate-fade-in backdrop-blur-md overflow-y-auto custom-scrollbar">
          <div className="relative w-full max-w-5xl bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden animate-zoom-in flex flex-col lg:flex-row max-h-[90vh]">
            <button 
              onClick={() => setSelectedProject(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-primary transition-all p-2 bg-gray-950/50 border border-gray-800 rounded-xl z-[110]"
            >
              <X size={20} />
            </button>
            
            {/* Media Section */}
            <div className="w-full lg:w-[60%] bg-black flex items-center justify-center relative min-h-[300px] lg:min-h-0">
              {selectedProject.type === 'video' ? (
                activeVideoId ? (
                  <iframe 
                    width="100%"
                    height="100%"
                    src={embedUrl} 
                    title={selectedProject.title}
                    className="w-full h-full absolute inset-0"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video src={selectedProject.media_url} controls autoPlay className="w-full h-full object-contain"></video>
                )
              ) : (
                <img src={selectedProject.media_url} alt={selectedProject.title} className="w-full h-full object-contain" />
              )}
            </div>

            {/* Info Section */}
            <div className="w-full lg:w-[40%] p-6 md:p-10 flex flex-col h-full bg-gray-900 border-l border-gray-800 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                <Tag size={12} /> {selectedProject.category}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 tracking-tighter leading-tight">
                {selectedProject.title}
              </h2>
              
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-gray-500 mb-8 pb-6 border-b border-gray-800">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-primary" />
                  {new Date(selectedProject.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                </div>
                <div className="flex items-center gap-1.5">
                  <Info size={14} className="text-primary" />
                  {selectedProject.type.toUpperCase()}
                </div>
              </div>

              <div className="mb-10 flex-grow">
                <p className="text-gray-400 leading-relaxed text-sm font-medium">
                  {selectedProject.description || "Detailed case study of the creative process and execution for this " + selectedProject.category.toLowerCase() + " project. Focus on visual impact and narrative precision."}
                </p>
              </div>

              <div className="mt-auto space-y-3">
                <a 
                  href={selectedProject.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-primary text-gray-950 font-black rounded-xl flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
                >
                  {selectedProject.type === 'video' ? <Youtube size={20} /> : <ExternalLink size={20} />}
                  {selectedProject.type === 'video' ? 'Watch Full Project' : 'Open Full Image'}
                </a>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="w-full py-3.5 bg-gray-800 text-white font-black rounded-xl flex items-center justify-center gap-2 hover:bg-gray-700 transition-all border border-gray-700"
                >
                  Back to Showcase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;