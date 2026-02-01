
import React, { useState, useEffect } from 'react';
import { Play, ExternalLink, X } from 'lucide-react';
import { supabase } from '../supabase';
import { Project } from '../types';

const Portfolio: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const categories = ['All', 'Graphic Design', 'Motion Graphics', 'Video Editing', 'CGI Ads'];

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (data) setProjects(data);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => p.category === filter);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="text-center mb-20 opacity-0 animate-fade-up">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Work Showcase</h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">Explore a selection of my latest projects across various creative disciplines.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-16 opacity-0 animate-fade-in delay-200">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-3 rounded-full font-bold transition-all ${
              filter === cat 
                ? 'bg-primary text-gray-950 shadow-lg shadow-primary/30' 
                : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project, idx) => (
          <div 
            key={project.id} 
            className="group bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden hover:border-primary transition-all flex flex-col opacity-0 animate-zoom-in"
            style={{ animationDelay: `${(idx % 6) * 100}ms` }}
          >
            <div className="relative aspect-video overflow-hidden">
              <img 
                src={project.thumbnail_url || 'https://picsum.photos/600/400'} 
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gray-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {project.type === 'video' ? (
                  <button 
                    onClick={() => setSelectedVideo(project.media_url)}
                    className="w-16 h-16 bg-primary text-gray-950 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform shadow-xl"
                  >
                    <Play size={32} fill="currentColor" />
                  </button>
                ) : (
                  <a 
                    href={project.media_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-16 h-16 bg-primary text-gray-950 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform shadow-xl"
                  >
                    <ExternalLink size={32} />
                  </a>
                )}
              </div>
            </div>
            <div className="p-6">
              <span className="text-primary text-xs font-bold uppercase tracking-widest mb-2 block">
                {project.category}
              </span>
              <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
              <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">{project.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] bg-gray-950/95 flex items-center justify-center p-4 animate-fade-in">
          <button 
            onClick={() => setSelectedVideo(null)}
            className="absolute top-6 right-6 text-white hover:text-primary p-2 transition-colors"
          >
            <X size={32} />
          </button>
          <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 animate-zoom-in">
             {selectedVideo.includes('youtube.com') || selectedVideo.includes('youtu.be') ? (
               <iframe 
                 src={selectedVideo.replace('watch?v=', 'embed/')} 
                 className="w-full h-full"
                 allowFullScreen
               ></iframe>
             ) : (
               <video src={selectedVideo} controls className="w-full h-full"></video>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
