
import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase.ts';
import { Service } from '../types.ts';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase.from('services').select('*');
      if (data) setServices(data);
      setLoading(false);
    };
    fetchServices();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Visual Solutions</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">Comprehensive creative services to transform your ideas into cinematic realities.</p>
        </div>

        <div className="space-y-32">
          {services.map((service, idx) => (
            <div key={service.id} className={`flex flex-col lg:flex-row gap-16 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="w-full lg:w-1/2">
                <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-900 border border-gray-800 group">
                  <img src={`https://picsum.photos/seed/${service.id}/800/600`} alt={service.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-primary font-bold text-6xl opacity-10">{idx + 1}</span>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">{service.title}</h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">{service.description}</p>
                <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl mb-8">
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl font-bold text-primary">{service.price}</span>
                    <span className="text-gray-500 font-medium text-sm">Starting Price</span>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {service.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3 text-gray-300">
                        <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                        <span className="text-sm font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-gray-950 font-bold rounded-full transition-all"
                >
                  Book this Service <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-40 text-center bg-gray-900 border border-gray-800 p-16 rounded-[3rem]">
           <h2 className="text-4xl md:text-5xl font-bold mb-8">Let's do something amazing together.</h2>
           <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto font-medium">Ready to elevate your project? Get in touch today for a free consultation.</p>
           <Link to="/contact" className="px-12 py-5 bg-primary text-gray-950 font-bold rounded-full text-lg hover:shadow-2xl hover:shadow-primary/20 transition-all">
             Start Your Project
           </Link>
        </div>
      </div>
    </div>
  );
};

export default Services;
