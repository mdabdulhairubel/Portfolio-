import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, ExternalLink, X, Calendar, Tag, Info, Youtube, Layers, Maximize } from 'lucide-react';
import { supabase } from '../supabase.ts';
import { Project } from '../types.ts';

/**
 * Utility to optimize Supabase URLs using their built-in image transformation service.
 * Rewrites /object/public/ to /render/image/public/ and appends resizing params.
 */
const getOptimizedUrl = (url: string, width: number = 800, quality: number = 80) => {
  if (!url || !url.includes('supabase.co') || !url.includes('/object/public/')) return url;
  return url
    .replace('/object/public/', '/render/image/public/')
    .concat(`?width=${width}&quality=${quality}`);
};

const Portfolio: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeMedia, setActiveMedia] = useState<{url: string, type: 'image' | 'video'}>({url: '', type: 'image'});
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const mediaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (data) setProjects(data);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  // Body Scroll Lock logic
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProject]);

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
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

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    setActiveMedia({ url: project.media_url, type: project.type });
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        mediaContainerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      }
    }
  };

  const handleMediaContainerClick = (e: React.MouseEvent) => {
    if (document.fullscreenElement && e.target === mediaContainerRef.current) {
      document.exitFullscreen();
    }
  };

  const categories = ['All', 'Graphic Design', 'Motion Graphics', 'Video Editing', 'CGI Ads'];
  const filteredProjects = filter === 'All' ? projects : projects.filter(p => p.category === filter);

  const activeVideoId = activeMedia.type === 'video' ? getYouTubeId(activeMedia.url) : null;
  const embedUrl = activeVideoId ? `https://www.youtube.com/embed/${activeVideoId}?rel=0&modestbranding=1&autoplay=1` : "";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="py-24 relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-grid-subtle opacity-40 pointer-events-none"></div>
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 opacity-0 animate-fade-up">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter text-white">Work Showcase</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg font-medium">Explore cinematic visuals and high-end design solutions.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-16 opacity-0 animate-fade-in">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project, idx) => {
            const isPriority = idx < 4;
            const thumbOptimized = getOptimizedUrl(project.thumbnail_url, 600, 75);
            
            return (
              <div 
                key={project.id} 
                onClick={() => handleOpenProject(project)}
                className="group relative bg-gray-950 rounded-xl overflow-hidden border border-gray-800 hover:border-primary transition-all duration-500 opacity-0 animate-zoom-in shadow-xl cursor-pointer" 
                style={{ animationDelay: `${(idx % 8) * 100}ms` }}
              >
                <div className={`relative aspect-video overflow-hidden ${!loadedImages[project.id] ? 'animate-shimmer-bg animate-shimmer' : ''}`}>
                  <img 
                    src={thumbOptimized} 
                    alt={project.title} 
                    loading={isPriority ? "eager" : "lazy"}
                    decoding="async"
                    onLoad={() => handleImageLoad(project.id)}
                    className={`w-full h-full object-cover transition-all duration-700 will-change-transform ${loadedImages[project.id] ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-md'}`} 
                  />
                  
                  {project.media_gallery && project.media_gallery.length > 0 && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-gray-950/80 backdrop-blur-md rounded-full text-white text-[9px] font-black uppercase flex items-center gap-2 border border-white/10 z-20">
                      <Layers size={10} className="text-primary" /> {project.media_gallery.length + 1} Shots
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                    <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-2">{project.category}</span>
                    <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">{project.title}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="py-32 text-center animate-fade-in">
            <div className="text-gray-600 font-bold uppercase tracking-widest text-sm">No projects in this category yet.</div>
          </div>
        )}
      </div>

      {/* Project Detail Modal - Teleported to end of body via Portal */}
      {selectedProject && createPortal(
        <div className="fixed inset-0 z-[200] bg-gray-950/98 flex items-center justify-center p-4 md:p-8 animate-fade-in backdrop-blur-md overflow-y-auto custom-scrollbar">
          <div className="relative w-full max-w-6xl bg-gray-900 rounded-xl border border-gray-800 shadow-2xl overflow-hidden animate-zoom-in flex flex-col lg:flex-row max-h-[92vh]">
            <button 
              onClick={() => setSelectedProject(null)} 
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-all p-3 bg-gray-950/80 backdrop-blur-md border border-gray-800 rounded-xl z-[210] hover:scale-110 transition-transform"
            >
              <X size={20} />
            </button>
            
            <div 
              ref={mediaContainerRef} 
              onClick={handleMediaContainerClick}
              className={`w-full lg:w-[65%] bg-black flex items-center justify-center relative min-h-[350px] lg:min-h-0 overflow-hidden group/media cursor-default ${activeMedia.type === 'image' && !loadedImages[activeMedia.url] ? 'animate-shimmer-bg animate-shimmer' : ''}`}
            >
              {activeMedia.type === 'video' ? (
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
                  <video src={activeMedia.url} controls autoPlay className="w-full h-full object-contain"></video>
                )
              ) : (
                <>
                  <img 
                    key={activeMedia.url} 
                    src={getOptimizedUrl(activeMedia.url, 1600, 85)} 
                    alt={selectedProject.title} 
                    onLoad={() => handleImageLoad(activeMedia.url)}
                    decoding="async"
                    className={`w-full h-full object-contain animate-fade-in pointer-events-auto transition-all duration-500 ${loadedImages[activeMedia.url] ? 'opacity-100 blur-0' : 'opacity-0 blur-lg'}`} 
                  />
                  
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover/media:opacity-100 transition-all z-20">
                    <button 
                      onClick={handleFullscreen}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-950/80 backdrop-blur-md border border-gray-800 rounded-xl text-white font-bold hover:bg-primary hover:text-gray-950 transition-all shadow-2xl group/fs-btn"
                    >
                      <Maximize size={16} className="group-hover/fs-btn:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Fullscreen</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="w-full lg:w-[35%] p-8 md:p-12 flex flex-col h-full bg-gray-900 border-l border-gray-800 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-3 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                {selectedProject.category}
              </div>
              <h2 className="text-3xl font-bold text-white mb-6 tracking-tighter leading-[1.1]">
                {selectedProject.title}
              </h2>
              
              <div className="flex flex-wrap items-center gap-5 text-[11px] font-bold text-gray-500 mb-8 pb-8 border-b border-gray-800">
                <div className="flex items-center gap-2 bg-gray-950 px-3 py-1.5 rounded-full border border-gray-800">
                  <Calendar size={14} className="text-primary" />
                  {new Date(selectedProject.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                </div>
                <div className="flex items-center gap-2 bg-gray-950 px-3 py-1.5 rounded-full border border-gray-800 uppercase">
                  <Info size={14} className="text-primary" />
                  {selectedProject.type}
                </div>
              </div>

              <div className="mb-10 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Layers size={14} /> Process & Detail Shots
                </h4>
                <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => setActiveMedia({ url: selectedProject.media_url, type: selectedProject.type })}
                      className={`aspect-square rounded-xl overflow-hidden border transition-all group relative ${activeMedia.url === selectedProject.media_url ? 'border-primary ring-2 ring-primary/20' : 'border-gray-800 hover:border-primary/50'} ${!loadedImages[selectedProject.thumbnail_url] ? 'animate-shimmer-bg animate-shimmer' : ''}`}
                    >
                        <img 
                          src={getOptimizedUrl(selectedProject.thumbnail_url, 300, 70)} 
                          onLoad={() => handleImageLoad(selectedProject.thumbnail_url)}
                          className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${loadedImages[selectedProject.thumbnail_url] ? 'opacity-100' : 'opacity-0'}`} 
                        />
                        {selectedProject.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Play size={16} fill="white" className="text-white" />
                          </div>
                        )}
                    </button>

                    {selectedProject.media_gallery?.map((url, i) => (
                      <button 
                        key={i} 
                        onClick={() => setActiveMedia({ url, type: 'image' })}
                        className={`aspect-square rounded-xl overflow-hidden border transition-all group relative ${activeMedia.url === url ? 'border-primary ring-2 ring-primary/20' : 'border-gray-800 hover:border-primary/50'} ${!loadedImages[url] ? 'animate-shimmer-bg animate-shimmer' : ''}`}
                      >
                          <img 
                            src={getOptimizedUrl(url, 300, 70)} 
                            onLoad={() => handleImageLoad(url)}
                            className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${loadedImages[url] ? 'opacity-100' : 'opacity-0'}`} 
                          />
                      </button>
                    ))}
                </div>
              </div>

              <div className="mb-10 flex-grow">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Project Narrative</h4>
                <p className="text-gray-400 leading-relaxed text-sm font-medium">
                  {selectedProject.description || "A showcase of high-end visual storytelling, focusing on cinematic impact and brand narrative."}
                </p>
              </div>

              <div className="mt-auto pt-8 border-t border-gray-800 space-y-4">
                <a 
                  href={selectedProject.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-primary text-gray-950 font-black rounded-xl flex items-center justify-center gap-3 hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
                >
                  {selectedProject.type === 'video' ? <Youtube size={22} /> : <ExternalLink size={22} />}
                  View Full Output
                </a>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Portfolio;