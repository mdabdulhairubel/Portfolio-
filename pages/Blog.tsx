import React, { useEffect, useState } from 'react';
import { Calendar, User, ArrowRight, ChevronRight } from 'lucide-react';
import { supabase } from '../supabase.ts';
import { BlogPost } from '../types.ts';

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      if (data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="text-center mb-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Creative Insights</h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">Articles about design, motion, and the future of visual storytelling.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {posts.map((post) => (
          <article key={post.id} className="group flex flex-col bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden hover:border-primary transition-all">
            <div className="aspect-[16/10] overflow-hidden">
              <img 
                src={post.image_url || 'https://picsum.photos/seed/blog/800/500'} 
                alt={post.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <div className="flex items-center gap-4 mb-6 text-xs font-bold uppercase tracking-widest text-primary">
                <span className="bg-primary/10 px-3 py-1 rounded-full">{post.category}</span>
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar size={14} />
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-primary transition-colors">{post.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-3">
                {post.content.substring(0, 150)}...
              </p>
              <div className="mt-auto">
                <button className="flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all">
                  Read Article <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </article>
        ))}
        {posts.length === 0 && (
           <div className="col-span-full py-24 text-center">
             <div className="text-gray-600 mb-4">No posts found.</div>
             <p className="text-gray-400">Stay tuned for amazing content!</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default Blog;